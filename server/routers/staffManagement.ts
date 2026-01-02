import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const staffManagementRouter = router({
  // Get all staff for an office
  getOfficeStaff: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getOfficeStaff(input.officeId);
    }),

  // Add staff member
  addStaff: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      userId: z.number(),
      role: z.enum(["manager", "staff", "translator", "consultant"]),
      canManageBookings: z.boolean().default(false),
      canManageServices: z.boolean().default(false),
      canViewAnalytics: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      // Check if user is already staff
      const existingStaff = await db.getOfficeStaff(input.officeId);
      if (existingStaff.some(s => s.userId === input.userId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already a staff member",
        });
      }

      const staffId = await db.addOfficeStaff(input);

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "added_staff",
        entityType: "office",
        entityId: input.officeId,
        description: `Added staff member with role: ${input.role}`,
      });

      return { staffId, message: "Staff member added successfully" };
    }),

  // Update staff member
  updateStaff: protectedProcedure
    .input(z.object({
      staffId: z.number(),
      role: z.enum(["manager", "staff", "translator", "consultant"]).optional(),
      canManageBookings: z.boolean().optional(),
      canManageServices: z.boolean().optional(),
      canViewAnalytics: z.boolean().optional(),
      isActive: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get staff to verify ownership
      const staff = await db.getOfficeStaff(input.staffId);
      
      if (!staff || staff.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Staff member not found",
        });
      }

      const officeId = staff[0].officeId;

      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      await db.updateOfficeStaff(input.staffId, input);

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "updated_staff",
        entityType: "office",
        entityId: officeId,
        description: `Updated staff member permissions`,
      });

      return { success: true, message: "Staff member updated successfully" };
    }),

  // Remove staff member
  removeStaff: protectedProcedure
    .input(z.object({ staffId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Get staff to verify ownership
      const staff = await db.getOfficeStaff(input.staffId);
      
      if (!staff || staff.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Staff member not found",
        });
      }

      const officeId = staff[0].officeId;

      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      await db.removeOfficeStaff(input.staffId);

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "removed_staff",
        entityType: "office",
        entityId: officeId,
        description: `Removed staff member`,
      });

      return { success: true, message: "Staff member removed successfully" };
    }),

  // Get staff workload
  getStaffWorkload: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getStaffWorkload(input.officeId);
    }),

  // Get staff performance metrics
  getStaffPerformance: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      staffUserId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getStaffPerformanceMetrics(input.officeId, input.staffUserId);
    }),

  // Get staff performance trends
  getStaffPerformanceTrends: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      days: z.number().default(30),
    }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getStaffPerformanceTrends(input.officeId, input.days);
    }),

  // Get available staff (for assignment)
  getAvailableStaff: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getAvailableStaff(input.officeId);
    }),
});
