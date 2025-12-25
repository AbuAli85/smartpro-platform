import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { sql } from "drizzle-orm";

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

export const adminRouter = router({
  // Get platform statistics
  getStats: adminProcedure.query(async () => {
    const stats = await db.getAdminStats();
    return stats;
  }),

  // Get pending office verifications
  getPendingOffices: adminProcedure.query(async () => {
    return await db.getPendingOffices();
  }),

  // Approve office
  approveOffice: adminProcedure
    .input(z.object({ officeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.updateOfficeStatus(input.officeId, "active");

      await db.logActivity({
        userId: ctx.user!.id,
        action: "approved",
        entityType: "office",
        entityId: input.officeId,
        description: "Approved office registration",
      });

      return { success: true };
    }),

  // Reject office
  rejectOffice: adminProcedure
    .input(
      z.object({
        officeId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.updateOfficeStatus(input.officeId, "rejected");

      await db.logActivity({
        userId: ctx.user!.id,
        action: "rejected",
        entityType: "office",
        entityId: input.officeId,
        description: `Rejected office: ${input.reason}`,
      });

      return { success: true };
    }),
});
