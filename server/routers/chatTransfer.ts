import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const chatTransferRouter = router({
  // Transfer conversation to another staff member
  transferConversation: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      toUserId: z.number(),
      contextNotes: z.string().optional(),
      isEscalation: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create transfer record and update assignment
      await db.createChatTransfer({
        conversationId: input.conversationId,
        fromUserId: ctx.user.id,
        toUserId: input.toUserId,
        contextNotes: input.contextNotes,
        isEscalation: input.isEscalation,
      });
      
      // Send notification to recipient
      await db.createNotification({
        userId: input.toUserId,
        type: "system",
        title: input.isEscalation ? "Chat Escalated to You" : "Chat Transferred to You",
        message: `A conversation has been ${input.isEscalation ? 'escalated' : 'transferred'} to you${input.contextNotes ? `: ${input.contextNotes}` : ''}`,
      });
      
      // Send notification to sender
      await db.createNotification({
        userId: ctx.user.id,
        type: "system",
        title: "Transfer Successful",
        message: `Conversation has been ${input.isEscalation ? 'escalated' : 'transferred'} successfully`,
      });
      
      return { success: true };
    }),

  // Get transfer history for a conversation
  getTransferHistory: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getTransferHistory(input.conversationId);
    }),
});
