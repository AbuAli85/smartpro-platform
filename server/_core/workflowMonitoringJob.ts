import cron from "node-cron";
import { runWorkflowMonitoring } from "./workflowMonitoring";

/**
 * Initialize workflow monitoring scheduled job
 * Runs daily at 9:00 AM to scan for untranslated content
 */
export function initializeWorkflowMonitoringJob() {
  // Run every day at 9:00 AM
  // Cron format: minute hour day month weekday
  const cronExpression = "0 9 * * *";
  
  console.log("[Workflow Monitoring Job] Initializing daily monitoring job (runs at 9:00 AM)");
  
  cron.schedule(cronExpression, async () => {
    console.log("[Workflow Monitoring Job] Starting scheduled content scan...");
    try {
      await runWorkflowMonitoring();
      console.log("[Workflow Monitoring Job] Scheduled scan completed successfully");
    } catch (error) {
      console.error("[Workflow Monitoring Job] Error during scheduled scan:", error);
    }
  });
  
  // Also run once on startup (for testing and immediate results)
  console.log("[Workflow Monitoring Job] Running initial content scan on startup...");
  runWorkflowMonitoring().catch((error) => {
    console.error("[Workflow Monitoring Job] Error during startup scan:", error);
  });
}
