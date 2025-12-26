import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const followUpRouter = router({
  // Schedule a follow-up message
  schedule: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      officeId: z.number(),
      triggerType: z.enum(["24h", "48h", "manual"]),
      messageTemplate: z.string(),
      hoursDelay: z.number().optional(), // For manual scheduling
    }))
    .mutation(async ({ input, ctx }) => {
      // Calculate scheduled time based on trigger type
      const now = new Date();
      let scheduledFor: Date;
      
      if (input.triggerType === "manual" && input.hoursDelay) {
        scheduledFor = new Date(now.getTime() + input.hoursDelay * 60 * 60 * 1000);
      } else if (input.triggerType === "24h") {
        scheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else {
        scheduledFor = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      }
      
      const result = await db.createScheduledFollowup({
        conversationId: input.conversationId,
        officeId: input.officeId,
        scheduledFor,
        triggerType: input.triggerType,
        messageTemplate: input.messageTemplate,
      });
      
      return { success: true, followupId: result.insertId };
    }),
  
  // Get follow-ups for a conversation
  getByConversation: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ input }) => {
      return db.getFollowupsByConversation(input.conversationId);
    }),
  
  // Cancel a scheduled follow-up
  cancel: protectedProcedure
    .input(z.object({
      followupId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.cancelFollowup(input.followupId);
      return { success: true };
    }),
  
  // Get pending follow-ups (for background job)
  getPending: protectedProcedure
    .query(async () => {
      return db.getPendingFollowups();
    }),
});
