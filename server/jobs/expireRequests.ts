/**
 * Scheduled job to automatically expire service requests past their deadline
 * This should be run periodically (e.g., every hour) via cron or similar
 */

import * as db from "../db";

export async function expireOldRequests() {
  try {
    console.log("[ExpireRequests] Starting expiration check...");
    
    const expiredCount = await db.expireOldServiceRequests();
    
    if (expiredCount > 0) {
      console.log(`[ExpireRequests] Expired ${expiredCount} requests`);
    } else {
      console.log("[ExpireRequests] No requests to expire");
    }
    
    return { success: true, expiredCount };
  } catch (error) {
    console.error("[ExpireRequests] Failed to expire requests:", error);
    return { success: false, error };
  }
}

// Run immediately if called directly
if (require.main === module) {
  expireOldRequests()
    .then((result) => {
      console.log("[ExpireRequests] Job completed:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("[ExpireRequests] Job failed:", error);
      process.exit(1);
    });
}
