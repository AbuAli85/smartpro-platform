/**
 * Email Templates Library
 * Professional HTML email templates for various platform communications
 */

interface WelcomeEmailParams {
  userName: string;
  userEmail: string;
}

interface PasswordResetParams {
  userName: string;
  resetLink: string;
  expiryHours: number;
}

interface MonthlyActivityParams {
  userName: string;
  month: string;
  year: number;
  stats: {
    bookingsCount: number;
    documentsGenerated: number;
    servicesUsed: string[];
  };
}

/**
 * Base email template with SmartPro branding
 */
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartPro Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #003366 0%, #004080 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      color: #003366;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e9ecef;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #003366;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SmartPro</h1>
      <p>National Digital Infrastructure for Business Services</p>
    </div>
    ${content}
    <div class="footer">
      <p><strong>SmartPro Platform</strong> - Ministry of Commerce, Industry and Investment Promotion</p>
      <p>Sultanate of Oman</p>
      <p style="margin-top: 15px;">
        <a href="https://smartpro.om" style="color: #003366; text-decoration: none;">Visit Website</a> | 
        <a href="https://smartpro.om/support" style="color: #003366; text-decoration: none;">Get Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Welcome email template for new users
 */
export function generateWelcomeEmail(params: WelcomeEmailParams): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h2 style="color: #003366; margin-top: 0;">Welcome to SmartPro, ${params.userName}!</h2>
      <p>Thank you for joining SmartPro, Oman's premier digital platform for business services.</p>
      <p>With SmartPro, you can:</p>
      <ul style="line-height: 2;">
        <li>📄 Generate professional business documents instantly</li>
        <li>📅 Book appointments with certified Sanad offices</li>
        <li>🏢 Access government-approved business services</li>
        <li>📊 Track all your business activities in one place</li>
      </ul>
      <p>Your account is now active and ready to use.</p>
      <a href="https://smartpro.om/dashboard" class="button">Explore SmartPro</a>
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; font-size: 14px;">
        If you have any questions, our support team is here to help at <a href="mailto:support@smartpro.om" style="color: #003366;">support@smartpro.om</a>
      </p>
    </div>
  `;

  return {
    subject: "Welcome to SmartPro - Your Business Services Platform",
    html: baseTemplate(content),
  };
}

/**
 * Password reset email template
 */
export function generatePasswordResetEmail(params: PasswordResetParams): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h2 style="color: #003366; margin-top: 0;">Password Reset Request</h2>
      <p>Hello ${params.userName},</p>
      <p>We received a request to reset your password for your SmartPro account.</p>
      <p>Click the button below to create a new password:</p>
      <a href="${params.resetLink}" class="button">Reset Password</a>
      <p style="color: #666; font-size: 14px;">This link will expire in ${params.expiryHours} hours for security reasons.</p>
      <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <p style="margin: 0; color: #856404;"><strong>⚠️ Security Notice:</strong></p>
        <p style="margin: 8px 0 0; color: #856404; font-size: 14px;">
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; font-size: 14px;">
        For security reasons, never share your password with anyone. SmartPro staff will never ask for your password.
      </p>
    </div>
  `;

  return {
    subject: "Reset Your SmartPro Password",
    html: baseTemplate(content),
  };
}

/**
 * Monthly activity summary email template
 */
export function generateMonthlyActivityEmail(params: MonthlyActivityParams): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h2 style="color: #003366; margin-top: 0;">Your ${params.month} ${params.year} Activity Summary</h2>
      <p>Hello ${params.userName},</p>
      <p>Here's a summary of your SmartPro activity for ${params.month}:</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${params.stats.bookingsCount}</div>
          <div class="stat-label">Bookings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${params.stats.documentsGenerated}</div>
          <div class="stat-label">Documents</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${params.stats.servicesUsed.length}</div>
          <div class="stat-label">Services</div>
        </div>
      </div>

      ${params.stats.servicesUsed.length > 0 ? `
        <div style="margin: 30px 0;">
          <h3 style="color: #003366; font-size: 16px; margin-bottom: 10px;">Services You Used:</h3>
          <ul style="line-height: 2; color: #666;">
            ${params.stats.servicesUsed.map(service => `<li>${service}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <p style="margin-top: 30px;">Keep up the great work! SmartPro is here to support your business growth.</p>
      <a href="https://smartpro.om/dashboard" class="button">View Dashboard</a>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; font-size: 14px;">
        Want to do more? Explore our <a href="https://smartpro.om/templates" style="color: #003366;">document templates</a> 
        or <a href="https://smartpro.om/offices" style="color: #003366;">book a service</a>.
      </p>
    </div>
  `;

  return {
    subject: `Your SmartPro Activity Summary - ${params.month} ${params.year}`,
    html: baseTemplate(content),
  };
}

/**
 * Helper function to send welcome email
 */
export async function sendWelcomeEmail(to: string, userName: string) {
  const { sendEmail } = await import("./emailSms");
  const { subject, html } = generateWelcomeEmail({ userName, userEmail: to });
  return sendEmail({ to, subject, text: `Welcome to SmartPro, ${userName}!`, html });
}

/**
 * Helper function to send password reset email
 */
export async function sendPasswordResetEmail(to: string, userName: string, resetLink: string, expiryHours: number = 24) {
  const { sendEmail } = await import("./emailSms");
  const { subject, html } = generatePasswordResetEmail({ userName, resetLink, expiryHours });
  return sendEmail({ to, subject, text: `Reset your SmartPro password: ${resetLink}`, html });
}

/**
 * Helper function to send monthly activity summary
 */
export async function sendMonthlyActivityEmail(
  to: string,
  userName: string,
  month: string,
  year: number,
  stats: MonthlyActivityParams['stats']
) {
  const { sendEmail } = await import("./emailSms");
  const { subject, html } = generateMonthlyActivityEmail({ userName, month, year, stats });
  return sendEmail({ to, subject, text: `Your ${month} ${year} activity summary on SmartPro`, html });
}

/**
 * Office registration confirmation email template
 */
export function generateOfficeRegistrationConfirmationEmail(params: {
  officeName: string;
}): { subject: string; html: string; text: string } {
  const content = `
    <div class="content">
      <h2 style="color: #003366; margin-top: 0;">Registration Received</h2>
      <p>Dear ${params.officeName},</p>
      <p>Thank you for registering your office on the SmartPro platform! We have received your registration and our team is currently reviewing your application.</p>
      
      <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: #1565c0; margin-top: 0; font-size: 16px;">What happens next:</h3>
        <ol style="line-height: 1.8; margin: 10px 0; color: #424242;">
          <li>Our verification team will review your office details and documents</li>
          <li>You will receive an email notification once the review is complete (typically within 2-3 business days)</li>
          <li>If approved, you'll be guided through completing your office profile</li>
        </ol>
      </div>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; font-size: 14px;">
        If you have any questions, please contact us at <a href="mailto:support@smartpro.om" style="color: #003366;">support@smartpro.om</a>
      </p>
    </div>
  `;

  const text = `
Dear ${params.officeName},

Thank you for registering your office on the SmartPro platform!

We have received your registration and our team is currently reviewing your application.

What happens next:
1. Our verification team will review your office details and documents
2. You will receive an email notification once the review is complete (typically within 2-3 business days)
3. If approved, you'll be guided through completing your office profile

If you have any questions, please contact us at support@smartpro.om.

Best regards,
MOCIP - SmartPro Team
  `.trim();

  return {
    subject: "Registration Received - SmartPro Platform",
    html: baseTemplate(content),
    text,
  };
}

/**
 * Role change notification email template
 */
export function generateRoleChangeEmail(params: {
  userName: string;
  oldRole: string;
  newRole: string;
}): { subject: string; html: string; text: string } {
  const roleLabels: Record<string, string> = {
    user: "User",
    admin: "Administrator",
    sanad_owner: "Sanad Office Owner",
    sanad_staff: "Sanad Office Staff",
    sme_owner: "SME Owner",
    gig_worker: "Gig Worker",
    government_official: "Government Official",
  };

  const oldRoleLabel = roleLabels[params.oldRole] || params.oldRole;
  const newRoleLabel = roleLabels[params.newRole] || params.newRole;

  const content = `
    <div class="content">
      <h2 style="color: #003366; margin-top: 0;">Role Updated</h2>
      <p>Dear ${params.userName},</p>
      <p>Your role on the SmartPro platform has been updated.</p>
      
      <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e9ecef;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #666; font-weight: 600;">Previous Role:</td>
            <td style="padding: 10px 0; color: #333; text-align: right;">${oldRoleLabel}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-weight: 600; border-top: 1px solid #e9ecef;">New Role:</td>
            <td style="padding: 10px 0; color: #003366; font-weight: 600; text-align: right; border-top: 1px solid #e9ecef;">${newRoleLabel}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          ⚠️ This change may affect your access to certain features and pages on the platform. Please log in to see your updated permissions.
        </p>
      </div>
      
      <a href="https://smartpro.om/dashboard" class="button">View Dashboard</a>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; font-size: 14px;">
        If you have any questions about this change, please contact us at <a href="mailto:support@smartpro.om" style="color: #003366;">support@smartpro.om</a>
      </p>
    </div>
  `;

  const text = `
Dear ${params.userName},

Your role on the SmartPro platform has been updated.

Previous Role: ${oldRoleLabel}
New Role: ${newRoleLabel}

This change may affect your access to certain features and pages on the platform. Please log in to see your updated permissions.

If you have any questions about this change, please contact us at support@smartpro.om.

Best regards,
MOCIP - SmartPro Team
  `.trim();

  return {
    subject: "Your Role Has Been Updated - SmartPro Platform",
    html: baseTemplate(content),
    text,
  };
}

/**
 * Helper function to send office registration confirmation email
 */
export async function sendOfficeRegistrationConfirmationEmail(to: string, officeName: string) {
  const { sendEmail } = await import("./emailSms");
  const { subject, html, text } = generateOfficeRegistrationConfirmationEmail({ officeName });
  return sendEmail({ to, subject, text, html });
}

/**
 * Helper function to send role change notification email
 */
export async function sendRoleChangeNotificationEmail(
  to: string,
  userName: string,
  oldRole: string,
  newRole: string
) {
  const { sendEmail } = await import("./emailSms");
  const { subject, html, text } = generateRoleChangeEmail({ userName, oldRole, newRole });
  return sendEmail({ to, subject, text, html });
}
