import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Availability Management", () => {
  let testOfficeId: number;
  let testUserId: number;
  let testBlockedSlotId: number;

  beforeAll(async () => {
    // Use existing test data
    testOfficeId = 1; // Assuming test office exists
    testUserId = 1; // Assuming test user exists
  });

  describe("Office Availability Schedule", () => {
    it("should retrieve office availability schedule", async () => {
      const availability = await db.getOfficeAvailability(testOfficeId);
      
      expect(Array.isArray(availability)).toBe(true);
      // Each availability entry should have required fields
      if (availability.length > 0) {
        const entry = availability[0];
        expect(entry).toHaveProperty("dayOfWeek");
        expect(entry).toHaveProperty("startTime");
        expect(entry).toHaveProperty("endTime");
        expect(entry).toHaveProperty("slotDuration");
        expect(entry.dayOfWeek).toBeGreaterThanOrEqual(0);
        expect(entry.dayOfWeek).toBeLessThanOrEqual(6);
      }
    });

    it("should upsert office availability", async () => {
      const result = await db.upsertOfficeAvailability({
        officeId: testOfficeId,
        dayOfWeek: 1, // Monday
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 60,
        isAvailable: true,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should update existing availability", async () => {
      // Use a unique day for this test to avoid conflicts
      const testDay = 3; // Wednesday
      
      // First upsert
      const result1 = await db.upsertOfficeAvailability({
        officeId: testOfficeId,
        dayOfWeek: testDay,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 60,
        isAvailable: true,
      });
      expect(result1.success).toBe(true);

      // Update with different times
      const result2 = await db.upsertOfficeAvailability({
        officeId: testOfficeId,
        dayOfWeek: testDay, // Same day
        startTime: "10:00",
        endTime: "18:00",
        slotDuration: 30,
        isAvailable: true,
      });

      expect(result2.success).toBe(true);
      
      // Verify the update - the function should have updated, not inserted
      // Both results should have the same ID if it's an update
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      if (result1.id && result2.id) {
        expect(result1.id).toBe(result2.id);
      }
    });
  });

  describe("Blocked Slots Management", () => {
    it("should create a blocked slot (all day)", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = formatDate(tomorrow);

      testBlockedSlotId = await db.createBlockedSlot({
        officeId: testOfficeId,
        blockedDate: dateStr,
        isAllDay: true,
        reason: "Holiday",
        createdBy: testUserId,
      });

      expect(testBlockedSlotId).toBeGreaterThan(0);
    });

    it("should create a blocked slot (specific time range)", async () => {
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      const dateStr = formatDate(dayAfterTomorrow);

      const slotId = await db.createBlockedSlot({
        officeId: testOfficeId,
        blockedDate: dateStr,
        startTime: "14:00",
        endTime: "16:00",
        isAllDay: false,
        reason: "Training session",
        createdBy: testUserId,
      });

      expect(slotId).toBeGreaterThan(0);
    });

    it("should retrieve blocked slots for an office", async () => {
      const slots = await db.getOfficeBlockedSlots(testOfficeId);
      
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
      
      const slot = slots[0];
      expect(slot).toHaveProperty("officeId");
      expect(slot).toHaveProperty("blockedDate");
      expect(slot).toHaveProperty("isAllDay");
      expect(slot.officeId).toBe(testOfficeId);
    });

    it("should retrieve blocked slots for a specific date", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = formatDate(tomorrow);

      const slots = await db.getBlockedSlotsForDate(testOfficeId, dateStr);
      
      expect(Array.isArray(slots)).toBe(true);
      // Should find the all-day block we created
      const allDayBlock = slots.find((s) => s.isAllDay === 1);
      expect(allDayBlock).toBeDefined();
      expect(allDayBlock?.reason).toBe("Holiday");
    });

    it("should check if a time slot is blocked (all day)", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = formatDate(tomorrow);

      const isBlocked = await db.isTimeSlotBlocked(testOfficeId, dateStr, "10:00");
      
      expect(isBlocked).toBe(true); // Should be blocked because of all-day block
    });

    it("should check if a time slot is blocked (specific time)", async () => {
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      const dateStr = formatDate(dayAfterTomorrow);

      // Time within blocked range (14:00-16:00)
      const isBlocked1 = await db.isTimeSlotBlocked(testOfficeId, dateStr, "15:00");
      expect(isBlocked1).toBe(true);

      // Time outside blocked range
      const isBlocked2 = await db.isTimeSlotBlocked(testOfficeId, dateStr, "10:00");
      expect(isBlocked2).toBe(false);
    });

    it("should delete a blocked slot", async () => {
      const result = await db.deleteBlockedSlot(testBlockedSlotId, testOfficeId);
      
      expect(result).toBe(true);
      
      // Verify deletion
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = formatDate(tomorrow);
      const slots = await db.getBlockedSlotsForDate(testOfficeId, dateStr);
      
      const deletedSlot = slots.find((s) => s.id === testBlockedSlotId);
      expect(deletedSlot).toBeUndefined();
    });

    it("should reject deletion of non-existent slot", async () => {
      await expect(
        db.deleteBlockedSlot(999999, testOfficeId)
      ).rejects.toThrow();
    });
  });

  describe("Available Time Slots Integration", () => {
    it("should exclude blocked dates from available slots", async () => {
      // Create a blocked date
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 5);
      const dateStr = formatDate(testDate);

      await db.createBlockedSlot({
        officeId: testOfficeId,
        blockedDate: dateStr,
        isAllDay: true,
        reason: "Test block",
        createdBy: testUserId,
      });

      // Try to get available slots for that date
      const slots = await db.getAvailableTimeSlots(testOfficeId, testDate);
      
      // Should return empty array because entire day is blocked
      expect(slots).toEqual([]);
    });

    it("should exclude specific blocked times from available slots", async () => {
      // Create a time-specific block
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 6);
      const dateStr = formatDate(testDate);

      await db.createBlockedSlot({
        officeId: testOfficeId,
        blockedDate: dateStr,
        startTime: "10:00",
        endTime: "12:00",
        isAllDay: false,
        reason: "Meeting",
        createdBy: testUserId,
      });

      // Get available slots
      const slots = await db.getAvailableTimeSlots(testOfficeId, testDate);
      
      // Should have slots, but not between 10:00-12:00
      const blockedSlot = slots.find((s) => s.time === "10:00" || s.time === "11:00");
      expect(blockedSlot).toBeUndefined();
    });
  });
});

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
