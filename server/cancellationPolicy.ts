/**
 * Cancellation Policy Logic
 * Handles booking cancellations with refund and penalty calculations
 */

import { getDb } from "./db";
import { bookings, sanadOffices } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface CancellationResult {
  allowed: boolean;
  reason?: string;
  refundAmount: number;
  penaltyAmount: number;
  penaltyPercent: number;
}

/**
 * Calculate cancellation refund and penalty
 */
export async function calculateCancellation(
  bookingId: number,
  userId: number
): Promise<CancellationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get booking details
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);

  if (!booking) {
    return {
      allowed: false,
      reason: "Booking not found",
      refundAmount: 0,
      penaltyAmount: 0,
      penaltyPercent: 0,
    };
  }

  // Check if user owns the booking
  if (booking.userId !== userId) {
    return {
      allowed: false,
      reason: "You are not authorized to cancel this booking",
      refundAmount: 0,
      penaltyAmount: 0,
      penaltyPercent: 0,
    };
  }

  // Check if booking is already cancelled or completed
  if (booking.status === "cancelled") {
    return {
      allowed: false,
      reason: "Booking is already cancelled",
      refundAmount: 0,
      penaltyAmount: 0,
      penaltyPercent: 0,
    };
  }

  if (booking.status === "completed") {
    return {
      allowed: false,
      reason: "Cannot cancel a completed booking",
      refundAmount: 0,
      penaltyAmount: 0,
      penaltyPercent: 0,
    };
  }

  // Get office cancellation policy
  const [office] = await db.select().from(sanadOffices).where(eq(sanadOffices.id, booking.officeId)).limit(1);

  if (!office) {
    return {
      allowed: false,
      reason: "Office not found",
      refundAmount: 0,
      penaltyAmount: 0,
      penaltyPercent: 0,
    };
  }

  const cancellationWindowHours = office.cancellationWindowHours || 24;
  const penaltyPercent = office.cancellationPenaltyPercent || 0;

  // Check if booking has a scheduled date
  if (!booking.scheduledDate) {
    // No scheduled date yet, allow full refund
    const bookingPrice = parseFloat(booking.price || "0");
    return {
      allowed: true,
      refundAmount: bookingPrice,
      penaltyAmount: 0,
      penaltyPercent: 0,
    };
  }

  // Calculate hours until appointment
  const now = new Date();
  const scheduledDate = new Date(booking.scheduledDate);
  const hoursUntilAppointment = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Check if within cancellation window
  if (hoursUntilAppointment < cancellationWindowHours) {
    return {
      allowed: false,
      reason: `Cancellation must be made at least ${cancellationWindowHours} hours before the appointment`,
      refundAmount: 0,
      penaltyAmount: 0,
      penaltyPercent: 0,
    };
  }

  // Calculate refund and penalty
  const bookingPrice = parseFloat(booking.price || "0");
  const penaltyAmount = (bookingPrice * penaltyPercent) / 100;
  const refundAmount = bookingPrice - penaltyAmount;

  return {
    allowed: true,
    refundAmount,
    penaltyAmount,
    penaltyPercent,
  };
}

/**
 * Process booking cancellation
 */
export async function cancelBooking(
  bookingId: number,
  userId: number,
  reason: string
): Promise<{ success: boolean; message: string; result?: CancellationResult }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate cancellation
  const cancellationResult = await calculateCancellation(bookingId, userId);

  if (!cancellationResult.allowed) {
    return {
      success: false,
      message: cancellationResult.reason || "Cancellation not allowed",
    };
  }

  // Update booking status
  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancellationReason: reason,
      cancelledBy: userId,
      cancelledAt: new Date().toISOString(),
      cancellationPenalty: cancellationResult.penaltyAmount.toString(),
      refundAmount: cancellationResult.refundAmount.toString(),
      paymentStatus: cancellationResult.refundAmount > 0 ? "refunded" : "unpaid",
    })
    .where(eq(bookings.id, bookingId));

  return {
    success: true,
    message: "Booking cancelled successfully",
    result: cancellationResult,
  };
}
