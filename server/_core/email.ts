// Use process.env directly for Resend variables

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, from = process.env.RESEND_FROM_EMAIL || 'noreply@smartpro.io' } = options;
  
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Failed to send email:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}
