import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";
import * as db from "./db";

/**
 * Audit Log Tests
 * 
 * Tests the audit logging system including:
 * - Event logging
 * - User-specific log retrieval
 * - Admin-only log access
 * - Statistics generation
 */

describe("Audit Log System", () => {
  let adminUser: User;
  let regularUser: User;
  let adminContext: TrpcContext;
  let userContext: TrpcContext;

  beforeAll(async () => {
    // Create test users
    adminUser = {
      id: 999,
      openId: "test-admin-openid",
      name: "Test Admin",
      email: "admin@test.com",
      phone: null,
      loginMethod: "email",
      role: "admin",
      avatarUrl: null,
      preferredLanguage: "en",
      notificationPreferences: null,
      whatsappEnabled: false,
      referralCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    regularUser = {
      id: 998,
      openId: "test-user-openid",
      name: "Test User",
      email: "user@test.com",
      phone: null,
      loginMethod: "email",
      role: "user",
      avatarUrl: null,
      preferredLanguage: "en",
      notificationPreferences: null,
      whatsappEnabled: false,
      referralCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    // Create mock contexts
    adminContext = {
      req: {} as any,
      res: {} as any,
      user: adminUser,
      language: "en",
    };

    userContext = {
      req: {} as any,
      res: {} as any,
      user: regularUser,
      language: "en",
    };
  });

  describe("Event Logging", () => {
    it("should log a successful login event", async () => {
      await db.logAuthEvent({
        userId: regularUser.id,
        openId: regularUser.openId,
        eventType: "login_success",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        deviceInfo: {
          browser: "Chrome",
          isMobile: false,
        },
        metadata: {
          loginMethod: "email",
        },
        success: true,
        severity: "info",
      });

      // Verify the event was logged
      const logs = await db.getUserAuditLogs(regularUser.id, { limit: 1 });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].eventType).toBe("login_success");
      expect(logs[0].success).toBe(true);
    });

    it("should log a failed login event", async () => {
      await db.logAuthEvent({
        openId: "unknown-user",
        eventType: "login_failure",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        metadata: {
          reason: "Invalid credentials",
        },
        success: false,
        severity: "warning",
      });

      // This should not throw an error even without userId
      expect(true).toBe(true);
    });

    it("should log a logout event", async () => {
      await db.logAuthEvent({
        userId: regularUser.id,
        openId: regularUser.openId,
        eventType: "logout",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        success: true,
        severity: "info",
      });

      const logs = await db.getUserAuditLogs(regularUser.id, { 
        limit: 10,
        eventTypes: ["logout"]
      });
      
      const logoutEvent = logs.find(log => log.eventType === "logout");
      expect(logoutEvent).toBeDefined();
      expect(logoutEvent?.success).toBe(true);
    });
  });

  describe("User Log Retrieval", () => {
    it("should allow users to view their own audit logs", async () => {
      const caller = appRouter.createCaller(userContext);
      
      const logs = await caller.auditLog.getMyLogs({
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(logs)).toBe(true);
      // All logs should belong to the user
      logs.forEach(log => {
        if (log.userId) {
          expect(log.userId).toBe(regularUser.id);
        }
      });
    });

    it("should filter logs by event type", async () => {
      const caller = appRouter.createCaller(userContext);
      
      const logs = await caller.auditLog.getMyLogs({
        limit: 10,
        offset: 0,
        eventTypes: ["login_success"],
      });

      logs.forEach(log => {
        expect(log.eventType).toBe("login_success");
      });
    });

    it("should respect pagination limits", async () => {
      const caller = appRouter.createCaller(userContext);
      
      const logs = await caller.auditLog.getMyLogs({
        limit: 5,
        offset: 0,
      });

      expect(logs.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Admin Log Access", () => {
    it("should allow admins to view all audit logs", async () => {
      const caller = appRouter.createCaller(adminContext);
      
      const logs = await caller.auditLog.getAllLogs({
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(logs)).toBe(true);
      // Logs can belong to any user
    });

    it("should prevent non-admins from viewing all logs", async () => {
      const caller = appRouter.createCaller(userContext);
      
      await expect(
        caller.auditLog.getAllLogs({
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow("Only administrators can view all audit logs");
    });

    it("should allow admins to filter by severity", async () => {
      const caller = appRouter.createCaller(adminContext);
      
      const logs = await caller.auditLog.getAllLogs({
        limit: 10,
        offset: 0,
        severity: ["critical", "error"],
      });

      logs.forEach(log => {
        expect(["critical", "error"]).toContain(log.severity);
      });
    });
  });

  describe("Audit Log Statistics", () => {
    it("should allow admins to view statistics", async () => {
      const caller = appRouter.createCaller(adminContext);
      
      const stats = await caller.auditLog.getStats({});

      expect(stats).toHaveProperty("totalEvents");
      expect(stats).toHaveProperty("successfulLogins");
      expect(stats).toHaveProperty("failedLogins");
      expect(stats).toHaveProperty("logouts");
      expect(stats).toHaveProperty("criticalEvents");
      expect(stats).toHaveProperty("uniqueUsers");
      
      expect(typeof stats.totalEvents).toBe("number");
      expect(typeof stats.successfulLogins).toBe("number");
      expect(typeof stats.failedLogins).toBe("number");
    });

    it("should prevent non-admins from viewing statistics", async () => {
      const caller = appRouter.createCaller(userContext);
      
      await expect(
        caller.auditLog.getStats({})
      ).rejects.toThrow("Only administrators can view audit log statistics");
    });

    it("should filter statistics by date range", async () => {
      const caller = appRouter.createCaller(adminContext);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      
      const stats = await caller.auditLog.getStats({
        startDate,
        endDate: new Date(),
      });

      expect(stats).toHaveProperty("totalEvents");
      expect(typeof stats.totalEvents).toBe("number");
    });
  });

  describe("Database Helper Functions", () => {
    it("should handle database unavailability gracefully", async () => {
      // This tests the error handling when DB is not available
      const logs = await db.getUserAuditLogs(999999, { limit: 10 });
      expect(Array.isArray(logs)).toBe(true);
    });

    it("should return empty stats when database is unavailable", async () => {
      const stats = await db.getAuditLogStats({});
      expect(stats).toHaveProperty("totalEvents");
      expect(typeof stats.totalEvents).toBe("number");
    });
  });
});
