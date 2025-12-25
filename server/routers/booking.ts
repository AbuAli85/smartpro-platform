import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const bookingRouter = router({
  // Create a new booking
  create: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        serviceId: z.number().optional(),
        serviceDescription: z.string().min(10, "Please describe the service you need"),
        requirements: z.string().optional(),
        preferredDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify office exists
      const office = await db.getSanadOfficeById(input.officeId);

      if (!office || office.status !== "active") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Office not found or not active",
        });
      }

      // Create the booking
      const bookingId = await db.createBooking({
        officeId: input.officeId,
        serviceId: input.serviceId,
        userId: user.id,
        serviceDescription: input.serviceDescription,
        requirements: input.requirements,
        preferredDate: input.preferredDate,
        status: office.autoAcceptBookings ? "confirmed" : "pending",
      });

      await db.logActivity({
        userId: user.id,
        action: "created",
        entityType: "booking",
        entityId: bookingId,
        description: `Created booking at ${office.officeName}`,
      });

      return { id: bookingId };
    }),

  // Get user's bookings
  getMyBookings: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    return await db.getUserBookings(user.id);
  }),

  // Get office bookings (for office staff)
  getOfficeBookings: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Check if user has access to this office
      const staff = await db.getUserOfficeRole(user.id, input.officeId);

      if (!staff) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this office",
        });
      }

      return await db.getOfficeBookings(input.officeId);
    }),

  // Update booking status
  updateStatus: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Get the booking
      const booking = await db.getBookingById(input.bookingId);

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Check if user has permission (office staff or booking owner)
      const isOwner = booking.userId === user.id;
      const staff = await db.getUserOfficeRole(user.id, booking.officeId);

      if (!isOwner && !staff) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this booking",
        });
      }

      // Update the booking
      await db.updateBooking(input.bookingId, {
        status: input.status,
        notes: input.notes,
        completedDate: input.status === "completed" ? new Date() : undefined,
      });

      await db.logActivity({
        userId: user.id,
        action: "updated",
        entityType: "booking",
        entityId: input.bookingId,
        description: `Updated booking status to ${input.status}`,
      });

      return { success: true };
    }),
});

export const reviewRouter = router({
  // Create a review
  create: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        bookingId: z.number().optional(),
        rating: z.number().int().min(1).max(5),
        reviewText: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify office exists
      const office = await db.getSanadOfficeById(input.officeId);

      if (!office) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Office not found",
        });
      }

      // Create the review
      const reviewId = await db.createReview({
        officeId: input.officeId,
        bookingId: input.bookingId,
        userId: user.id,
        rating: input.rating,
        reviewText: input.reviewText,
        isVisible: true,
      });

      await db.logActivity({
        userId: user.id,
        action: "created",
        entityType: "review",
        entityId: reviewId,
        description: `Reviewed ${office.officeName}`,
      });

      return { id: reviewId };
    }),

  // Get office reviews
  getOfficeReviews: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOfficeReviews(input.officeId);
    }),
});
