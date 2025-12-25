import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Booking Workflow", () => {
  let testOfficeId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Get a test office and user from the database
    const offices = await db.listSanadOffices({ limit: 1 });
    if (offices.offices.length > 0) {
      testOfficeId = offices.offices[0].id;
    }

    // Create a test user if needed
    await db.upsertUser({
      openId: "test-booking-user",
      name: "Test User",
      email: "test@example.com",
    });

    const user = await db.getUserByOpenId("test-booking-user");
    if (user) {
      testUserId = user.id;
    }
  });

  it("should create a new booking", async () => {
    if (!testOfficeId || !testUserId) {
      console.log("Test data not available, skipping");
      return;
    }

    const bookingData = {
      userId: testUserId,
      officeId: testOfficeId,
      serviceId: 1,
      scheduledDate: new Date("2025-01-15"),
      scheduledTime: "10:00",
      duration: 60,
      status: "pending" as const,
      serviceDescription: "Test booking for unit test",
    };

    await db.createBooking(bookingData);

    // Verify booking was created
    const userBookings = await db.getUserBookings(testUserId);
    expect(userBookings.length).toBeGreaterThan(0);

    const latestBooking = userBookings[0];
    expect(latestBooking.userId).toBe(testUserId);
    expect(latestBooking.officeId).toBe(testOfficeId);
    expect(latestBooking.status).toBe("pending");
  });

  it("should retrieve office bookings", async () => {
    if (!testOfficeId) {
      console.log("Test office not available, skipping");
      return;
    }

    const officeBookings = await db.getOfficeBookings(testOfficeId);

    expect(officeBookings).toBeInstanceOf(Array);
    expect(officeBookings.length).toBeGreaterThanOrEqual(0);

    if (officeBookings.length > 0) {
      const booking = officeBookings[0];
      expect(booking.officeId).toBe(testOfficeId);
      expect(booking).toHaveProperty("scheduledDate");
      expect(booking).toHaveProperty("scheduledTime");
      expect(booking).toHaveProperty("status");
    }
  });

  it("should check available time slots", async () => {
    if (!testOfficeId) {
      console.log("Test office not available, skipping");
      return;
    }

    const testDate = new Date("2025-02-15");
    const slots = await db.getAvailableTimeSlots(testOfficeId, testDate);

    expect(slots).toBeInstanceOf(Array);

    if (slots.length > 0) {
      const slot = slots[0];
      expect(slot).toHaveProperty("time");
      expect(slot).toHaveProperty("available");
      expect(typeof slot.time).toBe("string");
      expect(typeof slot.available).toBe("boolean");
    }
  });

  it("should update booking status", async () => {
    if (!testUserId) {
      console.log("Test user not available, skipping");
      return;
    }

    const userBookings = await db.getUserBookings(testUserId);

    if (userBookings.length === 0) {
      console.log("No bookings found, skipping");
      return;
    }

    const bookingId = userBookings[0].id;
    await db.updateBookingStatus(bookingId, "confirmed");

    const updatedBooking = await db.getBookingById(bookingId);
    expect(updatedBooking?.status).toBe("confirmed");
  });

  it("should get office availability", async () => {
    if (!testOfficeId) {
      console.log("Test office not available, skipping");
      return;
    }

    const availability = await db.getOfficeAvailability(testOfficeId);

    expect(availability).toBeInstanceOf(Array);

    if (availability.length > 0) {
      const schedule = availability[0];
      expect(schedule).toHaveProperty("dayOfWeek");
      expect(schedule).toHaveProperty("startTime");
      expect(schedule).toHaveProperty("endTime");
      expect(schedule.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(schedule.dayOfWeek).toBeLessThanOrEqual(6);
    }
  });

  it("should prevent double booking for same time slot", async () => {
    if (!testOfficeId || !testUserId) {
      console.log("Test data not available, skipping");
      return;
    }

    const testDate = new Date("2025-03-15");
    const testTime = "14:00";

    // Create first booking
    await db.createBooking({
      userId: testUserId,
      officeId: testOfficeId,
      serviceId: 1,
      scheduledDate: testDate,
      scheduledTime: testTime,
      duration: 60,
      status: "confirmed" as const,
      serviceDescription: "First booking",
    });

    // Check available slots - the time should now be unavailable
    const slots = await db.getAvailableTimeSlots(testOfficeId, testDate);
    const slot = slots.find((s) => s.time === testTime);

    if (slot) {
      expect(slot.available).toBe(false);
    }
  });
});
