import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Staff Management", () => {
  let testOfficeId: number;
  let testUserId: number;
  let testStaffId: number;

  beforeAll(async () => {
    // Use existing test data
    testOfficeId = 1;
    testUserId = 1;
  });

  describe("addOfficeStaff", () => {
    it("should add a staff member to an office", async () => {
      const staffData = {
        officeId: testOfficeId,
        userId: testUserId,
        role: "agent" as const,
      };

      const result = await db.addOfficeStaff(staffData);
      expect(result).toBeDefined();
      
      // Store for later tests
      if (result && typeof result === 'object' && 'insertId' in result) {
        testStaffId = result.insertId as number;
      }
    });
  });

  describe("getOfficeStaff", () => {
    it("should retrieve all staff members for an office", async () => {
      const staff = await db.getOfficeStaff(testOfficeId);
      
      expect(Array.isArray(staff)).toBe(true);
      
      if (staff.length > 0) {
        expect(staff[0]).toHaveProperty("id");
        expect(staff[0]).toHaveProperty("userId");
        expect(staff[0]).toHaveProperty("role");
        expect(staff[0]).toHaveProperty("isActive");
      }
    });

    it("should return empty array for office with no staff", async () => {
      const staff = await db.getOfficeStaff(99999);
      expect(Array.isArray(staff)).toBe(true);
      expect(staff.length).toBe(0);
    });
  });

  describe("updateOfficeStaff", () => {
    it("should update staff member role", async () => {
      if (!testStaffId) {
        // Add a staff member first
        const staffData = {
          officeId: testOfficeId,
          userId: testUserId,
          role: "agent" as const,
        };
        const result = await db.addOfficeStaff(staffData);
        if (result && typeof result === 'object' && 'insertId' in result) {
          testStaffId = result.insertId as number;
        }
      }

      const result = await db.updateOfficeStaff(testStaffId, {
        role: "manager",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
    });

    it("should update staff member active status", async () => {
      if (!testStaffId) return;

      const result = await db.updateOfficeStaff(testStaffId, {
        isActive: false,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
    });
  });

  describe("removeOfficeStaff", () => {
    it("should soft delete a staff member", async () => {
      if (!testStaffId) {
        // Add a staff member first
        const staffData = {
          officeId: testOfficeId,
          userId: testUserId,
          role: "agent" as const,
        };
        const result = await db.addOfficeStaff(staffData);
        if (result && typeof result === 'object' && 'insertId' in result) {
          testStaffId = result.insertId as number;
        }
      }

      const result = await db.removeOfficeStaff(testStaffId);
      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");

      // Verify staff is marked as inactive
      const staff = await db.getOfficeStaff(testOfficeId);
      const removedStaff = staff.find((s: any) => s.id === testStaffId);
      
      // Should not appear in active staff list
      expect(removedStaff).toBeUndefined();
    });
  });

  describe("Chat Assignment", () => {
    it("should assign a conversation to a staff member", async () => {
      const assignmentData = {
        conversationId: 1,
        assignedToUserId: testUserId,
        assignedByUserId: testUserId,
      };

      const result = await db.assignConversation(assignmentData);
      expect(result).toBeDefined();
    });

    it("should get conversation assignment", async () => {
      const assignment = await db.getConversationAssignment(1);
      
      if (assignment) {
        expect(assignment).toHaveProperty("conversationId");
        expect(assignment).toHaveProperty("assignedToUserId");
        expect(assignment).toHaveProperty("assignedByUserId");
      }
    });

    it("should get assigned conversations for a user", async () => {
      const conversations = await db.getAssignedConversations(testUserId);
      
      expect(Array.isArray(conversations)).toBe(true);
    });
  });
});
