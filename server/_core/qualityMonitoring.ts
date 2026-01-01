import { getDb } from "../db";
import { qualityAlerts, translationActivityLog, translationMemory } from "../../drizzle/schema";
import { sql, and, gte } from "drizzle-orm";
import { sendEmail } from "./email";

interface QualityMetrics {
  accuracyScore: number;
  revisionRate: number;
  memoryUsageRate: number;
}

interface AlertThresholds {
  minAccuracy: number; // Default: 80
  maxRevisionRate: number; // Default: 30 (%)
  minMemoryUsage: number; // Default: 50 (%)
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  minAccuracy: 80,
  maxRevisionRate: 30,
  minMemoryUsage: 50,
};

/**
 * Calculate current quality metrics
 */
export async function calculateQualityMetrics(): Promise<QualityMetrics> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Calculate accuracy score (based on revision frequency)
  // Lower revision rate = higher accuracy
  const activityStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      revisions: sql<number>`SUM(CASE WHEN ${translationActivityLog.actionType} = 'updated' THEN 1 ELSE 0 END)`,
    })
    .from(translationActivityLog)
    .where(gte(translationActivityLog.createdAt, thirtyDaysAgo));

  const totalActivities = Number(activityStats[0]?.total || 0);
  const revisionCount = Number(activityStats[0]?.revisions || 0);
  const revisionRate = totalActivities > 0 ? (revisionCount / totalActivities) * 100 : 0;
  const accuracyScore = Math.max(0, 100 - revisionRate);

  // Calculate memory usage rate (how often memory suggestions are used)
  const memoryStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
    })
    .from(translationMemory)
    .where(gte(translationMemory.createdAt, thirtyDaysAgo));

  const memoryEntries = Number(memoryStats[0]?.total || 0);
  const memoryUsageRate = totalActivities > 0 ? (memoryEntries / totalActivities) * 100 : 0;

  return {
    accuracyScore: Math.round(accuracyScore * 100) / 100,
    revisionRate: Math.round(revisionRate * 100) / 100,
    memoryUsageRate: Math.round(memoryUsageRate * 100) / 100,
  };
}

/**
 * Check quality metrics and create alerts if thresholds are exceeded
 */
export async function checkQualityAndCreateAlerts(
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Promise<{ alertsCreated: number; metrics: QualityMetrics }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const metrics = await calculateQualityMetrics();
  let alertsCreated = 0;

  // Check accuracy
  if (metrics.accuracyScore < thresholds.minAccuracy) {
    const severity = metrics.accuracyScore < thresholds.minAccuracy - 10 ? "critical" : "warning";
    const message = `Translation accuracy has dropped to ${metrics.accuracyScore}% (threshold: ${thresholds.minAccuracy}%). This indicates frequent revisions and potential quality issues.`;

    await createAlert({
      alertType: "low_accuracy",
      severity,
      currentValue: metrics.accuracyScore,
      thresholdValue: thresholds.minAccuracy,
      message,
    });
    alertsCreated++;
  }

  // Check revision rate
  if (metrics.revisionRate > thresholds.maxRevisionRate) {
    const severity = metrics.revisionRate > thresholds.maxRevisionRate + 10 ? "critical" : "warning";
    const message = `Translation revision rate has increased to ${metrics.revisionRate}% (threshold: ${thresholds.maxRevisionRate}%). High revision rates suggest initial translation quality issues.`;

    await createAlert({
      alertType: "high_revision_rate",
      severity,
      currentValue: metrics.revisionRate,
      thresholdValue: thresholds.maxRevisionRate,
      message,
    });
    alertsCreated++;
  }

  // Check memory usage
  if (metrics.memoryUsageRate < thresholds.minMemoryUsage) {
    const severity = metrics.memoryUsageRate < thresholds.minMemoryUsage - 20 ? "critical" : "warning";
    const message = `Translation memory usage has dropped to ${metrics.memoryUsageRate}% (threshold: ${thresholds.minMemoryUsage}%). Low memory usage may lead to inconsistent translations.`;

    await createAlert({
      alertType: "memory_usage_drop",
      severity,
      currentValue: metrics.memoryUsageRate,
      thresholdValue: thresholds.minMemoryUsage,
      message,
    });
    alertsCreated++;
  }

  return { alertsCreated, metrics };
}

/**
 * Create a quality alert and send email notification
 */
async function createAlert(params: {
  alertType: "low_accuracy" | "high_revision_rate" | "memory_usage_drop";
  severity: "warning" | "critical";
  currentValue: number;
  thresholdValue: number;
  message: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if similar alert already exists (within last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const existingAlerts = await db
    .select()
    .from(qualityAlerts)
    .where(
      and(
        sql`${qualityAlerts.alertType} = ${params.alertType}`,
        gte(qualityAlerts.detectedAt, oneDayAgo),
        sql`${qualityAlerts.status} = 'active'`
      )
    );

  if (existingAlerts.length > 0) {
    console.log(`Similar ${params.alertType} alert already exists, skipping...`);
    return;
  }

  // Create alert
  await db.insert(qualityAlerts).values({
    alertType: params.alertType,
    severity: params.severity,
    currentValue: params.currentValue.toString(),
    thresholdValue: params.thresholdValue.toString(),
    message: params.message,
    status: "active",
    detectedAt: new Date().toISOString().toISOString(),
  });

  // Send email notification
  try {
    const subject = `[${params.severity.toUpperCase()}] Translation Quality Alert: ${params.alertType.replace(/_/g, " ")}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${params.severity === "critical" ? "#dc2626" : "#f59e0b"}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${params.severity === "critical" ? "🚨" : "⚠️"} Quality Alert</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; margin-top: 0;">Translation Quality Issue Detected</h2>
          <p style="color: #374151; line-height: 1.6;">${params.message}</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Alert Type:</td>
                <td style="padding: 8px 0; color: #111827;">${params.alertType.replace(/_/g, " ").toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Severity:</td>
                <td style="padding: 8px 0; color: #111827;">${params.severity.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Current Value:</td>
                <td style="padding: 8px 0; color: #111827;">${params.currentValue}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Threshold:</td>
                <td style="padding: 8px 0; color: #111827;">${params.thresholdValue}%</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #111827; margin-top: 24px;">Recommended Actions:</h3>
          <ul style="color: #374151; line-height: 1.8;">
            ${getRecommendedActions(params.alertType)}
          </ul>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            This is an automated alert from the SmartPro Translation Quality Monitoring System.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: process.env.OWNER_EMAIL || "admin@smartpro.om",
      subject,
      html,
    });

    // Update alert to mark email as sent
    await db
      .update(qualityAlerts)
      .set({
        emailSent: true,
        emailSentAt: new Date().toISOString().toISOString(),
      })
      .where(
        and(
          sql`${qualityAlerts.alertType} = ${params.alertType}`,
          sql`${qualityAlerts.status} = 'active'`
        )
      );

    console.log(`Quality alert email sent for ${params.alertType}`);
  } catch (error) {
    console.error("Failed to send quality alert email:", error);
  }
}

function getRecommendedActions(alertType: string): string {
  switch (alertType) {
    case "low_accuracy":
      return `
        <li>Review recent translations for quality issues</li>
        <li>Provide additional training to translators</li>
        <li>Increase use of translation memory for consistency</li>
        <li>Consider implementing peer review workflow</li>
      `;
    case "high_revision_rate":
      return `
        <li>Analyze common revision patterns to identify root causes</li>
        <li>Improve initial translation quality through better guidelines</li>
        <li>Enhance translator training on common mistakes</li>
        <li>Review and update translation memory with correct versions</li>
      `;
    case "memory_usage_drop":
      return `
        <li>Encourage translators to use translation memory suggestions</li>
        <li>Review and update translation memory database</li>
        <li>Ensure translation memory feature is properly enabled</li>
        <li>Provide training on translation memory benefits</li>
      `;
    default:
      return `<li>Review translation quality dashboard for detailed metrics</li>`;
  }
}

/**
 * Get active alerts
 */
export async function getActiveAlerts() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(qualityAlerts)
    .where(sql`${qualityAlerts.status} = 'active'`)
    .orderBy(sql`${qualityAlerts.detectedAt} DESC`);
}
