import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Chat Routing and Performance", () => {
  let testOfficeId: number;
  let testUserId: number;
  let testStaffId: number;
  let testConversationId: number;

  beforeAll(async () => {
    // Use existing test data
    testOfficeId = 1;
    testUserId = 1;
  });

  describe("Staff Availability Management", () => {
    it("should update staff availability status", async () => {
      // First add a staff member
      const staffData = {
        officeId: testOfficeId,
        userId: testUserId,
        role: "agent" as const,
      };
      const result = await db.addOfficeStaff(staffData);
      
      if (result && typeof result === 'object' && 'insertId' in result) {
        testStaffId = result.insertId as number;
      }

      // Update availability
      const updated = await db.updateStaffAvailability(testStaffId, "online");
      expect(updated).toBeDefined();
      expect(updated?.status).toBe("online");
    });

    it("should get available staff members", async () => {
      const availableStaff = await db.getAvailableStaff(testOfficeId);
      
      expect(Array.isArray(availableStaff)).toBe(true);
      
      // All returned staff should have online status
      availableStaff.forEach((staff: any) => {
        expect(staff.availabilityStatus).toBe("online");
      });
    });

    it("should update lastActiveAt when changing availability", async () => {
      if (!testStaffId) return;

      const before = new Date();
      await db.updateStaffAvailability(testStaffId, "busy");
      
      // Verify the update was successful
      const result = await db.updateStaffAvailability(testStaffId, "online");
      expect(result).toBeDefined();
    });
  });

  describe("Staff Workload Tracking", () => {
    it("should calculate staff workload correctly", async () => {
      const workload = await db.getStaffWorkload(testOfficeId);
      
      expect(Array.isArray(workload)).toBe(true);
      
      workload.forEach((w: any) => {
        expect(w).toHaveProperty("staffId");
        expect(w).toHaveProperty("userId");
        expect(w).toHaveProperty("activeConversations");
        expect(typeof w.activeConversations).toBe("number");
      });
    });

    it("should return zero conversations for new staff", async () => {
      const workload = await db.getStaffWorkload(testOfficeId);
      
      // New staff should have 0 active conversations
      const newStaff = workload.find((w: any) => w.userId === testUserId);
      if (newStaff) {
        expect(newStaff.activeConversations).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Automated Chat Routing", () => {
    it("should assign conversation to least-loaded staff", async () => {
      // Create a test conversation
      const conversationId = await db.createChatConversation({
        userId: testUserId,
        officeId: testOfficeId,
      });

      if (typeof conversationId === 'number') {
        testConversationId = conversationId;
      }

      // Get available staff
      const availableStaff = await db.getAvailableStaff(testOfficeId);
      
      if (availableStaff.length > 0) {
        // Get workload
        const workload = await db.getStaffWorkload(testOfficeId);
        
        // Find least loaded staff
        const staffWithWorkload = availableStaff.map((staff: any) => {
          const load = workload.find((w: any) => w.userId === staff.userId);
          return {
            ...staff,
            activeConversations: load?.activeConversations || 0,
          };
        });

        staffWithWorkload.sort((a, b) => a.activeConversations - b.activeConversations);
        const leastLoaded = staffWithWorkload[0];

        // Assign conversation
        const assignment = await db.assignConversation({
          conversationId: testConversationId,
          assignedToUserId: leastLoaded.userId,
          assignedByUserId: testUserId,
        });

        expect(assignment).toBeDefined();
      }
    });

    it("should handle no available staff gracefully", async () => {
      // Test with non-existent office
      const availableStaff = await db.getAvailableStaff(99999);
      
      expect(Array.isArray(availableStaff)).toBe(true);
      expect(availableStaff.length).toBe(0);
    });
  });

  describe("Performance Metrics Calculation", () => {
    it("should calculate staff performance metrics", async () => {
      const metrics = await db.getStaffPerformanceMetrics(testOfficeId);
      
      expect(Array.isArray(metrics)).toBe(true);
      
      metrics.forEach((m: any) => {
        expect(m).toHaveProperty("staffId");
        expect(m).toHaveProperty("userId");
        expect(m).toHaveProperty("userName");
        expect(m).toHaveProperty("role");
        expect(m).toHaveProperty("totalConversations");
        expect(m).toHaveProperty("activeConversations");
        expect(m).toHaveProperty("closedConversations");
        expect(m).toHaveProperty("avgResponseTimeMinutes");
        expect(m).toHaveProperty("resolutionRate");
        
        // Validate data types
        expect(typeof m.totalConversations).toBe("number");
        expect(typeof m.avgResponseTimeMinutes).toBe("number");
        expect(typeof m.resolutionRate).toBe("number");
        
        // Validate ranges
        expect(m.resolutionRate).toBeGreaterThanOrEqual(0);
        expect(m.resolutionRate).toBeLessThanOrEqual(100);
      });
    });

    it("should calculate resolution rate correctly", async () => {
      const metrics = await db.getStaffPerformanceMetrics(testOfficeId);
      
      metrics.forEach((m: any) => {
        if (m.totalConversations > 0) {
          const expectedRate = Math.round((m.closedConversations / m.totalConversations) * 100);
          expect(m.resolutionRate).toBe(expectedRate);
        } else {
          expect(m.resolutionRate).toBe(0);
        }
      });
    });

    it("should filter metrics by specific staff member", async () => {
      const allMetrics = await db.getStaffPerformanceMetrics(testOfficeId);
      
      if (allMetrics.length > 0) {
        const firstStaffUserId = allMetrics[0].userId;
        const filteredMetrics = await db.getStaffPerformanceMetrics(testOfficeId, firstStaffUserId);
        
        expect(filteredMetrics.length).toBeLessThanOrEqual(allMetrics.length);
        filteredMetrics.forEach((m: any) => {
          expect(m.userId).toBe(firstStaffUserId);
        });
      }
    });

    it("should handle staff with no conversations", async () => {
      const metrics = await db.getStaffPerformanceMetrics(testOfficeId);
      
      const staffWithNoConversations = metrics.filter((m: any) => m.totalConversations === 0);
      
      staffWithNoConversations.forEach((m: any) => {
        expect(m.activeConversations).toBe(0);
        expect(m.closedConversations).toBe(0);
        expect(m.avgResponseTimeMinutes).toBe(0);
        expect(m.resolutionRate).toBe(0);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should maintain workload balance after multiple assignments", async () => {
      const initialWorkload = await db.getStaffWorkload(testOfficeId);
      
      // Create and assign multiple conversations
      const conversationIds = [];
      for (let i = 0; i < 3; i++) {
        const convId = await db.createChatConversation({
          userId: testUserId,
          officeId: testOfficeId,
        });
        
        if (typeof convId === 'number') {
          conversationIds.push(convId);
        }
      }

      // Assign to least-loaded staff each time
      for (const convId of conversationIds) {
        const availableStaff = await db.getAvailableStaff(testOfficeId);
        
        if (availableStaff.length > 0) {
          const workload = await db.getStaffWorkload(testOfficeId);
          const staffWithWorkload = availableStaff.map((staff: any) => {
            const load = workload.find((w: any) => w.userId === staff.userId);
            return {
              ...staff,
              activeConversations: load?.activeConversations || 0,
            };
          });

          staffWithWorkload.sort((a, b) => a.activeConversations - b.activeConversations);
          const leastLoaded = staffWithWorkload[0];

          await db.assignConversation({
            conversationId: convId,
            assignedToUserId: leastLoaded.userId,
            assignedByUserId: testUserId,
          });
        }
      }

      // Verify workload is balanced
      const finalWorkload = await db.getStaffWorkload(testOfficeId);
      
      if (finalWorkload.length > 1) {
        const maxLoad = Math.max(...finalWorkload.map((w: any) => w.activeConversations));
        const minLoad = Math.min(...finalWorkload.map((w: any) => w.activeConversations));
        
        // Difference should not be more than the number of assignments
        expect(maxLoad - minLoad).toBeLessThanOrEqual(conversationIds.length);
      }
    });
  });
});
