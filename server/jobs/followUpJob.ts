import cron from "node-cron";
import { getDb } from "../db";
import { scheduledFollowups, chatConversations, chatMessages } from "../../drizzle/schema";
import { eq, and, lte, isNull } from "drizzle-orm";

/**
 * Background job to check and send pending follow-up messages
 * Runs every 5 minutes to find follow-ups that are due
 */
export function startFollowUpJob() {
  // Run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("[FollowUp Job] Checking for pending follow-ups...");
      
      const db = await getDb();
      if (!db) {
        console.warn("[FollowUp Job] Database not available, skipping check.");
        return;
      }

      const now = new Date();
      
      // Get all pending follow-ups that are due (scheduledFor <= now)
      const pendingFollowups = await db
        .select()
        .from(scheduledFollowups)
        .where(
          and(
            eq(scheduledFollowups.status, "pending"),
            lte(scheduledFollowups.scheduledFor, now.toISOString())
          )
        );

      console.log(`[FollowUp Job] Found ${pendingFollowups.length} pending follow-ups`);

      let sentCount = 0;
      let errorCount = 0;

      for (const followup of pendingFollowups) {
        try {
          // Get conversation details
          const conversation = await db
            .select()
            .from(chatConversations)
            .where(eq(chatConversations.id, followup.conversationId))
            .limit(1);

          if (!conversation || conversation.length === 0) {
            console.error(`[FollowUp Job] Conversation ${followup.conversationId} not found`);
            // Mark as failed
            await (await getDb())!
              .update(scheduledFollowups)
              .set({
                status: "cancelled", // Use cancelled for failed attempts
                sentAt: now,
              })
              .where(eq(scheduledFollowups.id, followup.id));
            errorCount++;
            continue;
          }

          // Send the follow-up message
          await (await getDb())!.insert(chatMessages).values({
            conversationId: followup.conversationId,
            senderId: 0, // System message
            senderType: "office",
            message: followup.messageTemplate,
            messageType: "system",
          });

          // Mark follow-up as sent
          await (await getDb())!
            .update(scheduledFollowups)
            .set({
              status: "sent",
              sentAt: now,
            })
            .where(eq(scheduledFollowups.id, followup.id));

          sentCount++;
          console.log(`[FollowUp Job] Sent follow-up for conversation ${followup.conversationId}`);
        } catch (error) {
          console.error(`[FollowUp Job] Error sending follow-up ${followup.id}:`, error);
          
          // Mark as failed
          await (await getDb())!
            .update(scheduledFollowups)
            .set({
              status: "cancelled", // Use cancelled for failed attempts
              sentAt: now,
            })
            .where(eq(scheduledFollowups.id, followup.id));
          errorCount++;
        }
      }

      if (sentCount > 0 || errorCount > 0) {
        console.log(`[FollowUp Job] Completed: ${sentCount} sent, ${errorCount} failed`);
      }
    } catch (error) {
      console.error("[FollowUp Job] Fatal error:", error);
    }
  });

  console.log("[FollowUp Job] Scheduler started - checking every 5 minutes");
}
