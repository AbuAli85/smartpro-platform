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
