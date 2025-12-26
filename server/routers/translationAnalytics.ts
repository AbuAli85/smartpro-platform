import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

/**
 * Translation Analytics Router
 * Provides analytics data for translation activity, trends, and translator performance
 */

export const translationAnalyticsRouter = router({
  /**
   * Get translation completion trends over time
   */
  getCompletionTrends: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view translation analytics",
        });
      }

      const trends = await db.getTranslationCompletionTrends({
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        groupBy: input.groupBy,
      });

      return trends;
    }),

  /**
   * Get translator leaderboard
   */
  getTranslatorLeaderboard: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view translation analytics",
        });
      }

      const leaderboard = await db.getTranslatorLeaderboard({
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        limit: input.limit,
      });

      return leaderboard;
    }),

  /**
   * Get recent translation activity
   */
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view translation analytics",
        });
      }

      const activities = await db.getRecentTranslationActivity(input.limit);
      return activities;
    }),

  /**
   * Get translation statistics summary
   */
  getStatisticsSummary: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view translation analytics",
      });
    }

    // Get all offices and templates
    const { offices } = await db.listSanadOffices({ limit: 10000 });
    const { templates } = await db.listDocumentTemplates({ limit: 10000 });

    // Calculate office statistics
    const officeStats = {
      total: offices.length,
      complete: offices.filter(o => o.officeNameAr && o.descriptionAr).length,
      partial: offices.filter(o => (o.officeNameAr || o.descriptionAr) && !(o.officeNameAr && o.descriptionAr)).length,
      missing: offices.filter(o => !o.officeNameAr && !o.descriptionAr).length,
    };

    // Calculate template statistics
    const templateStats = {
      total: templates.length,
      complete: templates.filter(t => t.templateNameAr && t.descriptionAr).length,
      partial: templates.filter(t => (t.templateNameAr || t.descriptionAr) && !(t.templateNameAr && t.descriptionAr)).length,
      missing: templates.filter(t => !t.templateNameAr && !t.descriptionAr).length,
    };

    // Get pending translation requests count
    const pendingRequests = await db.getPendingTranslationRequestsCount();

    // Get recent activity count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await db.getTranslationActivityLog({
      startDate: sevenDaysAgo,
      limit: 1000,
    });

    return {
      offices: officeStats,
      templates: templateStats,
      pendingRequests,
      recentActivityCount: recentActivity.length,
      overallCompletion: {
        total: officeStats.total + templateStats.total,
        complete: officeStats.complete + templateStats.complete,
        percentage: Math.round(
          ((officeStats.complete + templateStats.complete) /
            (officeStats.total + templateStats.total)) *
            100
        ),
      },
    };
  }),

  /**
   * Get translation activity timeline for a specific entity
   */
  getEntityActivityTimeline: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["office", "template"]),
        entityId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view translation analytics",
        });
      }

      const activities = await db.getTranslationActivityLog({
        entityType: input.entityType,
        entityId: input.entityId,
        limit: 50,
      });

      return activities;
    }),
});
