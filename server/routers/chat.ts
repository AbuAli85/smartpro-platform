import { z } from "zod";
import { translateMessage } from "../_core/translation";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const chatRouter = router({
  // Get or create conversation between user and office
  getOrCreateConversation: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      autoAssign: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      // Check if conversation already exists
      const userConversations = await db.getUserChatConversations(ctx.user.id);
      const existing = userConversations.find(c => c.conversation.officeId === input.officeId);

      if (existing) {
        return existing;
      }

      // Create new conversation
      const conversationId = await db.createChatConversation({
        userId: ctx.user.id,
        officeId: input.officeId,
      });

      // Auto-assign to available staff if enabled
      if (input.autoAssign && typeof conversationId === 'number') {
        try {
          const availableStaff = await db.getAvailableStaff(input.officeId);
          
          if (availableStaff.length > 0) {
            const workload = await db.getStaffWorkload(input.officeId);
            
            const staffWithWorkload = availableStaff.map(staff => {
              const load = workload.find(w => w.userId === staff.userId);
              return {
                ...staff,
                activeConversations: load?.activeConversations || 0,
              };
            });

            staffWithWorkload.sort((a, b) => a.activeConversations - b.activeConversations);
            const selectedStaff = staffWithWorkload[0];
            
            await db.assignConversation({
              conversationId,
              assignedToUserId: selectedStaff.userId,
              assignedByUserId: ctx.user.id,
            });

            await db.createNotification({
              userId: selectedStaff.userId,
              type: "system",
              title: "New Chat Auto-Assigned",
              message: `You have been automatically assigned to a new conversation`,
            });
          }
        } catch (error) {
          console.error('Auto-assignment failed:', error);
          // Continue even if auto-assignment fails
        }
      }

      // Fetch and return the created conversation
      const newConversations = await db.getUserChatConversations(ctx.user.id);
      const newConversation = newConversations.find(c => c.conversation.id === conversationId);
      return newConversation;
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

  // Search messages
  searchMessages: protectedProcedure
    .input(z.object({
      query: z.string(),
      conversationId: z.number().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await db.searchChatMessages({
        userId: ctx.user.id,
        query: input.query,
        conversationId: input.conversationId,
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),

  // Upload file attachment
  uploadFile: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      fileData: z.string(), // base64 encoded file
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate file size (10MB max)
      const fileBuffer = Buffer.from(input.fileData, 'base64');
      if (fileBuffer.length > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }
      
      // Determine sender type
      const conversation = await db.getChatConversationById(input.conversationId);
      const senderType = conversation?.userId === ctx.user.id ? 'user' : 'office';
      
      // Upload to S3
      const { fileUrl, fileName } = await db.uploadChatAttachment(
        fileBuffer,
        input.fileName,
        input.mimeType
      );
      
      // Send file message
      const message = await db.sendFileMessage({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        senderType,
        fileUrl,
        fileName,
      });
      
      return { success: true, messageId: message.id, fileUrl };
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

  // Send message
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to this conversation
      const conversation = await db.getChatConversationById(input.conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Determine sender type
      let senderType: "user" | "office" = "user";
      if (conversation.userId !== ctx.user.id) {
        // Check if user is office owner or staff
        const offices = await db.getOfficesByOwner(ctx.user.id);
        const hasAccess = offices.some(o => o.id === conversation.officeId);
        if (!hasAccess) {
          throw new Error("Access denied");
        }
        senderType = "office";
      }

      // Save message to database
      const savedMessage = await db.sendMessage({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        senderType,
        message: input.message,
      });

      return { success: true, message: savedMessage };
    }),

  // Translate message
  translateMessage: protectedProcedure
    .input(z.object({
      text: z.string(),
      targetLanguage: z.enum(["ar", "en"]),
    }))
    .mutation(async ({ input }) => {
      const result = await translateMessage(input.text, input.targetLanguage);
      return result;
    }),

  // Close conversation
  closeConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input }) => {
      return await db.closeConversation(input.conversationId);
    }),

  // Update conversation tags
  updateTags: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      tags: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      return await db.updateConversationTags(input.conversationId, input.tags);
    }),

  // Get conversations by tags
  getConversationsByTags: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      tags: z.array(z.string()),
    }))
    .query(async ({ input }) => {
      return await db.getConversationsByTags(input.officeId, input.tags);
    }),
});
