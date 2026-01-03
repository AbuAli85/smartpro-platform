import { describe, it, expect } from "vitest";

// Increase timeout for API calls
const API_TIMEOUT = 15000;
import { Resend } from "resend";
import twilio from "twilio";

describe("Email/SMS API Credentials", () => {
  it("should validate Resend API key", { timeout: API_TIMEOUT }, async () => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping test");
      return;
    }

    const resend = new Resend(RESEND_API_KEY);

    try {
      // Test API key by attempting to retrieve API key info
      // Resend will return 401 if the key is invalid
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev", // Resend's test domain
        to: "delivered@resend.dev", // Resend's test email
        subject: "SmartPro API Test",
        text: "Testing Resend API credentials",
      });

      if (error) {
        console.error("Resend API error:", error);
        throw new Error(`Resend API validation failed: ${error.message}`);
      }

      expect(data).toBeDefined();
      expect(data?.id).toBeDefined();
      console.log("✓ Resend API key is valid");
    } catch (error: any) {
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        throw new Error("Invalid RESEND_API_KEY - please check your API key");
      }
      throw error;
    }
  });

  it("should validate Twilio credentials", { timeout: API_TIMEOUT }, async () => {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.warn("Twilio credentials not configured, skipping test");
      return;
    }

    try {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

      // Validate credentials by fetching account info
      const account = await client.api.accounts(TWILIO_ACCOUNT_SID).fetch();

      expect(account).toBeDefined();
      expect(account.sid).toBe(TWILIO_ACCOUNT_SID);
      expect(account.status).toBe("active");
      console.log("✓ Twilio credentials are valid");
    } catch (error: any) {
      if (error.status === 401 || error.message?.includes("authenticate")) {
        throw new Error("Invalid Twilio credentials - please check your Account SID and Auth Token");
      }
      throw error;
    }
  });

  it("should validate Twilio phone number format", () => {
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

    if (!TWILIO_PHONE_NUMBER) {
      console.warn("TWILIO_PHONE_NUMBER not configured, skipping test");
      return;
    }

    // Check if phone number starts with + and contains only digits
    const phoneRegex = /^\+\d{10,15}$/;
    expect(phoneRegex.test(TWILIO_PHONE_NUMBER)).toBe(true);
    console.log("✓ Twilio phone number format is valid");
  });
});
