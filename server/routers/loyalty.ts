import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const loyaltyRouter = router({
  // Get user's loyalty points balance
  getMyLoyalty: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    return await db.getUserLoyalty(user.id);
  }),

  // Get user's loyalty transaction history
  getMyTransactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;
      return await db.getLoyaltyTransactions(user.id, input.limit);
    }),

  // Redeem points for discount
  redeemPoints: protectedProcedure
    .input(
      z.object({
        points: z.number().min(100, "Minimum 100 points required"),
        bookingId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Validate points are in multiples of 100
      if (input.points % 100 !== 0) {
        throw new Error("Points must be in multiples of 100");
      }

      const discountAmount = (input.points / 100) * 5; // 100 points = 5 OMR

      await db.redeemPoints({
        userId: user.id,
        points: input.points,
        reason: `Redeemed for ${discountAmount} OMR discount`,
        bookingId: input.bookingId,
      });

      return {
        success: true,
        discountAmount,
      };
    }),
});
