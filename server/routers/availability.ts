import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const availabilityRouter = router({
  // Get office availability schedule
  getOfficeAvailability: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify user has access to this office
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const staff = await db.getOfficeStaffByUserId(input.officeId, ctx.user.id);
      if (!staff && office.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return await db.getOfficeAvailability(input.officeId);
    }),

  // Update office availability schedule
  upsertAvailability: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        slotDuration: z.number().min(15).max(480).default(60),
        isAvailable: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user has access to this office
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const staff = await db.getOfficeStaffByUserId(input.officeId, ctx.user.id);
      if (!staff && office.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return await db.upsertOfficeAvailability(input);
    }),

  // Get blocked slots
  getBlockedSlots: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify user has access to this office
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const staff = await db.getOfficeStaffByUserId(input.officeId, ctx.user.id);
      if (!staff && office.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return await db.getOfficeBlockedSlots(
        input.officeId,
        input.startDate,
        input.endDate
      );
    }),

  // Create blocked slot
  createBlockedSlot: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        blockedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        isAllDay: z.boolean().default(false),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user has access to this office
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const staff = await db.getOfficeStaffByUserId(input.officeId, ctx.user.id);
      if (!staff && office.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Validate time range if not all-day
      if (!input.isAllDay && (!input.startTime || !input.endTime)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start time and end time are required for partial day blocks",
        });
      }

      if (input.startTime && input.endTime && input.startTime >= input.endTime) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End time must be after start time",
        });
      }

      const slotId = await db.createBlockedSlot({
        officeId: input.officeId,
        blockedDate: input.blockedDate,
        startTime: input.startTime,
        endTime: input.endTime,
        isAllDay: input.isAllDay,
        reason: input.reason,
        createdBy: ctx.user.id,
      });

      await db.logActivity({
        userId: ctx.user.id,
        action: "created",
        entityType: "blocked_slot",
        entityId: slotId,
        description: `Blocked ${input.isAllDay ? "all day" : "time slot"} on ${input.blockedDate}`,
      });

      return { success: true, slotId };
    }),

  // Delete blocked slot
  deleteBlockedSlot: protectedProcedure
    .input(
      z.object({
        slotId: z.number(),
        officeId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user has access to this office
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const staff = await db.getOfficeStaffByUserId(input.officeId, ctx.user.id);
      if (!staff && office.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await db.deleteBlockedSlot(input.slotId, input.officeId);

      await db.logActivity({
        userId: ctx.user.id,
        action: "deleted",
        entityType: "blocked_slot",
        entityId: input.slotId,
        description: `Removed blocked time slot`,
      });

      return { success: true };
    }),
});
