import * as db from "../db";
import { sendEmail } from "./email";
import { sendSMS } from "./sms";

// Check for bookings that need reminders
export async function checkAndSendReminders() {
  const now = new Date();
  
  // Get bookings scheduled for 24 hours from now (with 5-minute window)
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twentyFourHoursWindow = new Date(twentyFourHoursFromNow.getTime() + 5 * 60 * 1000);
  
  // Get bookings scheduled for 1 hour from now (with 5-minute window)
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const oneHourWindow = new Date(oneHourFromNow.getTime() + 5 * 60 * 1000);
  
  try {
    // Get bookings needing 24-hour reminders
    const bookings24h = await db.getBookingsNeedingReminder(
      twentyFourHoursFromNow,
      twentyFourHoursWindow,
      "24h"
    );
    
    // Get bookings needing 1-hour reminders
    const bookings1h = await db.getBookingsNeedingReminder(
      oneHourFromNow,
      oneHourWindow,
      "1h"
    );
    
    // Send 24-hour reminders
    for (const booking of bookings24h) {
      await sendBookingReminder(booking, "24 hours");
      await db.markReminderSent(booking.id, "24h");
    }
    
    // Send 1-hour reminders
    for (const booking of bookings1h) {
      await sendBookingReminder(booking, "1 hour");
      await db.markReminderSent(booking.id, "1h");
    }
    
    console.log(`[Reminders] Sent ${bookings24h.length} 24h reminders and ${bookings1h.length} 1h reminders`);
  } catch (error) {
    console.error("[Reminders] Error sending reminders:", error);
  }
}

async function sendBookingReminder(booking: any, timeframe: string) {
  const { customerName, customerEmail, customerPhone, officeName, scheduledDate, scheduledTime, serviceDescription } = booking;
  
  const appointmentDate = new Date(scheduledDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  // Send email reminder
  if (customerEmail) {
    const emailSubject = `Reminder: Your appointment with ${officeName} in ${timeframe}`;
    const emailBody = `
      <h2>Appointment Reminder</h2>
      <p>Dear ${customerName},</p>
      <p>This is a friendly reminder that you have an appointment scheduled in <strong>${timeframe}</strong>.</p>
      
      <h3>Appointment Details:</h3>
      <ul>
        <li><strong>Office:</strong> ${officeName}</li>
        <li><strong>Date:</strong> ${appointmentDate}</li>
        <li><strong>Time:</strong> ${scheduledTime}</li>
        <li><strong>Service:</strong> ${serviceDescription}</li>
      </ul>
      
      <p>Please arrive on time. If you need to cancel or reschedule, please contact the office as soon as possible.</p>
      
      <p>Best regards,<br>SmartPro Business Services</p>
    `;
    
    try {
      await sendEmail({
        to: customerEmail,
        subject: emailSubject,
        html: emailBody,
      });
      console.log(`[Reminders] Email sent to ${customerEmail}`);
    } catch (error) {
      console.error(`[Reminders] Failed to send email to ${customerEmail}:`, error);
    }
  }
  
  // Send SMS reminder
  if (customerPhone) {
    const smsMessage = `Reminder: Your appointment with ${officeName} is in ${timeframe}. Date: ${appointmentDate} at ${scheduledTime}. Service: ${serviceDescription}. - SmartPro`;
    
    try {
      await sendSMS({
        to: customerPhone,
        message: smsMessage,
      });
      console.log(`[Reminders] SMS sent to ${customerPhone}`);
    } catch (error) {
      console.error(`[Reminders] Failed to send SMS to ${customerPhone}:`, error);
    }
  }
}

// Start the reminder scheduler (runs every 5 minutes)
export function startReminderScheduler() {
  // Run immediately on startup
  checkAndSendReminders();
  
  // Then run every 5 minutes
  setInterval(checkAndSendReminders, 5 * 60 * 1000);
  
  console.log("[Reminders] Scheduler started - checking every 5 minutes");
}
