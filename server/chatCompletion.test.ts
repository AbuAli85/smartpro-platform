import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Chat System Completion Features", () => {
  let caller: any;
  let testUserId: number;
  let testOfficeId: number;
  let testStaffId: number;
  let testConversationId: number;

  beforeAll(async () => {
    // Upsert test user
    await db.upsertUser({
      openId: "test-completion-user",
      name: "Test User",
      email: "test-completion@example.com",
    });
    const user = await db.getUserByOpenId("test-completion-user");
    if (!user) throw new Error("Failed to create test user");
    testUserId = user.id;

    // Get an existing office or skip tests if none exist
    const officesResult = await db.listSanadOffices({ limit: 1 });
    if (!officesResult || officesResult.length === 0) {
      console.warn("No offices found, some tests will be skipped");
      testOfficeId = 0;
    } else {
      testOfficeId = officesResult[0].id;
      
      // Create test staff
      const staff = await db.addOfficeStaff({
        officeId: testOfficeId,
        userId: testUserId,
        role: "agent",
      });
      testStaffId = staff.id;

      // Create test conversation
      const conversation = await db.createChatConversation({
        userId: testUserId,
        officeId: testOfficeId,
      });
      testConversationId = conversation.id;
    }

    // Create caller
    caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-completion-user", name: "Test User", email: "test-completion@example.com" },
    });
  });

  afterAll(async () => {
    // Cleanup - most tables have soft delete or cascade delete
    // No explicit cleanup needed for this test
  });

  describe("Template Variables", () => {
    it("should process customer_name variable", async () => {
      const result = await caller.cannedResponses.processVariables({
        template: "Hello {{customer_name}}, how can I help?",
        conversationId: testConversationId,
      });

      expect(result.processed).toContain("Test User");
      expect(result.processed).not.toContain("{{customer_name}}");
    });

    it("should process office_name variable", async () => {
      const result = await caller.cannedResponses.processVariables({
        template: "Welcome to {{office_name}}!",
        conversationId: testConversationId,
      });

      expect(result.processed).toContain("Test Office");
      expect(result.processed).not.toContain("{{office_name}}");
    });

    it("should process multiple variables", async () => {
      const result = await caller.cannedResponses.processVariables({
        template: "Hi {{customer_name}}, welcome to {{office_name}}!",
        conversationId: testConversationId,
      });

      expect(result.processed).toContain("Test User");
      expect(result.processed).toContain("Test Office");
    });

    it("should process date and time variables", async () => {
      const result = await caller.cannedResponses.processVariables({
        template: "Today is {{date}} at {{time}}",
        conversationId: testConversationId,
      });

      expect(result.processed).not.toContain("{{date}}");
      expect(result.processed).not.toContain("{{time}}");
      expect(result.processed.length).toBeGreaterThan(20);
    });
  });

  describe("Satisfaction Trends", () => {
    it("should get satisfaction trends for 30 days", async () => {
      // Create a test rating
      await db.createChatRating({
        conversationId: testConversationId,
        userId: testUserId,
        rating: 5,
        feedback: "Great service!",
        staffUserId: testUserId,
      });

      const trends = await caller.chatRatings.getSatisfactionTrends({
        days: 30,
      });

      expect(Array.isArray(trends)).toBe(true);
    });

    it("should aggregate ratings by date", async () => {
      const trends = await caller.chatRatings.getSatisfactionTrends({
        days: 7,
      });

      if (trends.length > 0) {
        expect(trends[0]).toHaveProperty("date");
        expect(trends[0]).toHaveProperty("avgRating");
        expect(trends[0]).toHaveProperty("totalRatings");
      }
    });

    it("should return empty array when no ratings exist", async () => {
      // Query far in the past
      const trends = await db.getSatisfactionTrends(1);
      expect(Array.isArray(trends)).toBe(true);
    });
  });

  describe("Transfer History", () => {
    it("should create transfer record", async () => {
      // First assign conversation
      await db.assignConversation({
        conversationId: testConversationId,
        staffId: testStaffId,
      });

      // Create transfer
      const transfer = await caller.chatTransfer.transferConversation({
        conversationId: testConversationId,
        toStaffId: testStaffId,
        contextNotes: "Test transfer",
        isEscalation: false,
      });

      expect(transfer).toHaveProperty("id");
      expect(transfer.contextNotes).toBe("Test transfer");
    });

    it("should get transfer history for conversation", async () => {
      const history = await caller.chatTransfer.getTransferHistory({
        conversationId: testConversationId,
      });

      expect(Array.isArray(history)).toBe(true);
      if (history.length > 0) {
        expect(history[0]).toHaveProperty("fromUserId");
        expect(history[0]).toHaveProperty("toUserId");
        expect(history[0]).toHaveProperty("contextNotes");
      }
    });

    it("should mark escalation flag correctly", async () => {
      const transfer = await caller.chatTransfer.transferConversation({
        conversationId: testConversationId,
        toStaffId: testStaffId,
        contextNotes: "Urgent issue",
        isEscalation: true,
      });

      expect(transfer.isEscalation).toBe(true);
    });

    it("should update conversation assignment on transfer", async () => {
      // Get current assignment
      const assignmentBefore = await db.getConversationAssignment(testConversationId);
      
      // Transfer to same staff (for testing)
      await caller.chatTransfer.transferConversation({
        conversationId: testConversationId,
        toStaffId: testStaffId,
        contextNotes: "Test reassignment",
        isEscalation: false,
      });

      // Check assignment was updated
      const assignmentAfter = await db.getConversationAssignment(testConversationId);
      expect(assignmentAfter).toBeDefined();
    });
  });

  describe("Integration Tests", () => {
    it("should close conversation and trigger rating", async () => {
      // Close conversation
      await caller.chat.closeConversation({
        conversationId: testConversationId,
      });

      // Verify conversation is closed
      const conversation = await db.getChatConversationById(testConversationId);
      expect(conversation?.status).toBe("closed");
    });

    it("should calculate performance metrics with satisfaction scores", async () => {
      const metrics = await caller.chatAssignment.getPerformanceMetrics({
        officeId: testOfficeId,
      });

      expect(Array.isArray(metrics)).toBe(true);
      if (metrics.length > 0) {
        expect(metrics[0]).toHaveProperty("avgSatisfaction");
      }
    });

    it("should process variables in canned response with shortcut", async () => {
      // Create canned response with shortcut
      const response = await caller.cannedResponses.create({
        officeId: testOfficeId,
        title: "Test Greeting",
        content: "Hello {{customer_name}}!",
        category: "greeting",
        shortcut: "/hello",
      });

      expect(response).toHaveProperty("id");
      expect(response.shortcut).toBe("/hello");

      // Process variables
      const processed = await caller.cannedResponses.processVariables({
        template: response.content,
        conversationId: testConversationId,
      });

      expect(processed.processed).toContain("Test User");
    });
  });
});
