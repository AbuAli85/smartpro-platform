import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates in English and Arabic
const templates = {
  bookingConfirmation: {
    en: {
      subject: "Booking Confirmation - SmartPro",
      html: (data: { customerName: string; officeName: string; bookingDate: string; bookingTime: string; bookingId: string }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Booking Confirmed</h1>
          <p>Dear ${data.customerName},</p>
          <p>Your booking has been confirmed successfully.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Booking Details</h2>
            <p><strong>Office:</strong> ${data.officeName}</p>
            <p><strong>Date:</strong> ${data.bookingDate}</p>
            <p><strong>Time:</strong> ${data.bookingTime}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          </div>
          <p>We look forward to serving you!</p>
          <p style="color: #666; font-size: 12px;">SmartPro - National Digital Infrastructure for Business Services</p>
        </div>
      `,
    },
    ar: {
      subject: "تأكيد الحجز - سمارت برو",
      html: (data: { customerName: string; officeName: string; bookingDate: string; bookingTime: string; bookingId: string }) => `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">تم تأكيد الحجز</h1>
          <p>عزيزي ${data.customerName}،</p>
          <p>تم تأكيد حجزك بنجاح.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">تفاصيل الحجز</h2>
            <p><strong>المكتب:</strong> ${data.officeName}</p>
            <p><strong>التاريخ:</strong> ${data.bookingDate}</p>
            <p><strong>الوقت:</strong> ${data.bookingTime}</p>
            <p><strong>رقم الحجز:</strong> ${data.bookingId}</p>
          </div>
          <p>نتطلع لخدمتك!</p>
          <p style="color: #666; font-size: 12px;">سمارت برو - البنية التحتية الرقمية الوطنية لخدمات الأعمال</p>
        </div>
      `,
    },
  },
  followUpReminder: {
    en: {
      subject: "Follow-up Reminder - SmartPro",
      html: (data: { customerName: string; officeName: string; lastContactDate: string }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Follow-up Reminder</h1>
          <p>Dear ${data.customerName},</p>
          <p>We noticed you haven't responded to our last message from ${data.lastContactDate}.</p>
          <p>We're here to help! Please feel free to reach out if you have any questions or need assistance.</p>
          <p>Best regards,<br>${data.officeName}</p>
          <p style="color: #666; font-size: 12px;">SmartPro - National Digital Infrastructure for Business Services</p>
        </div>
      `,
    },
    ar: {
      subject: "تذكير بالمتابعة - سمارت برو",
      html: (data: { customerName: string; officeName: string; lastContactDate: string }) => `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">تذكير بالمتابعة</h1>
          <p>عزيزي ${data.customerName}،</p>
          <p>لاحظنا أنك لم ترد على رسالتنا الأخيرة من ${data.lastContactDate}.</p>
          <p>نحن هنا للمساعدة! لا تتردد في التواصل معنا إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة.</p>
          <p>مع أطيب التحيات،<br>${data.officeName}</p>
          <p style="color: #666; font-size: 12px;">سمارت برو - البنية التحتية الرقمية الوطنية لخدمات الأعمال</p>
        </div>
      `,
    },
  },
  statusUpdate: {
    en: {
      subject: "Status Update - SmartPro",
      html: (data: { customerName: string; serviceName: string; status: string; message: string }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Status Update</h1>
          <p>Dear ${data.customerName},</p>
          <p>Your service <strong>${data.serviceName}</strong> status has been updated to: <strong>${data.status}</strong></p>
          <p>${data.message}</p>
          <p>Thank you for choosing SmartPro!</p>
          <p style="color: #666; font-size: 12px;">SmartPro - National Digital Infrastructure for Business Services</p>
        </div>
      `,
    },
    ar: {
      subject: "تحديث الحالة - سمارت برو",
      html: (data: { customerName: string; serviceName: string; status: string; message: string }) => `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">تحديث الحالة</h1>
          <p>عزيزي ${data.customerName}،</p>
          <p>تم تحديث حالة خدمة <strong>${data.serviceName}</strong> إلى: <strong>${data.status}</strong></p>
          <p>${data.message}</p>
          <p>شكراً لاختيارك سمارت برو!</p>
          <p style="color: #666; font-size: 12px;">سمارت برو - البنية التحتية الرقمية الوطنية لخدمات الأعمال</p>
        </div>
      `,
    },
  },
  documentUploaded: {
    en: {
      subject: "Document Uploaded - SmartPro",
      html: (data: { customerName: string; officeName: string; documentName: string; bookingId: string }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Document Uploaded</h1>
          <p>Dear ${data.customerName},</p>
          <p>A new document has been uploaded for your booking.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Document Details</h2>
            <p><strong>Office:</strong> ${data.officeName}</p>
            <p><strong>Document:</strong> ${data.documentName}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          </div>
          <p>You can view this document in your booking details.</p>
          <p style="color: #666; font-size: 12px;">SmartPro - National Digital Infrastructure for Business Services</p>
        </div>
      `,
    },
    ar: {
      subject: "تم تحميل مستند - سمارت برو",
      html: (data: { customerName: string; officeName: string; documentName: string; bookingId: string }) => `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">تم تحميل مستند</h1>
          <p>عزيزي ${data.customerName}،</p>
          <p>تم تحميل مستند جديد لحجزك.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">تفاصيل المستند</h2>
            <p><strong>المكتب:</strong> ${data.officeName}</p>
            <p><strong>المستند:</strong> ${data.documentName}</p>
            <p><strong>رقم الحجز:</strong> ${data.bookingId}</p>
          </div>
          <p>يمكنك عرض هذا المستند في تفاصيل حجزك.</p>
          <p style="color: #666; font-size: 12px;">سمارت برو - البنية التحتية الرقمية الوطنية لخدمات الأعمال</p>
        </div>
      `,
    },
  },
};

type TemplateType = keyof typeof templates;
type Language = "en" | "ar";

interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded or plain text
  contentType?: string;
}

export async function sendBilingualEmail(
  to: string,
  templateType: TemplateType,
  data: any,
  language: Language = "en",
  attachments?: EmailAttachment[]
) {
  const template = templates[templateType][language];
  
  try {
    const emailPayload: any = {
      from: process.env.RESEND_FROM_EMAIL || "noreply@smartpro.om",
      to,
      subject: template.subject,
      html: template.html(data),
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    const result = await resend.emails.send(emailPayload);

    console.log(`Email sent successfully to ${to} in ${language}:`, result);
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return { success: false, error };
  }
}

// Helper to determine user's preferred language
export function getUserLanguage(userPreference?: string | null): Language {
  if (userPreference === "ar") return "ar";
  return "en";
}
