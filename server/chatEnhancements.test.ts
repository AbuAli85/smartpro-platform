import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import type { TrpcContext } from "./_core/context";

describe("Chat Enhancement Features", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testOfficeId: number;
  let testUserId: number;
  let testStaffId: number;
  let testConversationId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { users, sanadOffices, officeStaff, chatConversations } = await import("../drizzle/schema");

    // Create test user
    const [testUser] = await db
      .insert(users)
      .values({
        openId: `test-enhancement-${Date.now()}`,
        name: "Test Enhancement User",
        email: "test-enhancement@example.com",
        role: "sanad_owner",
      })
      .$returningId();
    testUserId = testUser.id;

    // Create test office
    const [testOffice] = await db
      .insert(sanadOffices)
      .values({
        officeName: "Test Enhancement Office",
        slug: `test-enhancement-${Date.now()}`,
        commercialRegistration: `CR-ENH-${Date.now()}`,
        ownerId: testUserId,
        governorate: "Test Governorate",
        wilayat: "Test Wilayat",
        addressLine1: "Test Address",
        phone: "+1234567890",
        email: "test-enhancement@office.com",
        status: "active",
      })
      .$returningId();
    testOfficeId = testOffice.id;

    // Create test staff member
    const [testStaff] = await db
      .insert(officeStaff)
      .values({
        officeId: testOfficeId,
        userId: testUserId,
        role: "agent",
        availabilityStatus: "online",
      })
      .$returningId();
    testStaffId = testStaff.id;

    // Create test conversation
    const [testConv] = await db
      .insert(chatConversations)
      .values({
        userId: testUserId,
        officeId: testOfficeId,
        status: "active",
      })
      .$returningId();
    testConversationId = testConv.id;

    // Create caller with test user context
    const ctx: TrpcContext = {
      user: {
        id: testUserId,
        openId: `test-enhancement-${Date.now()}`,
        name: "Test Enhancement User",
        email: "test-enhancement@example.com",
        role: "sanad_owner",
        loginMethod: "manus",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
    caller = appRouter.createCaller(ctx);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    const { users, sanadOffices, officeStaff, chatConversations, chatAssignments } = await import("../drizzle/schema");

    // Cleanup
    await db.delete(chatAssignments).where(eq(chatAssignments.conversationId, testConversationId));
    await db.delete(chatConversations).where(eq(chatConversations.id, testConversationId));
    await db.delete(officeStaff).where(eq(officeStaff.id, testStaffId));
    await db.delete(sanadOffices).where(eq(sanadOffices.id, testOfficeId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe("Conversation Tagging System", () => {
    it("should update conversation tags", async () => {
      const result = await caller.chat.updateTags({
        conversationId: testConversationId,
        tags: ["urgent", "technical"],
      });

      expect(result).toBeDefined();
      expect(result?.conversationId).toBe(testConversationId);
      expect(result?.tags).toEqual(["urgent", "technical"]);
    });

    it("should filter conversations by tags", async () => {
      // Update conversation with tags first
      await caller.chat.updateTags({
        conversationId: testConversationId,
        tags: ["billing", "urgent"],
      });

      const result = await caller.chat.getConversationsByTags({
        officeId: testOfficeId,
        tags: ["billing"],
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBe(testConversationId);
    });

    it("should handle multiple tag filters", async () => {
      const result = await caller.chat.getConversationsByTags({
        officeId: testOfficeId,
        tags: ["urgent", "technical"],
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should clear tags when empty array is provided", async () => {
      const result = await caller.chat.updateTags({
        conversationId: testConversationId,
        tags: [],
      });

      expect(result?.tags).toEqual([]);
    });
  });

  describe("Availability Status Management", () => {
    it("should update staff availability status", async () => {
      const result = await caller.chatAssignment.updateAvailability({
        staffId: testStaffId,
        status: "busy",
      });

      expect(result).toBeDefined();
      expect(result?.staffId).toBe(testStaffId);
      expect(result?.status).toBe("busy");
    });

    it("should change status from busy to online", async () => {
      await caller.chatAssignment.updateAvailability({
        staffId: testStaffId,
        status: "busy",
      });

      const result = await caller.chatAssignment.updateAvailability({
        staffId: testStaffId,
        status: "online",
      });

      expect(result?.status).toBe("online");
    });

    it("should set status to offline", async () => {
      const result = await caller.chatAssignment.updateAvailability({
        staffId: testStaffId,
        status: "offline",
      });

      expect(result?.status).toBe("offline");
    });

    it("should retrieve staff with updated availability", async () => {
      await caller.chatAssignment.updateAvailability({
        staffId: testStaffId,
        status: "online",
      });

      const staff = await caller.chatAssignment.getOfficeStaff({
        officeId: testOfficeId,
      });

      expect(staff).toBeDefined();
      expect(Array.isArray(staff)).toBe(true);
      const testStaffMember = staff.find((s: any) => s.id === testStaffId);
      expect(testStaffMember?.availabilityStatus).toBe("online");
    });
  });

  describe("Performance Trends Analytics", () => {
    it("should retrieve performance trends for 7 days", async () => {
      const result = await caller.chatAssignment.getPerformanceTrends({
        officeId: testOfficeId,
        days: 7,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it("should retrieve performance trends for 30 days", async () => {
      const result = await caller.chatAssignment.getPerformanceTrends({
        officeId: testOfficeId,
        days: 30,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(30);
    });

    it("should retrieve performance trends for 90 days", async () => {
      const result = await caller.chatAssignment.getPerformanceTrends({
        officeId: testOfficeId,
        days: 90,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(90);
    });

    it("should return trend data with correct structure", async () => {
      const result = await caller.chatAssignment.getPerformanceTrends({
        officeId: testOfficeId,
        days: 7,
      });

      expect(result[0]).toHaveProperty("date");
      expect(result[0]).toHaveProperty("avgResponseTime");
      expect(result[0]).toHaveProperty("resolutionRate");
      expect(result[0]).toHaveProperty("totalConversations");
    });

    it("should return dates in chronological order", async () => {
      const result = await caller.chatAssignment.getPerformanceTrends({
        officeId: testOfficeId,
        days: 7,
      });

      for (let i = 1; i < result.length; i++) {
        const prevDate = new Date(result[i - 1].date);
        const currDate = new Date(result[i].date);
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime());
      }
    });
  });

  describe("Integration Tests", () => {
    it("should handle tagged conversations with availability filtering", async () => {
      // Set staff to online
      await caller.chatAssignment.updateAvailability({
        staffId: testStaffId,
        status: "online",
      });

      // Tag conversation
      await caller.chat.updateTags({
        conversationId: testConversationId,
        tags: ["urgent"],
      });

      // Get available staff
      const availableStaff = await caller.chatAssignment.getAvailableStaff({
        officeId: testOfficeId,
      });

      expect(availableStaff.length).toBeGreaterThan(0);

      // Get tagged conversations
      const taggedConvs = await caller.chat.getConversationsByTags({
        officeId: testOfficeId,
        tags: ["urgent"],
      });

      expect(taggedConvs.length).toBeGreaterThan(0);
    });

    it("should track performance metrics with different availability statuses", async () => {
      // Test with online status
      await caller.chatAssignment.updateAvailability({
        staffId: testStaffId,
        status: "online",
      });

      let metrics = await caller.chatAssignment.getPerformanceMetrics({
        officeId: testOfficeId,
      });
      expect(metrics).toBeDefined();

      // Test with busy status
      await caller.chatAssignment.updateAvailability({
        staffId: testStaffId,
        status: "busy",
      });

      metrics = await caller.chatAssignment.getPerformanceMetrics({
        officeId: testOfficeId,
      });
      expect(metrics).toBeDefined();
    });
  });
});
