import * as db from "../db";
import { sendEmail } from "../_core/email";

interface ExpiryCheck {
  officeId: number;
  officeName: string;
  ownerEmail: string;
  documentType: string;
  expiryDate: Date;
  daysUntilExpiry: number;
}

/**
 * Check all offices for expiring documents and send reminder emails
 * Runs daily via cron job
 */
export async function checkDocumentExpiry() {
  console.log("[Document Expiry] Starting daily expiry check...");

  try {
    const offices = await db.getAllOffices();
    const now = new Date();
    const checksToNotify: ExpiryCheck[] = [];

    for (const office of offices) {
      // Skip if office doesn't have email
      if (!office.email) continue;

      // Check each document type
      const documents = [
        { type: "Business License", date: office.licenseExpiryDate },
        { type: "Trade License", date: office.tradeLicenseExpiryDate },
        { type: "Tax Registration", date: office.taxRegistrationExpiryDate },
      ];

      for (const doc of documents) {
        if (!doc.date) continue;

        const expiryDate = new Date(doc.date);
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Check if we need to send a reminder
        // Send at exactly 30 days, 7 days, and when expired (0 or negative)
        if (diffDays === 30 || diffDays === 7 || diffDays === 0) {
          checksToNotify.push({
            officeId: office.id,
            officeName: office.officeName,
            ownerEmail: office.email,
            documentType: doc.type,
            expiryDate: expiryDate,
            daysUntilExpiry: diffDays,
          });
        }
      }
    }

    console.log(`[Document Expiry] Found ${checksToNotify.length} notifications to send`);

    // Send emails
    let successCount = 0;
    for (const check of checksToNotify) {
      try {
        await sendExpiryReminderEmail(check);
        successCount++;
      } catch (error) {
        console.error(
          `[Document Expiry] Failed to send email to ${check.ownerEmail}:`,
          error
        );
      }
    }

    console.log(
      `[Document Expiry] Sent ${successCount}/${checksToNotify.length} reminder emails`
    );

    return {
      success: true,
      checked: offices.length,
      notificationsSent: successCount,
    };
  } catch (error) {
    console.error("[Document Expiry] Error in expiry check:", error);
    throw error;
  }
}

/**
 * Send expiry reminder email based on urgency level
 */
async function sendExpiryReminderEmail(check: ExpiryCheck) {
  const { officeName, ownerEmail, documentType, expiryDate, daysUntilExpiry } = check;

  let subject: string;
  let urgencyLevel: string;
  let actionText: string;
  let urgencyColor: string;

  if (daysUntilExpiry === 0 || daysUntilExpiry < 0) {
    subject = `🚨 URGENT: ${documentType} Has Expired - ${officeName}`;
    urgencyLevel = "EXPIRED";
    actionText = "Your document has expired. Please renew immediately to avoid service suspension.";
    urgencyColor = "#dc2626"; // red-600
  } else if (daysUntilExpiry === 7) {
    subject = `⚠️ CRITICAL: ${documentType} Expires in 7 Days - ${officeName}`;
    urgencyLevel = "CRITICAL";
    actionText = "Your document expires in 7 days. Please start the renewal process immediately.";
    urgencyColor = "#ea580c"; // orange-600
  } else {
    subject = `📅 Reminder: ${documentType} Expires in 30 Days - ${officeName}`;
    urgencyLevel = "WARNING";
    actionText = "Your document expires in 30 days. Please plan for renewal to ensure continuity.";
    urgencyColor = "#ca8a04"; // yellow-600
  }

  const formattedDate = expiryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: ${urgencyColor}; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Document Expiry Alert
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                ${urgencyLevel}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.6;">
                Dear ${officeName} Team,
              </p>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                ${actionText}
              </p>

              <!-- Document Details Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                          Document Type:
                        </td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 700; text-align: right;">
                          ${documentType}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                          Expiry Date:
                        </td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 700; text-align: right;">
                          ${formattedDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                          Days Remaining:
                        </td>
                        <td style="padding: 8px 0; color: ${urgencyColor}; font-size: 18px; font-weight: 700; text-align: right;">
                          ${daysUntilExpiry <= 0 ? "EXPIRED" : `${daysUntilExpiry} days`}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.VITE_OAUTH_PORTAL_URL || "https://app.manus.im"}/document-expiry" 
                       style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Update Expiry Date
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Important Notice -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Important:</strong> Expired documents may result in service suspension. Please renew your documents promptly to maintain uninterrupted service.
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have already renewed this document, please update the expiry date in your dashboard.
              </p>

              <p style="margin: 20px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>SmartPro Platform Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.6;">
                This is an automated reminder from SmartPro Platform<br>
                © ${new Date().getFullYear()} SmartPro. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await sendEmail({
    to: ownerEmail,
    subject: subject,
    html: html,
  });

  console.log(`[Document Expiry] Sent ${urgencyLevel} email to ${ownerEmail} for ${documentType}`);
}
