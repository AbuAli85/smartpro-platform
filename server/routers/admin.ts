import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { sendOfficeVerificationEmail } from "../_core/emailSms";
import { sendRoleChangeNotificationEmail } from "../_core/emailTemplates";

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
      // Get user details before update
      const users = await db.getAllUsers();
      const user = users.find(u => u.id === input.userId);
      const oldRole = user?.role || "user";

      // Update role
      await db.updateUserRole(input.userId, input.role);

      await db.logActivity({
        userId: ctx.user!.id,
        action: "updated",
        entityType: "user",
        entityId: input.userId,
        description: `Changed user role from ${oldRole} to ${input.role}`,
      });

      // Send email notification if user has email
      if (user?.email) {
        await sendRoleChangeNotificationEmail(
          user.email,
          user.name || "User",
          oldRole,
          input.role
        );
      }

      return { success: true };
    }),

  // Get platform statistics
  getStats: adminProcedure.query(async () => {
    const stats = await db.getPlatformStatistics();
    return stats;
  }),

  // Get pending office registrations for verification
  getPendingOfficeRegistrations: adminProcedure.query(async () => {
    return await db.getPendingOfficeRegistrations();
  }),

  // Get pending office verifications
  getPendingOffices: adminProcedure.query(async () => {
    return await db.getPendingOffices();
  }),

  // Approve office registration
  approveOfficeRegistration: adminProcedure
    .input(z.object({ 
      officeId: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.approveOfficeRegistration(input.officeId, input.notes);

      await db.logActivity({
        userId: ctx.user!.id,
        action: "approved",
        entityType: "office",
        entityId: input.officeId,
        description: `Approved office registration${input.notes ? `: ${input.notes}` : ''}`,
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

      // Send real-time notification via Socket.IO
      if (office?.ownerId) {
        const { notifyOfficeApproved } = await import("../_core/socket");
        notifyOfficeApproved(office.ownerId, {
          officeId: input.officeId,
          officeName: office.officeName,
        });
      }

      return { success: true };
    }),

  // Reject office registration
  rejectOfficeRegistration: adminProcedure
    .input(z.object({ 
      officeId: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.rejectOfficeRegistration(input.officeId, input.reason);

      await db.logActivity({
        userId: ctx.user!.id,
        action: "rejected",
        entityType: "office",
        entityId: input.officeId,
        description: `Rejected office registration: ${input.reason}`,
      });

      // Get office details for notification
      const office = await db.getSanadOfficeById(input.officeId);
      
      // Send rejection email to office
      if (office?.email) {
        await sendOfficeVerificationEmail({
          officeEmail: office.email,
          officeName: office.officeName,
          status: "rejected",
          reason: input.reason,
        });
      }

      // Send real-time notification via Socket.IO
      if (office?.ownerId) {
        const { notifyOfficeRejected } = await import("../_core/socket");
        notifyOfficeRejected(office.ownerId, {
          officeId: input.officeId,
          officeName: office.officeName,
          reason: input.reason,
        });
      }

      return { success: true };
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

  // Get regional statistics
  getRegionalStatistics: adminProcedure.query(async () => {  
    // Get office distribution by region
    const officesByRegion = await db.getOfficeCountByGovernorate();
    const totalOffices = officesByRegion.reduce((sum, item) => sum + item.count, 0);

    // Get booking statistics by region
    const bookingsByRegion = await db.getBookingCountByGovernorate();
    const totalBookings = bookingsByRegion.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = bookingsByRegion.reduce((sum, item) => sum + (item.revenue || 0), 0);

    // Find top region by bookings
    const topRegion = bookingsByRegion.length > 0 
      ? bookingsByRegion.reduce((max, item) => item.count > max.count ? item : max).governorate
      : "Muscat";

    // Get service demand by region
    const servicesByRegion = await db.getServiceDemandByGovernorate();

    // Identify underserved areas (regions with fewer than 5 offices)
    const underservedAreas = officesByRegion
      .filter(item => item.count < 5)
      .map(item => ({
        governorate: item.governorate,
        officeCount: item.count,
      }));

    return {
      totalOffices,
      totalBookings,
      totalRevenue,
      topRegion,
      officesByRegion,
      bookingsByRegion,
      servicesByRegion,
      underservedAreas,
    };
  }),
});
