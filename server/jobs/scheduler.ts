import cron from "node-cron";
import { checkDocumentExpiry } from "./documentExpiryReminders";
import { sendReviewRequests } from "./reviewRequestJob";

/**
 * Initialize all scheduled jobs
 */
export function initializeScheduledJobs() {
  console.log("[Scheduler] Initializing scheduled jobs...");

  // Document Expiry Reminders - Run daily at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("[Scheduler] Running document expiry check job...");
    try {
      await checkDocumentExpiry();
    } catch (error) {
      console.error("[Scheduler] Document expiry check failed:", error);
    }
  });

  // Review Requests - Run daily at 10:00 AM (24h after booking completion)
  cron.schedule("0 10 * * *", async () => {
    console.log("[Scheduler] Running review request job...");
    try {
      await sendReviewRequests();
    } catch (error) {
      console.error("[Scheduler] Review request job failed:", error);
    }
  });

  console.log("[Scheduler] Scheduled jobs initialized:");
  console.log("  - Document Expiry Reminders: Daily at 9:00 AM");
  console.log("  - Review Requests: Daily at 10:00 AM");
}
