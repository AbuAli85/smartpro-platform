import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

export const adminAnalyticsRouter = router({
  // Get office performance metrics
  officePerformance: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      return await db.getOfficePerformanceMetrics(input);
    }),

  // Get user growth statistics
  userGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
      })
    )
    .query(async ({ input }) => {
      return await db.getUserGrowthStats(input);
    }),

  // Get revenue by governorate
  revenueByGovernorate: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await db.getRevenueByGovernorate(input);
    }),

  // Get platform health metrics
  platformHealth: adminProcedure.query(async () => {
    return await db.getPlatformHealthMetrics();
  }),
});
