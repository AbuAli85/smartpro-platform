import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// SMS templates in English and Arabic
const templates = {
  bookingConfirmation: {
    en: (data: { customerName: string; officeName: string; bookingDate: string; bookingId: string }) =>
      `Hello ${data.customerName}, your booking at ${data.officeName} on ${data.bookingDate} is confirmed. Booking ID: ${data.bookingId}. - SmartPro`,
    ar: (data: { customerName: string; officeName: string; bookingDate: string; bookingId: string }) =>
      `مرحباً ${data.customerName}، تم تأكيد حجزك في ${data.officeName} بتاريخ ${data.bookingDate}. رقم الحجز: ${data.bookingId}. - سمارت برو`,
  },
  followUpReminder: {
    en: (data: { customerName: string; officeName: string }) =>
      `Hello ${data.customerName}, this is a friendly reminder from ${data.officeName}. We're here to help! - SmartPro`,
    ar: (data: { customerName: string; officeName: string }) =>
      `مرحباً ${data.customerName}، هذا تذكير ودي من ${data.officeName}. نحن هنا للمساعدة! - سمارت برو`,
  },
  statusUpdate: {
    en: (data: { customerName: string; serviceName: string; status: string }) =>
      `Hello ${data.customerName}, your service "${data.serviceName}" status: ${data.status}. - SmartPro`,
    ar: (data: { customerName: string; serviceName: string; status: string }) =>
      `مرحباً ${data.customerName}، حالة خدمة "${data.serviceName}": ${data.status}. - سمارت برو`,
  },
};

type TemplateType = keyof typeof templates;
type Language = "en" | "ar";

export async function sendBilingualSMS(
  to: string,
  templateType: TemplateType,
  data: any,
  language: Language = "en"
) {
  const template = templates[templateType][language];
  const message = template(data);
  
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`SMS sent successfully to ${to} in ${language}:`, result.sid);
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    return { success: false, error };
  }
}

// Helper to determine user's preferred language
export function getUserLanguage(userPreference?: string | null): Language {
  if (userPreference === "ar") return "ar";
  return "en";
}
