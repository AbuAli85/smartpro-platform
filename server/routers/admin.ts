import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { sendOfficeVerificationEmail } from "../_core/emailSms";

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
  // Get all users
  getAllUsers: adminProcedure.query(async () => {
    return await db.getAllUsers();
  }),

  // Update user role
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin", "sanad_owner", "sanad_staff", "sme_owner", "gig_worker", "government_official"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.updateUserRole(input.userId, input.role);

      await db.logActivity({
        userId: ctx.user!.id,
        action: "updated",
        entityType: "user",
        entityId: input.userId,
        description: `Changed user role to ${input.role}`,
      });

      return { success: true };
    }),

  // Get platform statistics
  getStats: adminProcedure.query(async () => {
    const stats = await db.getPlatformStatistics();
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
      await db.updateSanadOffice(input.officeId, { status: "active" });

      await db.logActivity({
        userId: ctx.user!.id,
        action: "approved",
        entityType: "office",
        entityId: input.officeId,
        description: "Approved office registration",
      });

      // Get office details for notification
      const office = await db.getSanadOfficeById(input.officeId);
      
      // Notify owner about approval
      await notifyOwner({
        title: "Office Approved",
        content: `${office?.officeName || 'Office'} has been approved and is now active on the platform.`,
      });

      // Send email to office
      if (office?.email) {
        await sendOfficeVerificationEmail({
          officeEmail: office.email,
          officeName: office.officeName,
          status: "approved",
        });
      }

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
      await db.updateSanadOffice(input.officeId, { verificationStatus: "rejected" });

      await db.logActivity({
        userId: ctx.user!.id,
        action: "rejected",
        entityType: "office",
        entityId: input.officeId,
        description: `Rejected office: ${input.reason}`,
      });

      // Get office details for notification
      const office = await db.getSanadOfficeById(input.officeId);
      
      // Notify owner about rejection
      await notifyOwner({
        title: "Office Rejected",
        content: `${office?.officeName || 'Office'} registration was rejected. Reason: ${input.reason}`,
      });

      // Send email to office
      if (office?.email) {
        await sendOfficeVerificationEmail({
          officeEmail: office.email,
          officeName: office.officeName,
          status: "rejected",
          reason: input.reason,
        });
      }

      return { success: true };
    }),
});
