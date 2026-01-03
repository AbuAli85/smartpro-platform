import { getDb } from "../db";
import { sanadOffices, documentTemplates, bookings, generatedDocuments, untranslatedContentAlerts } from "../../drizzle/schema";
import { isNull, or, sql, eq, and, desc } from "drizzle-orm";
import { sendEmail } from "./email";

interface UntranslatedItem {
  id: number;
  type: "office" | "template";
  name: string;
  nameAr: string | null;
  descriptionAr: string | null;
  usageCount: number;
  priorityScore: number;
  missingFields: string[];
}

/**
 * Scan for untranslated offices and templates
 * Returns items with missing Arabic translations
 */
export async function scanUntranslatedContent(): Promise<UntranslatedItem[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const untranslatedItems: UntranslatedItem[] = [];

  // Scan offices for missing Arabic translations
  const officesData = await db
    .select({
      id: sanadOffices.id,
      name: sanadOffices.officeName,
      nameAr: sanadOffices.officeNameAr,
      description: sanadOffices.description,
      descriptionAr: sanadOffices.descriptionAr,
    })
    .from(sanadOffices)
    .where(eq(sanadOffices.verificationStatus, "verified"));

  for (const office of officesData) {
    const missingFields: string[] = [];
    if (!office.nameAr) missingFields.push("officeName");
    if (!office.descriptionAr) missingFields.push("description");

    if (missingFields.length > 0) {
      // Get usage count (number of bookings)
      const bookingCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(eq(bookings.officeId, office.id));

      const usageCount = Number(bookingCount[0]?.count || 0);
      const priorityScore = calculatePriorityScore(usageCount, missingFields.length);

      untranslatedItems.push({
        id: office.id,
        type: "office",
        name: office.name,
        nameAr: office.nameAr,
        descriptionAr: office.descriptionAr,
        usageCount,
        priorityScore,
        missingFields,
      });
    }
  }

  // Scan templates for missing Arabic translations
  const templatesData = await db
    .select({
      id: documentTemplates.id,
      title: documentTemplates.templateName,
      titleAr: documentTemplates.templateNameAr,
      description: documentTemplates.description,
      descriptionAr: documentTemplates.descriptionAr,
    })
    .from(documentTemplates)
    .where(eq(documentTemplates.isActive, true));

  for (const template of templatesData) {
    const missingFields: string[] = [];
    if (!template.titleAr) missingFields.push("templateName");
    if (!template.descriptionAr) missingFields.push("description");

    if (missingFields.length > 0) {
      // Get usage count (number of generated documents)
      const docCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(generatedDocuments)
        .where(eq(generatedDocuments.templateId, template.id));

      const usageCount = Number(docCount[0]?.count || 0);
      const priorityScore = calculatePriorityScore(usageCount, missingFields.length);

      untranslatedItems.push({
        id: template.id,
        type: "template",
        name: template.title,
        nameAr: template.titleAr,
        descriptionAr: template.descriptionAr,
        usageCount,
        priorityScore,
        missingFields,
      });
    }
  }

  // Sort by priority score (highest first)
  return untranslatedItems.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Calculate priority score based on usage frequency and missing fields
 * Higher score = higher priority
 */
function calculatePriorityScore(usageCount: number, missingFieldsCount: number): number {
  // Base score from usage (logarithmic scale to prevent extreme values)
  const usageScore = Math.log10(usageCount + 1) * 20;
  
  // Penalty for more missing fields (each missing field adds 10 points)
  const missingFieldsScore = missingFieldsCount * 10;
  
  // Total priority score
  return Math.round(usageScore + missingFieldsScore);
}

/**
 * Save untranslated content alerts to database
 */
export async function saveUntranslatedAlerts(items: UntranslatedItem[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (const item of items) {
    // Check if alert already exists for this item
    const existing = await db
      .select()
      .from(untranslatedContentAlerts)
      .where(
        and(
          eq(untranslatedContentAlerts.contentType, item.type),
          eq(untranslatedContentAlerts.contentId, item.id),
          eq(untranslatedContentAlerts.status, "pending")
        )
      )
      .limit(1);

    if (existing.length === 0) {
      // Create new alert
      // Determine priority level based on score
      let priority: "low" | "medium" | "high" | "critical" = "low";
      if (item.priorityScore >= 40) priority = "critical";
      else if (item.priorityScore >= 30) priority = "high";
      else if (item.priorityScore >= 15) priority = "medium";
      
      await db.insert(untranslatedContentAlerts).values({
        contentType: item.type,
        contentId: item.id,
        priority,
        status: "pending",
        notificationSent: 0,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Update existing alert priority if changed
      let priority: "low" | "medium" | "high" | "critical" = "low";
      if (item.priorityScore >= 40) priority = "critical";
      else if (item.priorityScore >= 30) priority = "high";
      else if (item.priorityScore >= 15) priority = "medium";
      
      if (existing[0].priority !== priority) {
        await db
          .update(untranslatedContentAlerts)
          .set({
            priority,
          })
          .where(eq(untranslatedContentAlerts.id, existing[0].id));
      }
    }
  }
}

/**
 * Generate HTML email content for untranslated content alerts
 */
function generateAlertEmail(items: UntranslatedItem[]): string {
  const highPriority = items.filter(item => item.priorityScore >= 30);
  const mediumPriority = items.filter(item => item.priorityScore >= 15 && item.priorityScore < 30);
  const lowPriority = items.filter(item => item.priorityScore < 15);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #003366 0%, #004488 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .priority-section { margin: 20px 0; }
        .priority-high { border-left: 4px solid #dc2626; padding-left: 15px; }
        .priority-medium { border-left: 4px solid #f59e0b; padding-left: 15px; }
        .priority-low { border-left: 4px solid #10b981; padding-left: 15px; }
        .item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .item-header { font-weight: bold; font-size: 16px; margin-bottom: 8px; }
        .item-meta { font-size: 14px; color: #666; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px; }
        .badge-office { background: #dbeafe; color: #1e40af; }
        .badge-template { background: #fef3c7; color: #92400e; }
        .cta { display: inline-block; background: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Daily Translation Alert</h1>
          <p>Untranslated Content Report - ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
          <p>Hello Admin,</p>
          <p>The following content items require Arabic translation. Items are prioritized based on usage frequency and completeness.</p>
          
          ${highPriority.length > 0 ? `
          <div class="priority-section priority-high">
            <h2 style="color: #dc2626;">🔴 High Priority (${highPriority.length} items)</h2>
            ${highPriority.map(item => `
              <div class="item">
                <div class="item-header">
                  <span class="badge ${item.type === 'office' ? 'badge-office' : 'badge-template'}">${item.type.toUpperCase()}</span>
                  ${item.name}
                </div>
                <div class="item-meta">
                  <strong>Missing:</strong> ${item.missingFields.join(", ")} | 
                  <strong>Usage:</strong> ${item.usageCount} times | 
                  <strong>Priority Score:</strong> ${item.priorityScore}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${mediumPriority.length > 0 ? `
          <div class="priority-section priority-medium">
            <h2 style="color: #f59e0b;">🟡 Medium Priority (${mediumPriority.length} items)</h2>
            ${mediumPriority.map(item => `
              <div class="item">
                <div class="item-header">
                  <span class="badge ${item.type === 'office' ? 'badge-office' : 'badge-template'}">${item.type.toUpperCase()}</span>
                  ${item.name}
                </div>
                <div class="item-meta">
                  <strong>Missing:</strong> ${item.missingFields.join(", ")} | 
                  <strong>Usage:</strong> ${item.usageCount} times | 
                  <strong>Priority Score:</strong> ${item.priorityScore}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${lowPriority.length > 0 ? `
          <div class="priority-section priority-low">
            <h2 style="color: #10b981;">🟢 Low Priority (${lowPriority.length} items)</h2>
            ${lowPriority.map(item => `
              <div class="item">
                <div class="item-header">
                  <span class="badge ${item.type === 'office' ? 'badge-office' : 'badge-template'}">${item.type.toUpperCase()}</span>
                  ${item.name}
                </div>
                <div class="item-meta">
                  <strong>Missing:</strong> ${item.missingFields.join(", ")} | 
                  <strong>Usage:</strong> ${item.usageCount} times | 
                  <strong>Priority Score:</strong> ${item.priorityScore}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://smartpro.manus.space'}/admin/translations" class="cta">
              Go to Translation Dashboard
            </a>
          </div>
          
          <div class="footer">
            <p>This is an automated daily report from SmartPro Translation System.</p>
            <p>To manage translation alerts, visit the admin dashboard.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send consolidated email alert to admins
 */
export async function sendUntranslatedContentAlert(items: UntranslatedItem[]): Promise<boolean> {
  if (items.length === 0) {
    console.log("[Workflow Monitoring] No untranslated content found. Skipping email alert.");
    return true;
  }

  const emailHtml = generateAlertEmail(items);
  
  try {
    await sendEmail({
      to: process.env.OWNER_EMAIL || "admin@smartpro.om",
      subject: `🔔 Daily Translation Alert: ${items.length} items need translation`,
      html: emailHtml,
    });
    
    console.log(`[Workflow Monitoring] Sent alert email for ${items.length} untranslated items`);
    return true;
  } catch (error) {
    console.error("[Workflow Monitoring] Failed to send alert email:", error);
    return false;
  }
}

/**
 * Main workflow monitoring function
 * Scans content, saves alerts, and sends email
 */
export async function runWorkflowMonitoring(): Promise<void> {
  console.log("[Workflow Monitoring] Starting daily content scan...");
  
  try {
    // Scan for untranslated content
    const untranslatedItems = await scanUntranslatedContent();
    console.log(`[Workflow Monitoring] Found ${untranslatedItems.length} untranslated items`);
    
    if (untranslatedItems.length > 0) {
      // Save alerts to database
      await saveUntranslatedAlerts(untranslatedItems);
      console.log("[Workflow Monitoring] Saved alerts to database");
      
      // Send email notification
      await sendUntranslatedContentAlert(untranslatedItems);
    }
    
    console.log("[Workflow Monitoring] Daily content scan completed successfully");
  } catch (error) {
    console.error("[Workflow Monitoring] Error during content scan:", error);
    throw error;
  }
}
