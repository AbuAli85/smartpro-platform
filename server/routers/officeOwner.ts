import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const officeOwnerRouter = router({
  // Get offices owned by the current user
  getMyOffices: protectedProcedure.query(async ({ ctx }) => {
    const offices = await db.getOfficesByOwner(ctx.user.id);
    return offices;
  }),

  // Get bookings for a specific office
  getOfficeBookings: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getOfficeBookingsForOwner(input.officeId);
    }),

  // Toggle office status (active/inactive)
  toggleOfficeStatus: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      isAvailable: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.toggleOfficeStatus(input.officeId, input.isAvailable);
    }),

  // Get office performance metrics
  getOfficeMetrics: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getOwnerOfficeMetrics(input.officeId);
    }),

  // Get office reviews
  getOfficeReviews: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getOfficeReviews(input.officeId);
    }),

  // Respond to a review
  respondToReview: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
      response: z.string().min(1).max(1000),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get the review to verify ownership
      const review = await db.getReviewById(input.reviewId);
      
      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === review.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.addOwnerResponseToReview(input.reviewId, input.response);
    }),
});
