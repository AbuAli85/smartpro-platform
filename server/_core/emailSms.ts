import sgMail from "@sendgrid/mail";
import twilio from "twilio";

// Initialize SendGrid (optional - only if API key is provided)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@smartpro.om";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Initialize Twilio (optional - only if credentials are provided)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Send email notification
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.warn("SendGrid API key not configured. Email not sent.");
    return false;
  }

  try {
    await sgMail.send({
      to: params.to,
      from: SENDGRID_FROM_EMAIL,
      subject: params.subject,
      text: params.text,
      html: params.html || params.text,
    });
    console.log(`Email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send SMS notification
 */
export async function sendSMS(params: {
  to: string;
  message: string;
}): Promise<boolean> {
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    console.warn("Twilio not configured. SMS not sent.");
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: params.message,
      from: TWILIO_PHONE_NUMBER,
      to: params.to,
    });
    console.log(`SMS sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(params: {
  userEmail: string;
  userName: string;
  officeName: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceDescription: string;
}): Promise<boolean> {
  const subject = `Booking Confirmation - ${params.officeName}`;
  const text = `
Dear ${params.userName},

Your booking has been confirmed!

Office: ${params.officeName}
Date: ${params.scheduledDate}
Time: ${params.scheduledTime}
Service: ${params.serviceDescription}

We look forward to serving you.

Best regards,
SmartPro Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003366;">Booking Confirmation</h2>
      <p>Dear ${params.userName},</p>
      <p>Your booking has been confirmed!</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Office:</strong> ${params.officeName}</p>
        <p><strong>Date:</strong> ${params.scheduledDate}</p>
        <p><strong>Time:</strong> ${params.scheduledTime}</p>
        <p><strong>Service:</strong> ${params.serviceDescription}</p>
      </div>
      <p>We look forward to serving you.</p>
      <p style="color: #666;">Best regards,<br>SmartPro Team</p>
    </div>
  `;

  return await sendEmail({
    to: params.userEmail,
    subject,
    text,
    html,
  });
}

/**
 * Send booking reminder SMS
 */
export async function sendBookingReminderSMS(params: {
  userPhone: string;
  userName: string;
  officeName: string;
  scheduledDate: string;
  scheduledTime: string;
}): Promise<boolean> {
  const message = `Reminder: ${params.userName}, your appointment at ${params.officeName} is scheduled for ${params.scheduledDate} at ${params.scheduledTime}. SmartPro`;

  return await sendSMS({
    to: params.userPhone,
    message,
  });
}

/**
 * Send office verification email
 */
export async function sendOfficeVerificationEmail(params: {
  officeEmail: string;
  officeName: string;
  status: "approved" | "rejected";
  reason?: string;
}): Promise<boolean> {
  const isApproved = params.status === "approved";
  const subject = `Office ${isApproved ? "Approved" : "Rejected"} - SmartPro Platform`;
  
  const text = isApproved
    ? `
Dear ${params.officeName},

Congratulations! Your office has been approved and is now active on the SmartPro platform.

You can now start receiving bookings from SMEs across Oman.

Best regards,
MOCIP - SmartPro Team
    `.trim()
    : `
Dear ${params.officeName},

We regret to inform you that your office registration has been rejected.

Reason: ${params.reason || "Not specified"}

Please contact us for more information.

Best regards,
MOCIP - SmartPro Team
    `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isApproved ? "#10b981" : "#ef4444"};">
        Office ${isApproved ? "Approved" : "Rejected"}
      </h2>
      <p>Dear ${params.officeName},</p>
      ${
        isApproved
          ? `
        <p>Congratulations! Your office has been approved and is now active on the SmartPro platform.</p>
        <p>You can now start receiving bookings from SMEs across Oman.</p>
      `
          : `
        <p>We regret to inform you that your office registration has been rejected.</p>
        <div style="background: #fee; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reason:</strong> ${params.reason || "Not specified"}</p>
        </div>
        <p>Please contact us for more information.</p>
      `
      }
      <p style="color: #666;">Best regards,<br>MOCIP - SmartPro Team</p>
    </div>
  `;

  return await sendEmail({
    to: params.officeEmail,
    subject,
    text,
    html,
  });
}
