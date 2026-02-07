import { checkQualityAndCreateAlerts } from "./qualityMonitoring";

/**
 * Scheduled job to check translation quality metrics
 * Runs every 6 hours to monitor quality and send alerts
 */
export async function runQualityMonitoringJob() {
  console.log("[Quality Monitoring] Starting quality check...");

  try {
    const { alertsCreated, metrics } = await checkQualityAndCreateAlerts();

    console.log("[Quality Monitoring] Quality check completed");
    console.log(`  - Accuracy Score: ${metrics.accuracyScore}%`);
    console.log(`  - Revision Rate: ${metrics.revisionRate}%`);
    console.log(`  - Memory Usage Rate: ${metrics.memoryUsageRate}%`);
    console.log(`  - Alerts Created: ${alertsCreated}`);

    if (alertsCreated > 0) {
      console.log(`[Quality Monitoring] ⚠️  ${alertsCreated} quality alert(s) created and sent`);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "Database not available") {
      console.warn("[Quality Monitoring] Database not available, skipping check.");
    } else {
      console.error("[Quality Monitoring] Error during quality check:", error);
    }
  }
}

// Run quality check every 6 hours
const SIX_HOURS = 6 * 60 * 60 * 1000;

export function startQualityMonitoringScheduler() {
  // Run immediately on startup
  runQualityMonitoringJob();

  // Then run every 6 hours
  setInterval(runQualityMonitoringJob, SIX_HOURS);

  console.log("[Quality Monitoring] Scheduler started - checking every 6 hours");
}
