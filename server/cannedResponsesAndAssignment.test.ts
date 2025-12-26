import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Canned Responses", () => {
  let testOfficeId: number;

  beforeAll(async () => {
    // Use existing office or create test data
    const offices = await db.listSanadOffices({ page: 1, limit: 1 });
    if (offices.offices.length > 0) {
      testOfficeId = offices.offices[0].id;
    } else {
      testOfficeId = 1; // Fallback
    }
  });

  it("should create a canned response", async () => {
    const response = await db.createCannedResponse({
      officeId: testOfficeId,
      title: "Office Hours",
      content: "Our office is open Monday-Friday, 8 AM to 5 PM.",
      category: "hours",
    });

    expect(response).toBeDefined();
    expect(response).toHaveProperty("id");
  });

  it("should get canned responses by office", async () => {
    const responses = await db.getCannedResponsesByOffice(testOfficeId);

    expect(Array.isArray(responses)).toBe(true);
  });

  it("should update a canned response", async () => {
    // Create a response first
    const created = await db.createCannedResponse({
      officeId: testOfficeId,
      title: "Test Response",
      content: "Original content",
      category: "general",
    });

    // Update it
    const updated = await db.updateCannedResponse(created!.id, {
      content: "Updated content",
    });

    expect(updated).toBeDefined();
    expect(updated).toHaveProperty("id");
  });

  it("should delete a canned response", async () => {
    // Create a response first
    const created = await db.createCannedResponse({
      officeId: testOfficeId,
      title: "To Delete",
      content: "This will be deleted",
      category: "general",
    });

    // Delete it
    const deleted = await db.deleteCannedResponse(created!.id);

    expect(deleted).toBeDefined();
    expect(deleted).toHaveProperty("id");
  });
});

describe("Office Staff and Chat Assignments", () => {
  let testOfficeId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Use existing office
    const offices = await db.listSanadOffices({ page: 1, limit: 1 });
    if (offices.offices.length > 0) {
      testOfficeId = offices.offices[0].id;
    } else {
      testOfficeId = 1;
    }

    // Use existing user or create test user
    const user = await db.upsertUser({
      openId: "test-staff-user",
      name: "Test Staff",
      email: "staff@test.com",
    });
    if (user) {
      testUserId = user.id;
    } else {
      testUserId = 1; // Fallback
    }
  });

  it("should add office staff", async () => {
    const staff = await db.addOfficeStaff({
      officeId: testOfficeId,
      userId: testUserId,
      role: "agent",
    });

    expect(staff).toBeDefined();
    expect(staff).toHaveProperty("id");
  });

  it("should get office staff", async () => {
    const staff = await db.getOfficeStaff(testOfficeId);

    expect(Array.isArray(staff)).toBe(true);
  });

  it.skip("should assign conversation to staff", async () => {
    // Create a test conversation first
    const conversation = await db.createChatConversation({
      userId: testUserId,
      officeId: testOfficeId,
    });

    if (conversation) {
      const assignment = await db.assignConversation({
        conversationId: conversation.id,
        assignedToUserId: testUserId,
        assignedByUserId: testUserId,
      });

      expect(assignment).toBeDefined();
      expect(assignment).toHaveProperty("id");
    }
  });

  it.skip("should get conversation assignment", async () => {
    // Create conversation and assignment
    const conversation = await db.createChatConversation({
      userId: testUserId,
      officeId: testOfficeId,
    });

    if (conversation) {
      await db.assignConversation({
        conversationId: conversation.id,
        assignedToUserId: testUserId,
        assignedByUserId: testUserId,
      });

      const assignment = await db.getConversationAssignment(conversation.id);

      expect(assignment).toBeDefined();
      if (assignment) {
        expect(assignment.conversationId).toBe(conversation.id);
      }
    }
  });

  it.skip("should get assigned conversations for user", async () => {
    const conversations = await db.getAssignedConversations(testUserId);

    expect(Array.isArray(conversations)).toBe(true);
  });
});
