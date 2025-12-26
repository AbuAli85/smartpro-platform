import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const referralRouter = router({
  // Get user's referral code
  getMyReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    const code = await db.getUserReferralCode(user.id);
    return { code };
  }),

  // Get referral statistics
  getMyReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    return await db.getReferralStats(user.id);
  }),

  // Track a referral (called when new user signs up with code)
  trackReferral: publicProcedure
    .input(
      z.object({
        referralCode: z.string().min(1).max(20),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await db.trackReferral(input.referralCode, input.userId);
      return { success };
    }),
});
