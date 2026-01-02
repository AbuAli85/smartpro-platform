import cron from "node-cron";
import { getDb } from "../db";
import { bookings, sanadOffices, users } from "../../drizzle/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { sendBookingReminderSMS } from "./emailSms";

/**
 * Send SMS reminders 24 hours before appointments
 * Runs every hour to check for upcoming bookings
 */
export function startBookingReminderCron() {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron] Checking for bookings needing reminders...");
    
    try {
      const db = await getDb();
      if (!db) {
        console.error("[Cron] Database not available");
        return;
      }

      // Get bookings scheduled for 24 hours from now (+/- 1 hour window)
      const now = new Date();
      const reminderStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
      const reminderEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

      const upcomingBookings = await db
        .select({
          booking: bookings,
          office: sanadOffices,
          user: users,
        })
        .from(bookings)
        .leftJoin(sanadOffices, eq(bookings.officeId, sanadOffices.id))
        .leftJoin(users, eq(bookings.userId, users.id))
        .where(
          and(
            eq(bookings.status, "confirmed"),
            gte(bookings.scheduledDate, reminderStart.toISOString()),
            lte(bookings.scheduledDate, reminderEnd.toISOString())
          )
        );

      console.log(`[Cron] Found ${upcomingBookings.length} bookings needing reminders`);

      for (const { booking, office, user } of upcomingBookings) {
        if (!office || !user || !user.phone || !booking.scheduledDate) continue;

        const success = await sendBookingReminderSMS({
          userPhone: user.phone,
          userName: user.name || "Valued Customer",
          officeName: office.officeName,
          scheduledDate: booking.scheduledDate.toLocaleDateString(),
          scheduledTime: booking.scheduledTime || "TBD",
        });

        if (success) {
          console.log(`[Cron] Sent reminder for booking #${booking.id}`);
        }
      }
    } catch (error) {
      console.error("[Cron] Error in booking reminder job:", error);
    }
  });

  console.log("✅ Booking reminder cron job started (runs hourly)");
}

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  console.log("🕐 Initializing cron jobs...");
  startBookingReminderCron();
}
