// Use process.env directly for Twilio variables

interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  const { to, message } = options;
  
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
          To: to,
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
