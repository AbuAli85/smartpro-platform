import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const chatRouter = router({
  // Get or create conversation between user and office
  getOrCreateConversation: protectedProcedure
    .input(z.object({
      officeId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if conversation already exists
      const userConversations = await db.getUserChatConversations(ctx.user.id);
      const existing = userConversations.find(c => c.conversation.officeId === input.officeId);

      if (existing) {
        return existing;
      }

      // Create new conversation
      return await db.createChatConversation({
        userId: ctx.user.id,
        officeId: input.officeId,
      });
    }),

  // Get messages for a conversation
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Verify user has access to this conversation
      const conversation = await db.getChatConversationById(input.conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      if (conversation.userId !== ctx.user.id) {
        // Check if user is office owner
        const offices = await db.getOfficesByOwner(ctx.user.id);
        const hasAccess = offices.some(o => o.id === conversation.officeId);
        if (!hasAccess) {
          throw new Error("Access denied");
        }
      }

      return await db.getChatMessages(input.conversationId);
    }),

  // Get user's conversations
  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.getUserChatConversations(ctx.user.id);
    }),

  // Get unread message count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      // Get all user conversations and count unread messages
      const conversations = await db.getUserChatConversations(ctx.user.id);
      let count = 0;
      for (const conv of conversations) {
        const messages = await db.getChatMessages(conv.conversation.id);
        count += messages.filter(m => !m.isRead && m.senderType !== "user").length;
      }
      return { count };
    }),

  // Mark messages as read
  markAsRead: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Determine reader type based on conversation ownership
      const conversation = await db.getChatConversationById(input.conversationId);
      const readerType = conversation?.userId === ctx.user.id ? "user" : "office";
      await db.markMessagesAsRead(input.conversationId, readerType);
      return { success: true };
    }),
});
