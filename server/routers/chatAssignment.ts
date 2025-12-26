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
});
