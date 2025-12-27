/**
 * WhatsApp Business messaging via Twilio
 * 
 * Prerequisites:
 * - Twilio account with WhatsApp enabled
 * - WhatsApp Business Profile approved
 * - Message templates approved by WhatsApp
 * 
 * Environment variables (already configured):
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER (must be WhatsApp-enabled)
 */

import { formatPhoneNumber } from "./sms";

interface WhatsAppMessageOptions {
  to: string;
  body: string;
  mediaUrl?: string; // Optional image, PDF, or other media
}

interface WhatsAppTemplateOptions {
  to: string;
  templateSid: string; // Twilio Content SID for approved template
  contentVariables?: Record<string, string>; // Template variables
}

/**
 * Send a WhatsApp message via Twilio
 * Note: For production use, messages must use approved templates
 * or be sent within 24-hour session window after user message
 */
export async function sendWhatsAppMessage(
  options: WhatsAppMessageOptions
): Promise<boolean> {
  const { to, body, mediaUrl } = options;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    console.error("[WhatsApp] Missing Twilio credentials");
    return false;
  }

  try {
    // Format phone number to E.164
    const formattedTo = `whatsapp:${formatPhoneNumber(to)}`;
    const formattedFrom = `whatsapp:${fromPhone}`;

    const requestBody: Record<string, string> = {
      To: formattedTo,
      From: formattedFrom,
      Body: body,
    };

    // Add media if provided
    if (mediaUrl) {
      requestBody.MediaUrl = mediaUrl;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams(requestBody).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[WhatsApp] Error sending message:", error);
      return false;
    }

    const result = await response.json();
    console.log(`[WhatsApp] Message sent successfully: ${result.sid}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
    return false;
  }
}

/**
 * Send a WhatsApp message using an approved template
 * Templates must be pre-approved by WhatsApp for compliance
 */
export async function sendWhatsAppTemplate(
  options: WhatsAppTemplateOptions
): Promise<boolean> {
  const { to, templateSid, contentVariables } = options;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    console.error("[WhatsApp] Missing Twilio credentials");
    return false;
  }

  try {
    const formattedTo = `whatsapp:${formatPhoneNumber(to)}`;
    const formattedFrom = `whatsapp:${fromPhone}`;

    const requestBody: Record<string, string> = {
      To: formattedTo,
      From: formattedFrom,
      ContentSid: templateSid,
    };

    // Add template variables if provided
    if (contentVariables) {
      requestBody.ContentVariables = JSON.stringify(contentVariables);
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams(requestBody).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[WhatsApp] Error sending template:", error);
      return false;
    }

    const result = await response.json();
    console.log(`[WhatsApp] Template sent successfully: ${result.sid}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending template:", error);
    return false;
  }
}

/**
 * Send booking confirmation via WhatsApp
 */
export async function sendBookingConfirmation(
  phoneNumber: string,
  bookingDetails: {
    bookingId: string;
    officeName: string;
    serviceName: string;
    appointmentDate: string;
    totalPrice: string;
  }
): Promise<boolean> {
  const { bookingId, officeName, serviceName, appointmentDate, totalPrice } = bookingDetails;

  const message = `✅ *Booking Confirmed*

Your booking has been confirmed!

📋 *Booking ID:* ${bookingId}
🏢 *Office:* ${officeName}
📦 *Service:* ${serviceName}
📅 *Date:* ${appointmentDate}
💰 *Total:* ${totalPrice} OMR

Thank you for using SmartPro! We'll notify you of any updates.`;

  return await sendWhatsAppMessage({
    to: phoneNumber,
    body: message,
  });
}

/**
 * Send document status update via WhatsApp
 */
export async function sendDocumentStatusUpdate(
  phoneNumber: string,
  statusDetails: {
    bookingId: string;
    documentType: string;
    status: "processing" | "ready" | "completed";
    message?: string;
  }
): Promise<boolean> {
  const { bookingId, documentType, status, message: customMessage } = statusDetails;

  let emoji = "⏳";
  let statusText = "Processing";

  if (status === "ready") {
    emoji = "✅";
    statusText = "Ready for Collection";
  } else if (status === "completed") {
    emoji = "🎉";
    statusText = "Completed";
  }

  const message = `${emoji} *Document Update*

*Booking ID:* ${bookingId}
*Document:* ${documentType}
*Status:* ${statusText}

${customMessage || "Your document is being processed. We'll keep you updated!"}

- SmartPro Team`;

  return await sendWhatsAppMessage({
    to: phoneNumber,
    body: message,
  });
}

/**
 * Send bulk WhatsApp messages
 */
export async function sendBulkWhatsApp(
  messages: Array<{ to: string; body: string; mediaUrl?: string }>
): Promise<{ sent: number; failed: number; results: Array<{ to: string; success: boolean }> }> {
  const results: Array<{ to: string; success: boolean }> = [];
  let sent = 0;
  let failed = 0;

  for (const msg of messages) {
    const success = await sendWhatsAppMessage(msg);
    results.push({
      to: msg.to,
      success,
    });

    if (success) {
      sent++;
    } else {
      failed++;
    }

    // Add delay between messages to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return { sent, failed, results };
}
