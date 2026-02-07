import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resendClient: Resend | null = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@thesmartpro.io';

/**
 * Generate a unique tracking number for service requests
 * Format: SR-YYYYMMDD-XXXXX (e.g., SR-20251229-A1B2C)
 */
export function generateTrackingNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SR-${dateStr}-${randomStr}`;
}

/**
 * Send service request confirmation email (bilingual)
 */
export async function sendRequestConfirmationEmail(params: {
  to: string;
  customerName: string;
  trackingNumber: string;
  serviceTitle: string;
  serviceType: string;
  budget: string;
  deadline: string;
  language: 'en' | 'ar';
}) {
  const { to, customerName, trackingNumber, serviceTitle, serviceType, budget, deadline, language } = params;

  const isArabic = language === 'ar';

  const subject = isArabic
    ? `تأكيد طلب الخدمة - ${trackingNumber}`
    : `Service Request Confirmation - ${trackingNumber}`;

  const html = isArabic ? `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #003366 0%, #0055aa 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✅ تم استلام طلبك بنجاح</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">رقم التتبع: <strong style="color: #FFD700;">${trackingNumber}</strong></p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">عزيزي/عزيزتي <strong>${customerName}</strong>،</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        شكراً لاستخدامك منصة SmartPro. تم استلام طلب الخدمة الخاص بك بنجاح وسيتم مراجعته من قبل مكاتب سند المؤهلة.
      </p>

      <!-- Request Details Card -->
      <div style="background-color: #f8f9fa; border-right: 4px solid #003366; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #003366; font-size: 18px; margin: 0 0 15px 0;">📋 تفاصيل الطلب</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">عنوان الخدمة:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">نوع الخدمة:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">الميزانية:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${budget} ر.ع.</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">الموعد النهائي:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${deadline}</td>
          </tr>
        </table>
      </div>

      <!-- What Happens Next -->
      <div style="background-color: #e8f4f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #003366; font-size: 16px; margin: 0 0 15px 0;">🔔 ماذا بعد؟</h3>
        <ul style="margin: 0; padding-right: 20px; color: #555; line-height: 1.8;">
          <li>سيتم إشعار مكاتب سند المؤهلة بطلبك تلقائياً</li>
          <li>ستبدأ المكاتب بتقديم عروضها خلال 24-48 ساعة</li>
          <li>ستتلقى إشعاراً فورياً عبر البريد الإلكتروني عند تلقي عروض جديدة</li>
          <li>يمكنك مقارنة العروض واختيار الأنسب لك</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/my-service-requests" style="display: inline-block; background: linear-gradient(135deg, #003366 0%, #0055aa 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(0,51,102,0.3);">
          📊 تتبع طلبك
        </a>
      </div>

      <!-- Help Section -->
      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
        <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
          <strong>هل تحتاج إلى مساعدة؟</strong>
        </p>
        <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.6;">
          فريق الدعم متاح لمساعدتك على مدار الساعة. يمكنك التواصل معنا عبر الدردشة المباشرة أو البريد الإلكتروني: <a href="mailto:support@thesmartpro.io" style="color: #003366;">support@thesmartpro.io</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        SmartPro - منصة وطنية للبنية التحتية الرقمية لخدمات الأعمال
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
        © 2025 SmartPro. جميع الحقوق محفوظة.
      </p>
    </div>

  </div>
</body>
</html>
  ` : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #003366 0%, #0055aa 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✅ Request Received Successfully</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Tracking Number: <strong style="color: #FFD700;">${trackingNumber}</strong></p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Dear <strong>${customerName}</strong>,</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for using SmartPro platform. Your service request has been received successfully and will be reviewed by qualified Sanad offices.
      </p>

      <!-- Request Details Card -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #003366; font-size: 18px; margin: 0 0 15px 0;">📋 Request Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Service Title:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Service Type:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Budget:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${budget} OMR</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Deadline:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${deadline}</td>
          </tr>
        </table>
      </div>

      <!-- What Happens Next -->
      <div style="background-color: #e8f4f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #003366; font-size: 16px; margin: 0 0 15px 0;">🔔 What Happens Next?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
          <li>Qualified Sanad offices will be notified of your request automatically</li>
          <li>Offices will start submitting their bids within 24-48 hours</li>
          <li>You'll receive instant email notifications when new bids arrive</li>
          <li>You can compare bids and choose the best offer for you</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/my-service-requests" style="display: inline-block; background: linear-gradient(135deg, #003366 0%, #0055aa 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(0,51,102,0.3);">
          📊 Track Your Request
        </a>
      </div>

      <!-- Help Section -->
      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
        <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
          <strong>Need Help?</strong>
        </p>
        <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.6;">
          Our support team is available 24/7 to assist you. Contact us via live chat or email: <a href="mailto:support@thesmartpro.io" style="color: #003366;">support@thesmartpro.io</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        SmartPro - National Digital Infrastructure for Business Services
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
        © 2025 SmartPro. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  try {
    if (!resendClient) {
      console.warn("Resend API key not configured. Request confirmation email not sent.");
      return { success: false, error: "Email service not configured" };
    }
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`✅ Request confirmation email sent to ${to} (${trackingNumber})`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('❌ Failed to send request confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send new bid notification email to customer
 */
export async function sendNewBidNotificationEmail(params: {
  to: string;
  customerName: string;
  trackingNumber: string;
  serviceTitle: string;
  officeName: string;
  bidAmount: string;
  language: 'en' | 'ar';
}) {
  const { to, customerName, trackingNumber, serviceTitle, officeName, bidAmount, language } = params;

  const isArabic = language === 'ar';

  const subject = isArabic
    ? `🎉 عرض جديد على طلبك - ${trackingNumber}`
    : `🎉 New Bid on Your Request - ${trackingNumber}`;

  const html = isArabic ? `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 عرض جديد على طلبك!</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">رقم التتبع: <strong style="color: #FFD700;">${trackingNumber}</strong></p>
    </div>

    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">عزيزي/عزيزتي <strong>${customerName}</strong>،</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        أخبار رائعة! تلقيت عرضاً جديداً على طلب الخدمة الخاص بك.
      </p>

      <div style="background-color: #f8f9fa; border-right: 4px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #28a745; font-size: 18px; margin: 0 0 15px 0;">💼 تفاصيل العرض</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">اسم المكتب:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${officeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">الخدمة:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">قيمة العرض:</td>
            <td style="padding: 8px 0; color: #28a745; font-size: 18px; font-weight: 700;">${bidAmount} ر.ع.</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/my-service-requests" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(40,167,69,0.3);">
          👀 مراجعة العرض
        </a>
      </div>

      <p style="font-size: 14px; color: #666; margin: 20px 0 0 0; line-height: 1.6;">
        <strong>نصيحة:</strong> قارن بين العروض المختلفة من حيث السعر، المدة الزمنية، وتقييمات المكتب قبل اتخاذ قرارك.
      </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 14px; color: #666;">SmartPro - منصة وطنية للبنية التحتية الرقمية لخدمات الأعمال</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">© 2025 SmartPro. جميع الحقوق محفوظة.</p>
    </div>

  </div>
</body>
</html>
  ` : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New Bid on Your Request!</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Tracking Number: <strong style="color: #FFD700;">${trackingNumber}</strong></p>
    </div>

    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Dear <strong>${customerName}</strong>,</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        Great news! You've received a new bid on your service request.
      </p>

      <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #28a745; font-size: 18px; margin: 0 0 15px 0;">💼 Bid Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Office Name:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${officeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Service:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Bid Amount:</td>
            <td style="padding: 8px 0; color: #28a745; font-size: 18px; font-weight: 700;">${bidAmount} OMR</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/my-service-requests" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(40,167,69,0.3);">
          👀 Review Bid
        </a>
      </div>

      <p style="font-size: 14px; color: #666; margin: 20px 0 0 0; line-height: 1.6;">
        <strong>Tip:</strong> Compare different bids based on price, delivery time, and office ratings before making your decision.
      </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 14px; color: #666;">SmartPro - National Digital Infrastructure for Business Services</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">© 2025 SmartPro. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
  `;

  try {
    if (!resendClient) {
      console.warn("Resend API key not configured. New bid notification email not sent.");
      return { success: false, error: "Email service not configured" };
    }
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`✅ New bid notification sent to ${to} (${trackingNumber})`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('❌ Failed to send new bid notification:', error);
    return { success: false, error };
  }
}

/**
 * Send notification to offices about new service request
 */
export async function sendNewRequestNotificationToOffice(params: {
  to: string;
  officeName: string;
  serviceTitle: string;
  serviceType: string;
  budget: string;
  deadline: string;
  governorate: string;
  language: 'en' | 'ar';
}) {
  const { to, officeName, serviceTitle, serviceType, budget, deadline, governorate, language } = params;

  const isArabic = language === 'ar';

  const subject = isArabic
    ? `🔔 طلب خدمة جديد متاح - ${serviceType}`
    : `🔔 New Service Request Available - ${serviceType}`;

  const html = isArabic ? `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔔 فرصة عمل جديدة!</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">طلب خدمة جديد يطابق تخصصك</p>
    </div>

    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">مرحباً <strong>${officeName}</strong>،</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        هناك طلب خدمة جديد يطابق تخصصك ومنطقتك. قدم عرضك الآن للفوز بهذا المشروع!
      </p>

      <div style="background-color: #fff3cd; border-right: 4px solid #ff6b6b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #ff6b6b; font-size: 18px; margin: 0 0 15px 0;">📋 تفاصيل الطلب</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">عنوان الخدمة:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">نوع الخدمة:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">الميزانية:</td>
            <td style="padding: 8px 0; color: #28a745; font-size: 18px; font-weight: 700;">${budget} ر.ع.</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">الموعد النهائي:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${deadline}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">الموقع:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${governorate}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/marketplace" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(255,107,107,0.3);">
          💼 قدم عرضك الآن
        </a>
      </div>

      <p style="font-size: 14px; color: #666; margin: 20px 0 0 0; line-height: 1.6;">
        <strong>نصيحة:</strong> قدم عرضاً تنافسياً مع وصف تفصيلي لخدماتك لزيادة فرصك في الفوز بالمشروع.
      </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 14px; color: #666;">SmartPro - منصة وطنية للبنية التحتية الرقمية لخدمات الأعمال</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">© 2025 SmartPro. جميع الحقوق محفوظة.</p>
    </div>

  </div>
</body>
</html>
  ` : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔔 New Business Opportunity!</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">A new service request matches your expertise</p>
    </div>

    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hello <strong>${officeName}</strong>,</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        There's a new service request that matches your expertise and location. Submit your bid now to win this project!
      </p>

      <div style="background-color: #fff3cd; border-left: 4px solid #ff6b6b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #ff6b6b; font-size: 18px; margin: 0 0 15px 0;">📋 Request Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Service Title:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Service Type:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Budget:</td>
            <td style="padding: 8px 0; color: #28a745; font-size: 18px; font-weight: 700;">${budget} OMR</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Deadline:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${deadline}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Location:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${governorate}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/marketplace" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(255,107,107,0.3);">
          💼 Submit Your Bid Now
        </a>
      </div>

      <p style="font-size: 14px; color: #666; margin: 20px 0 0 0; line-height: 1.6;">
        <strong>Tip:</strong> Submit a competitive bid with a detailed description of your services to increase your chances of winning the project.
      </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 14px; color: #666;">SmartPro - National Digital Infrastructure for Business Services</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">© 2025 SmartPro. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
  `;

  try {
    if (!resendClient) {
      console.warn("Resend API key not configured. New request notification email not sent.");
      return { success: false, error: "Email service not configured" };
    }
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`✅ New request notification sent to office: ${officeName}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('❌ Failed to send new request notification to office:', error);
    return { success: false, error };
  }
}

/**
 * Send bid accepted notification email to office (bilingual)
 */
export async function sendBidAcceptedNotificationEmail(params: {
  to: string;
  officeName: string;
  trackingNumber: string;
  serviceTitle: string;
  customerName: string;
  bidAmount: string;
  language: 'en' | 'ar';
}) {
  const { to, officeName, trackingNumber, serviceTitle, customerName, bidAmount, language } = params;

  const isArabic = language === 'ar';

  const subject = isArabic
    ? `🎉 تم قبول عرضك - ${trackingNumber}`
    : `🎉 Your Bid Was Accepted - ${trackingNumber}`;

  const html = isArabic ? `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 تهانينا! تم قبول عرضك</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">رقم التتبع: <strong style="color: #FFD700;">${trackingNumber}</strong></p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">عزيزي/عزيزتي <strong>${officeName}</strong>،</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        نبشرك بأن العميل <strong>${customerName}</strong> قد قبل عرضك لتنفيذ الخدمة المطلوبة. يرجى التواصل مع العميل لبدء العمل.
      </p>

      <!-- Bid Details Card -->
      <div style="background-color: #f0fdf4; border-right: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #10b981; font-size: 18px; margin: 0 0 15px 0;">📋 تفاصيل العرض المقبول</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">عنوان الخدمة:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">اسم العميل:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">قيمة العرض:</td>
            <td style="padding: 8px 0; color: #10b981; font-size: 16px; font-weight: 700;">${bidAmount} ر.ع.</td>
          </tr>
        </table>
      </div>

      <!-- Next Steps -->
      <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #003366; font-size: 16px; margin: 0 0 15px 0;">📝 الخطوات التالية</h3>
        <ul style="margin: 0; padding-right: 20px; color: #555; line-height: 1.8;">
          <li>تواصل مع العميل لتأكيد تفاصيل الخدمة</li>
          <li>ابدأ العمل على الخدمة وفقاً للمواصفات المتفق عليها</li>
          <li>حافظ على تواصل منتظم مع العميل عبر منصة SmartPro</li>
          <li>قم بتحديث حالة الطلب عند إكمال الخدمة</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/office-messages" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">
          💬 تواصل مع العميل
        </a>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 20px 0 0 0;">
        شكراً لكونك جزءاً من منصة SmartPro. نتمنى لك التوفيق في تنفيذ الخدمة!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        SmartPro - البنية التحتية الرقمية الوطنية لخدمات الأعمال
      </p>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
        هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه مباشرة.
      </p>
    </div>
  </div>
</body>
</html>
  ` : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations! Your Bid Was Accepted</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Tracking Number: <strong style="color: #FFD700;">${trackingNumber}</strong></p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Dear <strong>${officeName}</strong>,</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        Great news! Customer <strong>${customerName}</strong> has accepted your bid for the requested service. Please contact the customer to begin work.
      </p>

      <!-- Bid Details Card -->
      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #10b981; font-size: 18px; margin: 0 0 15px 0;">📋 Accepted Bid Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Service Title:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Customer Name:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Bid Amount:</td>
            <td style="padding: 8px 0; color: #10b981; font-size: 16px; font-weight: 700;">${bidAmount} OMR</td>
          </tr>
        </table>
      </div>

      <!-- Next Steps -->
      <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #003366; font-size: 16px; margin: 0 0 15px 0;">📝 Next Steps</h3>
        <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
          <li>Contact the customer to confirm service details</li>
          <li>Begin work on the service according to agreed specifications</li>
          <li>Maintain regular communication with the customer via SmartPro platform</li>
          <li>Update the request status when the service is completed</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/office-messages" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">
          💬 Contact Customer
        </a>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 20px 0 0 0;">
        Thank you for being part of the SmartPro platform. We wish you success in delivering the service!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        SmartPro - National Digital Infrastructure for Business Services
      </p>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
        This email was sent automatically, please do not reply directly.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    if (!resendClient) {
      console.warn("Resend API key not configured. Bid accepted notification email not sent.");
      return { success: false, error: "Email service not configured" };
    }
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`✅ Bid accepted notification sent to office: ${officeName}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('❌ Failed to send bid accepted notification to office:', error);
    return { success: false, error };
  }
}

/**
 * Send service completion notification email to customer (bilingual)
 */
export async function sendServiceCompletionEmail(params: {
  to: string;
  customerName: string;
  trackingNumber: string;
  serviceTitle: string;
  officeName: string;
  language: 'en' | 'ar';
}) {
  const { to, customerName, trackingNumber, serviceTitle, officeName, language } = params;

  const isArabic = language === 'ar';

  const subject = isArabic
    ? `✅ تم إكمال الخدمة - ${trackingNumber}`
    : `✅ Service Completed - ${trackingNumber}`;

  const html = isArabic ? `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✅ تم إكمال الخدمة بنجاح</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">رقم التتبع: <strong style="color: #FFD700;">${trackingNumber}</strong></p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">عزيزي/عزيزتي <strong>${customerName}</strong>،</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        نود إعلامك بأن مكتب <strong>${officeName}</strong> قد أكمل تنفيذ الخدمة المطلوبة. نأمل أن تكون راضياً عن الخدمة المقدمة.
      </p>

      <!-- Service Details Card -->
      <div style="background-color: #faf5ff; border-right: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #8b5cf6; font-size: 18px; margin: 0 0 15px 0;">📋 تفاصيل الخدمة</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">عنوان الخدمة:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">مقدم الخدمة:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${officeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">الحالة:</td>
            <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 600;">✅ مكتملة</td>
          </tr>
        </table>
      </div>

      <!-- Review Request -->
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #d97706; font-size: 16px; margin: 0 0 15px 0;">⭐ شارك تجربتك</h3>
        <p style="margin: 0; color: #555; line-height: 1.6; font-size: 14px;">
          رأيك يهمنا! يرجى تقييم الخدمة المقدمة لمساعدة الآخرين في اتخاذ قرارات مستنيرة وتحسين جودة الخدمات على المنصة.
        </p>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/my-service-requests" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(139,92,246,0.3); margin: 5px;">
          ⭐ تقييم الخدمة
        </a>
        <a href="https://sanad.thesmartpro.io/my-service-requests" style="display: inline-block; background: linear-gradient(135deg, #003366 0%, #0055aa 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(0,51,102,0.3); margin: 5px;">
          📊 عرض التفاصيل
        </a>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 20px 0 0 0;">
        شكراً لاستخدامك منصة SmartPro. نتطلع لخدمتك مجدداً!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        SmartPro - البنية التحتية الرقمية الوطنية لخدمات الأعمال
      </p>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
        هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه مباشرة.
      </p>
    </div>
  </div>
</body>
</html>
  ` : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✅ Service Completed Successfully</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Tracking Number: <strong style="color: #FFD700;">${trackingNumber}</strong></p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Dear <strong>${customerName}</strong>,</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        We're pleased to inform you that <strong>${officeName}</strong> has completed your requested service. We hope you're satisfied with the service provided.
      </p>

      <!-- Service Details Card -->
      <div style="background-color: #faf5ff; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #8b5cf6; font-size: 18px; margin: 0 0 15px 0;">📋 Service Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Service Title:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Service Provider:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${officeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Status:</td>
            <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 600;">✅ Completed</td>
          </tr>
        </table>
      </div>

      <!-- Review Request -->
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #d97706; font-size: 16px; margin: 0 0 15px 0;">⭐ Share Your Experience</h3>
        <p style="margin: 0; color: #555; line-height: 1.6; font-size: 14px;">
          Your feedback matters! Please rate the service provided to help others make informed decisions and improve service quality on the platform.
        </p>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sanad.thesmartpro.io/my-service-requests" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(139,92,246,0.3); margin: 5px;">
          ⭐ Rate Service
        </a>
        <a href="https://sanad.thesmartpro.io/my-service-requests" style="display: inline-block; background: linear-gradient(135deg, #003366 0%, #0055aa 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(0,51,102,0.3); margin: 5px;">
          📊 View Details
        </a>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 20px 0 0 0;">
        Thank you for using SmartPro platform. We look forward to serving you again!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        SmartPro - National Digital Infrastructure for Business Services
      </p>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
        This email was sent automatically, please do not reply directly.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    if (!resendClient) {
      console.warn("Resend API key not configured. Service completion notification email not sent.");
      return { success: false, error: "Email service not configured" };
    }
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`✅ Service completion notification sent to customer: ${customerName}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('❌ Failed to send service completion notification:', error);
    return { success: false, error };
  }
}
