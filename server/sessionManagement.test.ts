import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createCaller(overrides: Partial<TrpcContext> = {}) {
  const ctx: TrpcContext = {
    user: overrides.user || null,
    req: overrides.req || ({ protocol: "https", headers: {}, ip: "127.0.0.1", cookies: {} } as any),
    res: overrides.res || ({ clearCookie: () => {} } as any),
  };
  return appRouter.createCaller(ctx);
}

describe("Session Management", () => {
  let caller: ReturnType<typeof createCaller>;
  let testUserId: number;
  let testSessionId: string;

  beforeAll(async () => {
    // Create test user
    await db.upsertUser({
      openId: "test-session-user",
      name: "Test Session User",
      email: "session@test.com",
      role: "user",
    });

    const user = await db.getUserByOpenId("test-session-user");
    testUserId = user!.id;

    // Create test session
    testSessionId = "test-session-" + Date.now();
    await db.upsertActiveSession({
      sessionId: testSessionId,
      userId: testUserId,
      deviceInfo: {
        browser: "Chrome",
        os: "Windows",
        device: "Desktop",
        isMobile: false,
      },
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 Test",
    });

    caller = createCaller({
      user: {
        id: testUserId,
        openId: "test-session-user",
        name: "Test Session User",
        email: "session@test.com",
        role: "user",
        mfaEnabled: false,
      },
      req: {
        cookies: {
          manus_session_id: testSessionId,
        },
      } as any,
    });
  });

  afterAll(async () => {
    // Cleanup test data
    const dbInstance = await db.getDb();
    if (dbInstance) {
      const { users, activeSessions } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await dbInstance.delete(activeSessions).where(eq(activeSessions.userId, testUserId));
      await dbInstance.delete(users).where(eq(users.openId, "test-session-user"));
    }
  });

  describe("Get Active Sessions", () => {
    it("should retrieve all active sessions for user", async () => {
      const result = await caller.sessionManagement.getActiveSessions();
      expect(result.sessions).toBeDefined();
      expect(result.sessions.length).toBeGreaterThan(0);
    });

    it("should mark current session correctly", async () => {
      const result = await caller.sessionManagement.getActiveSessions();
      const currentSession = result.sessions.find((s) => s.isCurrent);
      expect(currentSession).toBeDefined();
      expect(currentSession?.sessionId).toBe(testSessionId);
    });

    it("should include device information", async () => {
      const result = await caller.sessionManagement.getActiveSessions();
      const session = result.sessions[0];
      expect(session.deviceInfo).toBeDefined();
      expect(session.ipAddress).toBe("127.0.0.1");
      expect(session.userAgent).toBe("Mozilla/5.0 Test");
    });
  });

  describe("Revoke Session", () => {
    it("should revoke a specific session", async () => {
      // Create another session to revoke
      const otherSessionId = "test-session-other-" + Date.now();
      await db.upsertActiveSession({
        sessionId: otherSessionId,
        userId: testUserId,
        deviceInfo: { browser: "Firefox", os: "Linux" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 Firefox",
      });

      const result = await caller.sessionManagement.revokeSession({
        sessionId: otherSessionId,
      });
      expect(result.success).toBe(true);

      // Verify session is revoked
      const sessions = await db.getActiveSessions(testUserId);
      const revokedSession = sessions.find((s) => s.sessionId === otherSessionId);
      expect(revokedSession).toBeUndefined();
    });

    it("should fail to revoke non-existent session", async () => {
      await expect(
        caller.sessionManagement.revokeSession({
          sessionId: "non-existent-session",
        })
      ).rejects.toThrow();
    });
  });

  describe("Revoke All Other Sessions", () => {
    it("should revoke all sessions except current", async () => {
      // Create multiple sessions
      await db.upsertActiveSession({
        sessionId: "session-1-" + Date.now(),
        userId: testUserId,
        deviceInfo: { browser: "Safari", os: "macOS" },
      });
      await db.upsertActiveSession({
        sessionId: "session-2-" + Date.now(),
        userId: testUserId,
        deviceInfo: { browser: "Edge", os: "Windows" },
      });

      const result = await caller.sessionManagement.revokeAllOtherSessions();
      expect(result.success).toBe(true);

      // Verify only current session remains
      const sessions = await db.getActiveSessions(testUserId);
      expect(sessions.length).toBe(1);
      expect(sessions[0].sessionId).toBe(testSessionId);
    });

    it("should fail if no current session", async () => {
      const callerWithoutSession = createCaller({
        user: {
          id: testUserId,
          openId: "test-session-user",
          name: "Test Session User",
          email: "session@test.com",
          role: "user",
          mfaEnabled: false,
        },
        req: {
          cookies: {},
        } as any,
      });

      await expect(
        callerWithoutSession.sessionManagement.revokeAllOtherSessions()
      ).rejects.toThrow("No active session found");
    });
  });
});
