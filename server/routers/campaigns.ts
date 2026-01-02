import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { regionalCampaigns } from "../../drizzle/schema";
import { eq, and, lte, gte, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const campaignsRouter = router({
  /**
   * Get active campaigns for a specific region
   */
  getActiveCampaigns: publicProcedure
    .input(
      z.object({
        region: z.string().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { campaigns: [] };
      }

      try {
        const now = new Date();
        
        // Build conditions
        const conditions = [
          eq(regionalCampaigns.isActive, 1),
          lte(regionalCampaigns.startDate, now),
          gte(regionalCampaigns.endDate, now),
        ];

        // Add region filter if specified
        if (input.region) {
          conditions.push(
            sql`(${regionalCampaigns.targetRegion} = ${input.region} OR ${regionalCampaigns.targetRegion} = 'all')`
          );
        } else {
          conditions.push(eq(regionalCampaigns.targetRegion, "all"));
        }

        const campaigns = await db
          .select()
          .from(regionalCampaigns)
          .where(and(...conditions))
          .orderBy(desc(regionalCampaigns.priority));

        return {
          campaigns,
          count: campaigns.length,
        };
      } catch (error) {
        console.error("[Campaigns] Error fetching active campaigns:", error);
        return { campaigns: [] };
      }
    }),

  /**
   * Track campaign impression
   */
  trackImpression: publicProcedure
    .input(
      z.object({
        campaignId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false };
      }

      try {
        await db
          .update(regionalCampaigns)
          .set({
            impressions: sql`${regionalCampaigns.impressions} + 1`,
          })
          .where(eq(regionalCampaigns.id, input.campaignId));

        return { success: true };
      } catch (error) {
        console.error("[Campaigns] Error tracking impression:", error);
        return { success: false };
      }
    }),

  /**
   * Track campaign click
   */
  trackClick: publicProcedure
    .input(
      z.object({
        campaignId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false };
      }

      try {
        await db
          .update(regionalCampaigns)
          .set({
            clicks: sql`${regionalCampaigns.clicks} + 1`,
          })
          .where(eq(regionalCampaigns.id, input.campaignId));

        return { success: true };
      } catch (error) {
        console.error("[Campaigns] Error tracking click:", error);
        return { success: false };
      }
    }),

  /**
   * Track campaign conversion
   */
  trackConversion: publicProcedure
    .input(
      z.object({
        campaignId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false };
      }

      try {
        await db
          .update(regionalCampaigns)
          .set({
            conversions: sql`${regionalCampaigns.conversions} + 1`,
          })
          .where(eq(regionalCampaigns.id, input.campaignId));

        return { success: true };
      } catch (error) {
        console.error("[Campaigns] Error tracking conversion:", error);
        return { success: false };
      }
    }),

  /**
   * Get all campaigns for admin management
   */
  getAllCampaigns: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user!.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) {
      return { campaigns: [] };
    }

    try {
      const campaigns = await db
        .select()
        .from(regionalCampaigns)
        .orderBy(desc(regionalCampaigns.createdAt));

      return {
        campaigns,
        count: campaigns.length,
      };
    } catch (error) {
      console.error("[Campaigns] Error fetching all campaigns:", error);
      return { campaigns: [] };
    }
  }),

  /**
   * Create a new campaign (admin only)
   */
  createCampaign: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        titleAr: z.string().optional(),
        description: z.string().min(1),
        descriptionAr: z.string().optional(),
        targetRegion: z.string(),
        targetUserSegment: z.enum(["all", "new_users", "returning_users", "high_value"]),
        campaignType: z.enum(["seasonal", "promotional", "awareness", "special_event"]),
        bannerImageUrl: z.string().optional(),
        backgroundColor: z.string().default("#003366"),
        textColor: z.string().default("#FFFFFF"),
        ctaText: z.string().optional(),
        ctaTextAr: z.string().optional(),
        ctaLink: z.string().optional(),
        discountPercentage: z.number().optional(),
        discountCode: z.string().optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user!.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      try {
        const result = await db.insert(regionalCampaigns).values({
          ...input,
          startDate: input.startDate.toISOString(),
          endDate: input.endDate.toISOString(),
          createdBy: ctx.user!.id,
        });

        return {
          success: true,
          campaignId: Number(result[0].insertId),
        };
      } catch (error) {
        console.error("[Campaigns] Error creating campaign:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Update campaign (admin only)
   */
  updateCampaign: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        isActive: z.number().optional(),
        priority: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user!.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      try {
        const { id, ...updates } = input;
        await db
          .update(regionalCampaigns)
          .set(updates)
          .where(eq(regionalCampaigns.id, id));

        return { success: true };
      } catch (error) {
        console.error("[Campaigns] Error updating campaign:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
