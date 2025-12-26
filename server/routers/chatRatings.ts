import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const chatRatingsRouter = router({
  // Create a rating for a conversation
  create: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      rating: z.number().min(1).max(5),
      feedback: z.string().optional(),
      staffUserId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.createChatRating({
        ...input,
        userId: ctx.user.id,
      });
    }),

  // Get rating for a conversation
  getByConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getChatRatingByConversation(input.conversationId);
    }),

  // Get all ratings for a staff member
  getStaffRatings: protectedProcedure
    .input(z.object({ staffUserId: z.number() }))
    .query(async ({ input }) => {
      return await db.getStaffRatings(input.staffUserId);
    }),

  // Get average rating for a staff member
  getAverageRating: protectedProcedure
    .input(z.object({ staffUserId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAverageStaffRating(input.staffUserId);
    }),

  // Get satisfaction trends over time
  getSatisfactionTrends: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      return await db.getSatisfactionTrends(input.days);
    }),
});
