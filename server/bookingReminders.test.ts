import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Booking Reminders", () => {
  let testBookingId1: number;
  let testBookingId2: number;
  let testBookingId3: number;

  beforeAll(async () => {
    // Create test bookings for reminder tests
    const userId = 1; // Assuming test user exists
    const officeId = 1; // Assuming test office exists
    
    testBookingId1 = await db.createBooking({
      officeId,
      userId,
      serviceDescription: "Test service 1 for reminder tests",
      status: "pending",
    });

    testBookingId2 = await db.createBooking({
      officeId,
      userId,
      serviceDescription: "Test service 2 for reminder tests",
      status: "pending",
    });

    testBookingId3 = await db.createBooking({
      officeId,
      userId,
      serviceDescription: "Test service 3 for reminder tests",
      status: "pending",
    });
  });

  it("should create default reminder settings", async () => {
    const reminder = await db.createBookingReminder({
      bookingId: testBookingId1,
    });

    expect(reminder).toBeDefined();
    expect(reminder?.bookingId).toBe(testBookingId1);
    expect(reminder?.reminder24h).toBe(1); // Default is true
    expect(reminder?.reminder2h).toBe(1); // Default is true
    expect(reminder?.emailEnabled).toBe(1); // Default is true
    expect(reminder?.smsEnabled).toBe(1); // Default is true
  });

  it("should retrieve reminder settings for a booking", async () => {
    const reminder = await db.getBookingReminder(testBookingId1);

    expect(reminder).toBeDefined();
    expect(reminder?.bookingId).toBe(testBookingId1);
    // Values should match what was created
    expect(reminder?.reminder24h).toBeDefined();
    expect(reminder?.reminder2h).toBeDefined();
    expect(reminder?.emailEnabled).toBeDefined();
    expect(reminder?.smsEnabled).toBeDefined();
  });

  it("should update reminder settings", async () => {
    // Update to disable 2h reminder
    const updated = await db.updateBookingReminder(testBookingId1, {
      reminder2h: false,
      smsEnabled: false,
    });

    expect(updated).toBeDefined();
    expect(updated?.reminder2h).toBe(0); // false = 0
    expect(updated?.smsEnabled).toBe(0); // false = 0
  });

  it("should handle non-existent booking reminder", async () => {
    const nonExistentBookingId = 999999;
    const reminder = await db.getBookingReminder(nonExistentBookingId);

    expect(reminder).toBeNull();
  });

  it("should create reminder with custom settings", async () => {
    const customReminder = await db.createBookingReminder({
      bookingId: testBookingId2,
      reminder24h: false,
      reminder2h: true,
      emailEnabled: false,
      smsEnabled: true,
    });

    expect(customReminder).toBeDefined();

    // Verify custom settings
    const retrieved = await db.getBookingReminder(testBookingId2);
    expect(retrieved?.reminder24h).toBe(0); // false
    expect(retrieved?.reminder2h).toBe(1); // true
    expect(retrieved?.emailEnabled).toBe(0); // false
    expect(retrieved?.smsEnabled).toBe(1); // true
  });
});
