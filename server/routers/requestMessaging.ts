/**
 * Request Messaging tRPC Router
 * Handles messaging within service requests between customers and offices
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  sendMessage,
  getRequestMessages,
  markMessageAsRead,
  markAllMessagesAsRead,
  getUnreadMessageCount,
  getLatestMessage,
  deleteMessage,
} from "../requestMessaging";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

export const requestMessagingRouter = router({
  /**
   * Send a message in a service request
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        message: z.string().min(1),
        senderType: z.enum(["customer", "office"]),
        attachments: z
          .array(
            z.object({
              url: z.string(),
              filename: z.string(),
              fileType: z.string(),
              fileSize: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await sendMessage({
        requestId: input.requestId,
        senderId: ctx.user.id,
        senderType: input.senderType,
        message: input.message,
        attachments: input.attachments || [],
      });

      return message;
    }),

  /**
   * Get all messages for a service request
   */
  getMessages: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ input }) => {
      const messages = await getRequestMessages(input.requestId);
      return messages;
    }),

  /**
   * Mark a message as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      const updated = await markMessageAsRead(input.messageId);
      return updated;
    }),

  /**
   * Mark all messages in a request as read
   */
  markAllAsRead: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await markAllMessagesAsRead(input.requestId, ctx.user.id);
      return { success: true };
    }),

  /**
   * Get unread message count for a request
   */
  getUnreadCount: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const count = await getUnreadMessageCount(input.requestId, ctx.user.id);
      return { count };
    }),

  /**
   * Get latest message for a request
   */
  getLatestMessage: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ input }) => {
      const message = await getLatestMessage(input.requestId);
      return message;
    }),

  /**
   * Upload attachment for message
   */
  uploadAttachment: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        filename: z.string(),
        fileType: z.string(),
        fileData: z.string(), // Base64 encoded file data
      })
    )
    .mutation(async ({ input }) => {
      // Decode base64 file data
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // Validate file size (max 10MB)
      if (fileSize > 10 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size exceeds 10MB limit",
        });
      }

      // Upload to S3
      const fileKey = `request-messages/${input.requestId}/${Date.now()}-${input.filename}`;
      const { url } = await storagePut(fileKey, buffer, input.fileType);

      return {
        url,
        filename: input.filename,
        fileType: input.fileType,
        fileSize,
      };
    }),

  /**
   * Delete a message
   */
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteMessage(input.messageId);
      return { success: true };
    }),
});
