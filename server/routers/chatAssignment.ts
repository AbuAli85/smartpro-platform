import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const chatAssignmentRouter = router({
  // Get office staff
  getOfficeStaff: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOfficeStaff(input.officeId);
    }),

  // Add staff member
  addStaff: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      userId: z.number(),
      role: z.enum(["owner", "manager", "agent"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the office
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const hasAccess = offices.some(o => o.id === input.officeId);
      if (!hasAccess) {
        throw new Error("Access denied");
      }

      return await db.addOfficeStaff(input);
    }),

  // Assign conversation
  assignConversation: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      assignedToUserId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const assignment = await db.assignConversation({
        conversationId: input.conversationId,
        assignedToUserId: input.assignedToUserId,
        assignedByUserId: ctx.user.id,
      });

      // Create notification for assigned user
      await db.createNotification({
        userId: input.assignedToUserId,
        type: "system",
        title: "New Chat Assignment",
        message: `You have been assigned to a new conversation`,
      });

      return assignment;
    }),

  // Get conversation assignment
  getAssignment: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getConversationAssignment(input.conversationId);
    }),

  // Get assigned conversations
  getAssignedConversations: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.getAssignedConversations(ctx.user.id);
    }),

  // Update staff member
  updateStaff: protectedProcedure
    .input(z.object({
      staffId: z.number(),
      role: z.enum(["owner", "manager", "agent"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.updateOfficeStaff(input.staffId, {
        role: input.role,
        isActive: input.isActive,
      });
    }),

  // Remove staff member
  removeStaff: protectedProcedure
    .input(z.object({ staffId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await db.removeOfficeStaff(input.staffId);
    }),

  // Update staff availability
  updateAvailability: protectedProcedure
    .input(z.object({
      staffId: z.number(),
      status: z.enum(["online", "offline", "busy"]),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.updateStaffAvailability(input.staffId, input.status);
    }),

  // Get available staff
  getAvailableStaff: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAvailableStaff(input.officeId);
    }),

  // Get staff workload
  getStaffWorkload: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getStaffWorkload(input.officeId);
    }),

  // Auto-assign conversation (least-loaded algorithm)
  autoAssignConversation: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      officeId: z.number(),
      algorithm: z.enum(["round-robin", "least-loaded"]).default("least-loaded"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get available staff
      const availableStaff = await db.getAvailableStaff(input.officeId);
      
      if (availableStaff.length === 0) {
        throw new Error("No available staff members");
      }

      // Get workload for each staff member
      const workload = await db.getStaffWorkload(input.officeId);
      
      // Find staff with least workload
      const staffWithWorkload = availableStaff.map(staff => {
        const load = workload.find(w => w.userId === staff.userId);
        return {
          ...staff,
          activeConversations: load?.activeConversations || 0,
        };
      });

      // Sort by workload (ascending)
      staffWithWorkload.sort((a, b) => a.activeConversations - b.activeConversations);
      
      // Assign to staff with least workload
      const selectedStaff = staffWithWorkload[0];
      
      const assignment = await db.assignConversation({
        conversationId: input.conversationId,
        assignedToUserId: selectedStaff.userId,
        assignedByUserId: ctx.user.id,
      });

      // Create notification for assigned user
      await db.createNotification({
        userId: selectedStaff.userId,
        type: "system",
        title: "New Chat Auto-Assigned",
        message: `You have been automatically assigned to a new conversation`,
      });

      return {
        assignment,
        assignedTo: selectedStaff,
      };
    }),

  // Get staff performance metrics
  getPerformanceMetrics: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      staffUserId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getStaffPerformanceMetrics(input.officeId, input.staffUserId);
    }),
});
