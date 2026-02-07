import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resendClient: Resend | null = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@thesmartpro.io";

// Email templates for account recovery in English and Arabic
const templates = {
  passwordReset: {
    en: {
      subject: "Password Reset Request - SmartPro",
      html: (data: { userName: string; resetLink: string; expiryMinutes: number }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #003366; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0;">SmartPro</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #003366; margin-top: 0;">Password Reset Request</h2>
            <p>Hello ${data.userName},</p>
            <p>We received a request to reset your password for your SmartPro account. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetLink}" style="background-color: #003366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in ${data.expiryMinutes} minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">SmartPro - National Digital Infrastructure for Business Services</p>
          </div>
        </div>
      `,
    },
    ar: {
      subject: "طلب إعادة تعيين كلمة المرور - سمارت برو",
      html: (data: { userName: string; resetLink: string; expiryMinutes: number }) => `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #003366; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0;">سمارت برو</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #003366; margin-top: 0;">طلب إعادة تعيين كلمة المرور</h2>
            <p>مرحباً ${data.userName}،</p>
            <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في سمارت برو. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetLink}" style="background-color: #003366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">إعادة تعيين كلمة المرور</a>
            </div>
            <p style="color: #666; font-size: 14px;">ستنتهي صلاحية هذا الرابط خلال ${data.expiryMinutes} دقيقة.</p>
            <p style="color: #666; font-size: 14px;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني أو الاتصال بالدعم إذا كانت لديك مخاوف.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">سمارت برو - البنية التحتية الرقمية الوطنية لخدمات الأعمال</p>
          </div>
        </div>
      `,
    },
  },
  emailVerification: {
    en: {
      subject: "Verify Your Email - SmartPro",
      html: (data: { userName: string; verificationLink: string; expiryMinutes: number }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #003366; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0;">SmartPro</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #003366; margin-top: 0;">Verify Your Email Address</h2>
            <p>Hello ${data.userName},</p>
            <p>Thank you for registering with SmartPro! To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationLink}" style="background-color: #28a745; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in ${data.expiryMinutes} minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account with SmartPro, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">SmartPro - National Digital Infrastructure for Business Services</p>
          </div>
        </div>
      `,
    },
    ar: {
      subject: "تحقق من بريدك الإلكتروني - سمارت برو",
      html: (data: { userName: string; verificationLink: string; expiryMinutes: number }) => `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #003366; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0;">سمارت برو</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #003366; margin-top: 0;">تحقق من عنوان بريدك الإلكتروني</h2>
            <p>مرحباً ${data.userName}،</p>
            <p>شكراً لتسجيلك في سمارت برو! لإكمال تسجيلك، يرجى التحقق من عنوان بريدك الإلكتروني بالنقر على الزر أدناه:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationLink}" style="background-color: #28a745; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">تحقق من البريد الإلكتروني</a>
            </div>
            <p style="color: #666; font-size: 14px;">ستنتهي صلاحية هذا الرابط خلال ${data.expiryMinutes} دقيقة.</p>
            <p style="color: #666; font-size: 14px;">إذا لم تقم بإنشاء حساب في سمارت برو، يرجى تجاهل هذا البريد الإلكتروني.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">سمارت برو - البنية التحتية الرقمية الوطنية لخدمات الأعمال</p>
          </div>
        </div>
      `,
    },
  },
  recoveryEmailVerification: {
    en: {
      subject: "Verify Recovery Email - SmartPro",
      html: (data: { userName: string; verificationLink: string; recoveryEmail: string }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #003366; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0;">SmartPro</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #003366; margin-top: 0;">Verify Recovery Email</h2>
            <p>Hello ${data.userName},</p>
            <p>You've added <strong>${data.recoveryEmail}</strong> as a recovery email for your SmartPro account. Please verify this email address to enable account recovery:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationLink}" style="background-color: #003366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Recovery Email</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you didn't add this recovery email, please secure your account immediately.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">SmartPro - National Digital Infrastructure for Business Services</p>
          </div>
        </div>
      `,
    },
    ar: {
      subject: "تحقق من البريد الإلكتروني للاسترداد - سمارت برو",
      html: (data: { userName: string; verificationLink: string; recoveryEmail: string }) => `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #003366; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0;">سمارت برو</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #003366; margin-top: 0;">تحقق من البريد الإلكتروني للاسترداد</h2>
            <p>مرحباً ${data.userName}،</p>
            <p>لقد أضفت <strong>${data.recoveryEmail}</strong> كبريد إلكتروني للاسترداد لحسابك في سمارت برو. يرجى التحقق من عنوان البريد الإلكتروني هذا لتمكين استرداد الحساب:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationLink}" style="background-color: #003366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">تحقق من البريد الإلكتروني للاسترداد</a>
            </div>
            <p style="color: #666; font-size: 14px;">إذا لم تقم بإضافة بريد الاسترداد هذا، يرجى تأمين حسابك على الفور.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">سمارت برو - البنية التحتية الرقمية الوطنية لخدمات الأعمال</p>
          </div>
        </div>
      `,
    },
  },
};

// Helper function to get user's preferred language
function getUserLanguage(preferredLanguage?: string): "en" | "ar" {
  return preferredLanguage === "ar" ? "ar" : "en";
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string,
  preferredLanguage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const lang = getUserLanguage(preferredLanguage);
    const resetLink = `${process.env.VITE_FRONTEND_FORGE_API_URL || "https://smartpro.manus.space"}/reset-password?token=${resetToken}`;
    const expiryMinutes = 60; // 1 hour

    const template = templates.passwordReset[lang];
    if (!resendClient) {
      console.warn("[Account Recovery] Resend API key not configured. Password reset email not sent.");
      return { success: false, error: "Email service not configured" };
    }
    const { data, error } = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: template.subject,
      html: template.html({ userName, resetLink, expiryMinutes }),
    });

    if (error) {
      console.error("[Account Recovery] Password reset email failed:", error);
      return { success: false, error: error.message };
    }

    console.log("[Account Recovery] Password reset email sent:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[Account Recovery] Password reset email exception:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Send email verification email
export async function sendEmailVerificationEmail(
  email: string,
  userName: string,
  verificationToken: string,
  preferredLanguage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const lang = getUserLanguage(preferredLanguage);
    const verificationLink = `${process.env.VITE_FRONTEND_FORGE_API_URL || "https://smartpro.manus.space"}/verify-email?token=${verificationToken}`;
    const expiryMinutes = 1440; // 24 hours

    const template = templates.emailVerification[lang];
    const { data, error } = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: template.subject,
      html: template.html({ userName, verificationLink, expiryMinutes }),
    });

    if (error) {
      console.error("[Account Recovery] Email verification failed:", error);
      return { success: false, error: error.message };
    }

    console.log("[Account Recovery] Email verification sent:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[Account Recovery] Email verification exception:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Send recovery email verification
export async function sendRecoveryEmailVerification(
  email: string,
  userName: string,
  verificationToken: string,
  recoveryEmail: string,
  preferredLanguage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const lang = getUserLanguage(preferredLanguage);
    const verificationLink = `${process.env.VITE_FRONTEND_FORGE_API_URL || "https://smartpro.manus.space"}/verify-recovery-email?token=${verificationToken}`;

    const template = templates.recoveryEmailVerification[lang];
    if (!resendClient) {
      console.warn("[Account Recovery] Resend API key not configured. Recovery email verification not sent.");
      return { success: false, error: "Email service not configured" };
    }
    const { data, error } = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: recoveryEmail,
      subject: template.subject,
      html: template.html({ userName, verificationLink, recoveryEmail }),
    });

    if (error) {
      console.error("[Account Recovery] Recovery email verification failed:", error);
      return { success: false, error: error.message };
    }

    console.log("[Account Recovery] Recovery email verification sent:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[Account Recovery] Recovery email verification exception:", error);
    return { success: false, error: "Failed to send email" };
  }
}
