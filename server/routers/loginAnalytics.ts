import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const loginAnalyticsRouter = router({
  /**
   * Get login analytics summary
   */
  getSummary: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["24h", "7d", "30d", "90d"]).default("7d"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can view login analytics
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const { timeRange } = input;
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "24h":
          startDate.setHours(now.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
      }

      const summary = await db.getLoginAnalyticsSummary(startDate, now);
      return summary;
    }),

  /**
   * Get login trends over time
   */
  getTrends: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["24h", "7d", "30d", "90d"]).default("7d"),
        groupBy: z.enum(["hour", "day", "week"]).default("day"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can view login analytics
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const { timeRange, groupBy } = input;
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "24h":
          startDate.setHours(now.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
      }

      const trends = await db.getLoginTrends(startDate, now, groupBy);
      return trends;
    }),

  /**
   * Get authentication methods distribution
   */
  getAuthMethods: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["24h", "7d", "30d", "90d"]).default("7d"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can view login analytics
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const { timeRange } = input;
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "24h":
          startDate.setHours(now.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
      }

      const methods = await db.getAuthMethodsDistribution(startDate, now);
      return methods;
    }),

  /**
   * Get geographic distribution of logins
   */
  getGeographicDistribution: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["24h", "7d", "30d", "90d"]).default("7d"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can view login analytics
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const { timeRange } = input;
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "24h":
          startDate.setHours(now.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
      }

      const distribution = await db.getGeographicDistribution(startDate, now);
      return distribution;
    }),

  /**
   * Get recent login attempts (successful and failed)
   */
  getRecentAttempts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        eventType: z.enum(["all", "login_success", "login_failure"]).default("all"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can view login analytics
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const { limit, eventType } = input;
      const attempts = await db.getRecentLoginAttempts(limit, eventType);
      return attempts;
    }),

  /**
   * Get hourly login patterns
   */
  getHourlyPatterns: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["24h", "7d", "30d"]).default("7d"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can view login analytics
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const { timeRange } = input;
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "24h":
          startDate.setHours(now.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
      }

      const patterns = await db.getHourlyLoginPatterns(startDate, now);
      return patterns;
    }),
});
