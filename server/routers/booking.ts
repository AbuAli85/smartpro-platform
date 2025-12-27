import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { notifyOwner } from "../_core/notification";
import { sendBilingualEmail, getUserLanguage } from "../_core/emailNotifications";
import { sendBilingualSMS } from "../_core/smsNotifications";
import { generateBookingCalendarInvite } from "../_core/calendarInvite";
import { calculateCancellation, cancelBooking } from "../cancellationPolicy";
import { emitBookingNotification } from "../_core/notifications";

export const bookingRouter = router({
  // Get available time slots for a specific date
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        officeId: z.number(),
        date: z.string(), // ISO date string
      })
    )
    .query(async ({ input }) => {
      const date = new Date(input.date);
      const slots = await db.getAvailableTimeSlots(input.officeId, date);
      return slots;
    }),

  // Create a new booking
  create: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        serviceId: z.number().optional(),
        serviceDescription: z.string().min(10, "Please describe the service you need"),
        requirements: z.string().optional(),
        preferredDate: z.date().optional(),
        scheduledDate: z.string().optional(), // ISO date string
        scheduledTime: z.string().optional(), // e.g., "09:00"
        duration: z.number().default(60),
        usePoints: z.boolean().optional(),
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

      // If scheduled date/time provided, verify availability
      if (input.scheduledDate && input.scheduledTime) {
        const date = new Date(input.scheduledDate);
        const slots = await db.getAvailableTimeSlots(input.officeId, date);
        const requestedSlot = slots.find((s) => s.time === input.scheduledTime);

        if (!requestedSlot || !requestedSlot.available) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This time slot is no longer available",
          });
        }
      }

      // Create the booking
      const bookingId = await db.createBooking({
        officeId: input.officeId,
        serviceId: input.serviceId,
        userId: user.id,
        serviceDescription: input.serviceDescription,
        requirements: input.requirements,
        preferredDate: input.preferredDate,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : undefined,
        scheduledTime: input.scheduledTime,
        duration: input.duration,
        status: office.autoAcceptBookings ? "confirmed" : "pending",
      });

      await db.logActivity({
        userId: user.id,
        action: "created",
        entityType: "booking",
        entityId: bookingId,
        description: `Created booking at ${office.officeName}`,
      });

      // Send notification to platform owner
      await notifyOwner({
        title: "New Booking Created",
        content: `${user.name} created a booking at ${office.officeName} for ${input.scheduledDate ? new Date(input.scheduledDate).toLocaleDateString() : 'unscheduled date'}`,
      });

      // Emit real-time notification to office owner
      emitBookingNotification("booking_created", office.ownerId, {
        bookingId,
        customerName: user.name,
        officeName: office.officeName,
        scheduledDate: input.scheduledDate,
        scheduledTime: input.scheduledTime,
        serviceDescription: input.serviceDescription,
      });

      // Redeem points if requested
      if (input.usePoints) {
        try {
          await db.redeemPoints({
            userId: user.id,
            points: 100,
            reason: "Booking discount (100 points = 5 OMR)",
            bookingId,
          });

          // Create notification for points redemption
          await db.createNotification({
            userId: user.id,
            type: "points",
            title: "Points Redeemed",
            message: "You redeemed 100 points for 5 OMR discount on your booking",
            bookingId,
            actionUrl: `/bookings`,
          });
        } catch (error) {
          console.error("Failed to redeem points:", error);
          // Don't fail the booking if points redemption fails
        }
      }

      // Send bilingual email confirmation to user with calendar invite
      if (user.email && input.scheduledDate && input.scheduledTime) {
        const userLanguage = getUserLanguage(user.preferredLanguage);
        
        // Generate calendar invite
        const appointmentDateTime = new Date(input.scheduledDate);
        const [hours, minutes] = input.scheduledTime.split(':').map(Number);
        appointmentDateTime.setHours(hours, minutes, 0, 0);
        
        // Get service name for calendar invite
        let serviceName = input.serviceDescription;
        if (input.serviceId) {
          const service = await db.getServiceById(input.serviceId);
          if (service) {
            serviceName = service.serviceName;
          }
        }
        
        const calendarInvite = generateBookingCalendarInvite({
          bookingId,
          serviceName,
          officeName: office.officeName,
          officeAddress: `${office.wilayat}, ${office.governorate}`,
          officePhone: office.phone || '',
          appointmentDate: appointmentDateTime,
          durationMinutes: input.duration,
          userName: user.name || 'User',
          userEmail: user.email,
          officeEmail: office.email || 'noreply@smartpro.om',
        });
        
        await sendBilingualEmail(
          user.email,
          "bookingConfirmation",
          {
            customerName: user.name || "User",
            officeName: office.officeName,
            bookingDate: appointmentDateTime.toLocaleDateString(),
            bookingTime: input.scheduledTime,
            bookingId: bookingId.toString(),
          },
          userLanguage,
          [
            {
              filename: `booking-${bookingId}.ics`,
              content: Buffer.from(calendarInvite).toString('base64'),
              contentType: 'text/calendar',
            },
          ]
        );
      } else if (user.email) {
        // Send email without calendar invite if date/time not provided
        const userLanguage = getUserLanguage(user.preferredLanguage);
        await sendBilingualEmail(
          user.email,
          "bookingConfirmation",
          {
            customerName: user.name || "User",
            officeName: office.officeName,
            bookingDate: input.scheduledDate ? new Date(input.scheduledDate).toLocaleDateString() : "TBD",
            bookingTime: input.scheduledTime || "TBD",
            bookingId: bookingId.toString(),
          },
          userLanguage
        );
      }

      // Create notification for booking confirmation
      await db.createNotification({
        userId: user.id,
        type: "booking",
        title: "Booking Confirmed",
        message: `Your booking at ${office.officeName} has been ${office.autoAcceptBookings ? 'confirmed' : 'submitted for review'}`,
        bookingId,
        actionUrl: `/bookings`,
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

      // Award loyalty points when booking is completed (10 points)
      if (input.status === "completed") {
        try {
          const office = await db.getSanadOfficeById(booking.officeId);
          await db.awardPoints({
            userId: booking.userId,
            points: 10,
            reason: `Booking completed at ${office?.officeName || "office"}`,
            bookingId: input.bookingId,
          });

          // Create notification for points earned
          await db.createNotification({
            userId: booking.userId,
            type: "points",
            title: "Points Earned!",
            message: "You earned 10 loyalty points for completing your booking",
            bookingId: input.bookingId,
            actionUrl: `/loyalty`,
          });

          // Check and complete referral if this is the first booking
          const userBookings = await db.getUserBookings(booking.userId);
          const completedBookings = userBookings.filter(b => b.status === "completed");
          if (completedBookings.length === 1) {
            // This is the first completed booking
            const referralCompleted = await db.completeReferral(booking.userId, input.bookingId);
            if (referralCompleted) {
              // Notification for referral completion is created in completeReferral function
              console.log("Referral completed for user", booking.userId);
            }
          }
        } catch (error) {
          console.error("Failed to award loyalty points for completed booking:", error);
        }
      }

      // Create notification for status change
      await db.createNotification({
        userId: booking.userId,
        type: "booking",
        title: "Booking Status Updated",
        message: `Your booking status has been updated to ${input.status}`,
        bookingId: input.bookingId,
        actionUrl: `/bookings`,
      });

      // Send bilingual SMS notification for status update
      try {
        const bookingUser = await db.getUserById(booking.userId);
        const office = await db.getSanadOfficeById(booking.officeId);
        if (bookingUser?.phone && office) {
          const userLanguage = getUserLanguage(bookingUser.preferredLanguage);
          await sendBilingualSMS(
            bookingUser.phone,
            "statusUpdate",
            {
              customerName: bookingUser.name || "Customer",
              serviceName: booking.serviceDescription || "Service",
              status: input.status,
            },
            userLanguage
          );
        }
      } catch (error) {
        console.error("Failed to send status update SMS:", error);
      }

      return { success: true };
    }),

  // Create a review
  createReview: protectedProcedure
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

      // Award loyalty points for review (5 points)
      try {
        await db.awardPoints({
          userId: user.id,
          points: 5,
          reason: `Review submitted for ${office.officeName}`,
          reviewId: reviewId,
        });

        // Create notification for points earned
        await db.createNotification({
          userId: user.id,
          type: "points",
          title: "Points Earned!",
          message: "You earned 5 loyalty points for submitting a review",
          reviewId: reviewId,
          actionUrl: `/loyalty`,
        });
      } catch (error) {
        console.error("Failed to award loyalty points for review:", error);
      }

      return { id: reviewId };
    }),

  // Get office reviews with photos and vote counts
  getOfficeReviews: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOfficeReviewsWithDetails(input.officeId);
    }),

  // Upload review photo
  uploadReviewPhoto: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        photoBase64: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      
      // Verify user owns the review
      const review = await db.getReviewById(input.reviewId);
      if (!review || review.userId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only upload photos to your own reviews",
        });
      }

      // Upload to S3
      const { storagePut } = await import("../storage");
      const buffer = Buffer.from(input.photoBase64, "base64");
      const fileKey = `reviews/${input.reviewId}/${Date.now()}.${input.mimeType.split("/")[1]}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Save to database
      const photoId = await db.createReviewPhoto({
        reviewId: input.reviewId,
        photoUrl: url,
        photoKey: fileKey,
      });

      return { id: photoId, url };
    }),

  // Vote on review (helpful/not helpful)
  voteOnReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        voteType: z.enum(["helpful", "not_helpful"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      
      // Check if user already voted
      const existingVote = await db.getUserReviewVote(input.reviewId, user.id);
      
      if (existingVote) {
        // Update existing vote
        await db.updateReviewVote(existingVote.id, input.voteType);
      } else {
        // Create new vote
        await db.createReviewVote({
          reviewId: input.reviewId,
          userId: user.id,
          voteType: input.voteType,
        });
      }

      return { success: true };
    }),

  // Get review vote counts
  getReviewVotes: publicProcedure
    .input(z.object({ reviewId: z.number() }))
    .query(async ({ input }) => {
      return await db.getReviewVoteCounts(input.reviewId);
    }),

  // Reply to a review (office owner)
  replyToReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        responseText: z.string().min(10, "Response must be at least 10 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Get the review and verify office ownership
      const review = await db.getReviewById(input.reviewId);
      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      const office = await db.getOfficeById(review.officeId);
      if (!office || office.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only reply to reviews for your own office",
        });
      }

      // Update the review with response
      await db.addOwnerResponseToReview(input.reviewId, input.responseText);

      return { success: true };
    }),

  // Calculate cancellation refund/penalty
  calculateCancellation: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;
      return await calculateCancellation(input.bookingId, user.id);
    }),

  // Cancel booking
  cancelBooking: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        reason: z.string().min(10, "Please provide a cancellation reason"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      const result = await cancelBooking(input.bookingId, user.id, input.reason);

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.message,
        });
      }

      // Log activity
      await db.logActivity({
        userId: user.id,
        action: "cancelled",
        entityType: "booking",
        entityId: input.bookingId,
        description: `Cancelled booking #${input.bookingId}`,
      });

      // Notify owner
      await notifyOwner({
        title: "Booking Cancelled",
        content: `Booking #${input.bookingId} has been cancelled. Refund: ${result.result?.refundAmount} OMR`,
      });

      return result;
    }),
});
