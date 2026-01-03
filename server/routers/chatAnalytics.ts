import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const chatAnalyticsRouter = router({
  // Get chat analytics
  getAnalytics: protectedProcedure
    .input(z.object({
      officeId: z.number().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // If officeId provided, verify user owns the office
      if (input.officeId) {
        const offices = await db.getOfficesByOwner(ctx.user.id);
        const hasAccess = offices.some(o => o.id === input.officeId);
        if (!hasAccess) {
          throw new Error("Access denied");
        }
      }

      return await db.getChatAnalytics({
        officeId: input.officeId,
        userId: ctx.user.id,
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),
});
