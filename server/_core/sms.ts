// Use process.env directly for Twilio variables

/**
 * Format phone number to E.164 format
 * Assumes Omani phone numbers starting with +968
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 968, add +
  if (cleaned.startsWith("968")) {
    return `+${cleaned}`;
  }

  // If starts with 0, replace with +968
  if (cleaned.startsWith("0")) {
    return `+968${cleaned.substring(1)}`;
  }

  // If 8 digits, assume Omani number
  if (cleaned.length === 8) {
    return `+968${cleaned}`;
  }

  // Otherwise return as-is with +
  return cleaned.startsWith("+") ? phone : `+${cleaned}`;
}

interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  const { to, message } = options;
  
  // Format phone number
  const formattedTo = formatPhoneNumber(to);
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !fromPhone) {
    console.error("[SMS] Twilio credentials not configured");
    return false;
  }
  
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: fromPhone,
          Body: message,
        }).toString(),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error("[SMS] Failed to send SMS:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[SMS] Error sending SMS:", error);
    return false;
  }
}

/**
 * Send bulk SMS messages
 */
export async function sendBulkSMS(
  messages: Array<{ to: string; message: string }>
): Promise<{ sent: number; failed: number; results: Array<{ to: string; success: boolean }> }> {
  const results: Array<{ to: string; success: boolean }> = [];
  let sent = 0;
  let failed = 0;

  for (const msg of messages) {
    const success = await sendSMS(msg);
    results.push({
      to: msg.to,
      success,
    });

    if (success) {
      sent++;
    } else {
      failed++;
    }

    // Add small delay between messages to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { sent, failed, results };
}
