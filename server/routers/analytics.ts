import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const analyticsRouter = router({
  // Get booking trends over time
  bookingTrends: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
      })
    )
    .query(async ({ input }) => {
      return await db.getBookingTrends(input);
    }),

  // Get popular services
  popularServices: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().int().min(1).max(20).default(10),
      })
    )
    .query(async ({ input }) => {
      return await db.getPopularServicesAnalytics(input);
    }),

  // Get peak booking times
  peakTimes: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await db.getPeakBookingTimesAnalytics(input);
    }),

  // Get revenue metrics with growth comparison
  revenueMetrics: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        previousPeriodStartDate: z.date(),
        previousPeriodEndDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await db.getRevenueMetricsAnalytics(input);
    }),
});
