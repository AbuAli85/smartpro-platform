import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getBookingAnalytics,
  calculateBookingConversionRate,
  getPopularTimeSlots,
  getCancellationPatterns,
  getBookingMetricsSummary,
  trackOfficeView,
  isOfficeStaff,
} from "../db";

export const bookingAnalyticsRouter = router({
  /**
   * Get booking analytics for a specific office and date range
   */
  getAnalytics: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify user has access to this office
      const hasAccess = await isOfficeStaff(input.officeId, ctx.user.id);
      if (!hasAccess) {
        throw new Error("You do not have access to this office");
      }

      return await getBookingAnalytics(input.officeId, input.startDate, input.endDate);
    }),

  /**
   * Get conversion rate metrics
   */
  getConversionRate: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify user has access to this office
      const hasAccess = await isOfficeStaff(input.officeId, ctx.user.id);
      if (!hasAccess) {
        throw new Error("You do not have access to this office");
      }

      return await calculateBookingConversionRate(input.officeId, input.startDate, input.endDate);
    }),

  /**
   * Get popular time slots
   */
  getPopularTimeSlots: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify user has access to this office
      const hasAccess = await isOfficeStaff(input.officeId, ctx.user.id);
      if (!hasAccess) {
        throw new Error("You do not have access to this office");
      }

      return await getPopularTimeSlots(input.officeId, input.startDate, input.endDate);
    }),

  /**
   * Get cancellation patterns
   */
  getCancellationPatterns: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify user has access to this office
      const hasAccess = await isOfficeStaff(input.officeId, ctx.user.id);
      if (!hasAccess) {
        throw new Error("You do not have access to this office");
      }

      return await getCancellationPatterns(input.officeId, input.startDate, input.endDate);
    }),

  /**
   * Get comprehensive booking metrics summary
   */
  getMetricsSummary: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify user has access to this office
      const hasAccess = await isOfficeStaff(input.officeId, ctx.user.id);
      if (!hasAccess) {
        throw new Error("You do not have access to this office");
      }

      return await getBookingMetricsSummary(input.officeId, input.days);
    }),

  /**
   * Track office page view (for conversion rate calculation)
   */
  trackView: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await trackOfficeView(input.officeId);
      return { success: true };
    }),
});
