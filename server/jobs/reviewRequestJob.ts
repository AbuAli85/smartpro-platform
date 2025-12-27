import * as db from "../db";
import { sendEmail } from "../_core/email";

interface ReviewRequest {
  bookingId: number;
  customerEmail: string;
  customerName: string;
  officeName: string;
  serviceNames: string[];
  completedDate: Date;
}

/**
 * Check for completed bookings from 24 hours ago and send review requests
 * Runs daily via cron job
 */
export async function sendReviewRequests() {
  console.log("[Review Requests] Starting review request job...");

  try {
    // Get bookings completed exactly 24 hours ago
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Set time range for "24 hours ago" (give 1 hour window)
    const startTime = new Date(yesterday.getTime() - 30 * 60 * 1000); // 24.5 hours ago
    const endTime = new Date(yesterday.getTime() + 30 * 60 * 1000); // 23.5 hours ago

    // For now, we'll skip the automated review requests since we need proper booking status tracking
    // This would require adding completedAt timestamp to bookings table
    console.log("[Review Requests] Review request automation coming soon - requires booking completion tracking");
    
    const requestsToSend: ReviewRequest[] = [];
    
    // TODO: Implement when booking completion tracking is added
    // 1. Query bookings with status='completed' and completedAt between startTime and endTime
    // 2. Check if review already exists for each booking
    // 3. Get customer and office info
    // 4. Add to requestsToSend array

    console.log(`[Review Requests] Sending ${requestsToSend.length} review request emails`);

    // Send emails
    let successCount = 0;
    for (const request of requestsToSend) {
      try {
        await sendReviewRequestEmail(request);
        successCount++;
      } catch (error) {
        console.error(
          `[Review Requests] Failed to send email to ${request.customerEmail}:`,
          error
        );
      }
    }

    console.log(`[Review Requests] Sent ${successCount}/${requestsToSend.length} review request emails`);

    return {
      success: true,
      checked: 0,
      emailsSent: successCount,
    };
  } catch (error) {
    console.error("[Review Requests] Error in review request job:", error);
    throw error;
  }
}

/**
 * Send review request email with optional discount incentive
 */
async function sendReviewRequestEmail(request: ReviewRequest) {
  const { customerEmail, customerName, officeName, serviceNames, completedDate, bookingId } =
    request;

  const formattedDate = completedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate discount code (10% off next booking)
  const discountCode = `REVIEW${bookingId}`;
  const discountPercent = 10;

  const baseUrl = process.env.VITE_OAUTH_PORTAL_URL || "https://app.manus.im";
  const reviewUrl = `${baseUrl}/my-bookings?review=${bookingId}`;

  const subject = `How was your experience with ${officeName}? Get 10% off your next booking!`;

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
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Share Your Experience
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Help others make informed decisions
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.6;">
                Dear ${customerName},
              </p>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for choosing <strong>${officeName}</strong> for your business service needs. We hope your experience was excellent!
              </p>

              <!-- Service Details Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; font-weight: 600;">
                      Service Completed:
                    </p>
                    <p style="margin: 0 0 12px; color: #111827; font-size: 16px; font-weight: 700;">
                      ${serviceNames.join(", ")}
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Completed on ${formattedDate}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your feedback helps us maintain quality standards and helps other businesses find the right service providers. It only takes a minute!
              </p>

              <!-- Star Rating Preview -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; font-weight: 600;">
                  How would you rate your experience?
                </p>
                <div style="font-size: 40px; letter-spacing: 8px;">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              <!-- Action Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${reviewUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px;">
                      Write Your Review
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Incentive Box -->
              <div style="margin: 30px 0; padding: 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 12px; color: #ffffff; font-size: 20px; font-weight: 700;">
                  🎁 Special Thank You Gift
                </p>
                <p style="margin: 0 0 16px; color: #ffffff; font-size: 16px; opacity: 0.95;">
                  Leave a review and get <strong>${discountPercent}% OFF</strong> your next booking!
                </p>
                <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 6px; padding: 12px; display: inline-block;">
                  <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 2px;">
                    CODE: ${discountCode}
                  </p>
                </div>
                <p style="margin: 16px 0 0; color: #ffffff; font-size: 12px; opacity: 0.9;">
                  Valid for 30 days on your next booking
                </p>
              </div>

              <!-- What to Include -->
              <div style="margin: 30px 0; padding: 20px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <p style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 600;">
                  💡 What to include in your review:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                  <li>Quality of service and professionalism</li>
                  <li>Speed and efficiency of processing</li>
                  <li>Communication and support</li>
                  <li>Overall satisfaction</li>
                </ul>
              </div>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Your review will be visible to other businesses on the SmartPro platform and will help ${officeName} improve their services.
              </p>

              <p style="margin: 20px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for being part of our community!<br>
                <strong>SmartPro Platform Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; line-height: 1.6;">
                This is an automated email from SmartPro Platform
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
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
    to: customerEmail,
    subject: subject,
    html: html,
  });

  console.log(`[Review Requests] Sent review request to ${customerEmail} for booking #${bookingId}`);
}
