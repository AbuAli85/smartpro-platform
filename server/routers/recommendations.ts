import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getRecommendedOffices, getTopOfficesByRegion } from "../recommendations";

export const recommendationsRouter = router({
  /**
   * Get personalized office recommendations for a user
   * Based on region, booking history, and office performance
   */
  getRecommended: publicProcedure
    .input(
      z.object({
        region: z.string().nullable().optional(),
        limit: z.number().min(1).max(20).default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id || null;
      const region = input.region || null;
      
      const recommendations = await getRecommendedOffices(
        userId,
        region,
        input.limit
      );
      
      return {
        offices: recommendations,
        count: recommendations.length,
      };
    }),

  /**
   * Get top-performing offices by region for leaderboards
   */
  getTopByRegion: publicProcedure
    .input(
      z.object({
        region: z.string(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const topOffices = await getTopOfficesByRegion(
        input.region,
        input.limit
      );
      
      return {
        region: input.region,
        offices: topOffices,
        count: topOffices.length,
      };
    }),

  /**
   * Get leaderboards for all regions
   */
  getAllRegionalLeaderboards: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ input }) => {
      const regions = ["Muscat", "Dhofar", "Batinah North", "Sharqiyah North", "Dakhliyah"];
      
      const leaderboards = await Promise.all(
        regions.map(async (region) => {
          const offices = await getTopOfficesByRegion(region, input.limit);
          return {
            region,
            offices,
            count: offices.length,
          };
        })
      );
      
      return {
        leaderboards,
        totalRegions: regions.length,
      };
    }),
});
