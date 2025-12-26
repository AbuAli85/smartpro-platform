import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const cannedResponsesRouter = router({
  // Get canned responses for an office
  getByOffice: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCannedResponsesByOffice(input.officeId);
    }),

  // Create a canned response
  create: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      title: z.string().min(1),
      content: z.string().min(1),
      shortcut: z.string().optional(),
      category: z.enum(["greeting", "faq", "closing", "pricing", "hours", "services", "general"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the office
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const hasAccess = offices.some(o => o.id === input.officeId);
      if (!hasAccess) {
        throw new Error("Access denied");
      }

      return await db.createCannedResponse(input);
    }),

  // Update a canned response
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      shortcut: z.string().optional(),
      category: z.enum(["greeting", "faq", "closing", "pricing", "hours", "services", "general"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateCannedResponse(id, data);
    }),

  // Delete a canned response
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteCannedResponse(input.id);
    }),

  // Process template variables
  processVariables: protectedProcedure
    .input(z.object({
      template: z.string(),
      conversationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get conversation details
      const conversation = await db.getChatConversationById(input.conversationId);
      if (!conversation) {
        return { processed: input.template };
      }

      // Get user and office details
      const user = await db.getUserById(conversation.userId);
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const office = offices.find(o => o.id === conversation.officeId);

      // Process variables
      const processed = await db.processTemplateVariables(input.template, {
        customerName: user?.name || undefined,
        officeName: office?.officeName || undefined,
        staffName: ctx.user.name || undefined,
        userId: conversation.userId,
        officeId: conversation.officeId,
      });

      return { processed };
    }),
});
