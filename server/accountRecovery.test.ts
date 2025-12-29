import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createCaller(overrides: Partial<TrpcContext> = {}) {
  const ctx: TrpcContext = {
    user: overrides.user || null,
    req: overrides.req || ({ protocol: "https", headers: {}, ip: "127.0.0.1" } as any),
    res: overrides.res || ({ clearCookie: () => {} } as any),
  };
  return appRouter.createCaller(ctx);
}

describe("Account Recovery", () => {
  let caller: ReturnType<typeof createCaller>;
  let testUserId: number;

  beforeAll(async () => {
    // Create test user
    await db.upsertUser({
      openId: "test-recovery-user",
      name: "Test Recovery User",
      email: "recovery@test.com",
      role: "user",
    });

    const user = await db.getUserByOpenId("test-recovery-user");
    testUserId = user!.id;

    caller = createCaller({
      user: {
        id: testUserId,
        openId: "test-recovery-user",
        name: "Test Recovery User",
        email: "recovery@test.com",
        role: "user",
        mfaEnabled: false,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    const dbInstance = await db.getDb();
    if (dbInstance) {
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await dbInstance.delete(users).where(eq(users.openId, "test-recovery-user"));
    }
  });

  describe("Email Verification", () => {
    it("should send verification email", async () => {
      const result = await caller.accountRecovery.sendVerificationEmail();
      expect(result.success).toBe(true);
    });

    it("should fail if email is already verified", async () => {
      // First verify the email
      const token = await db.generateEmailVerificationToken(testUserId);
      await db.verifyEmailWithToken(token);

      // Try to send verification email again
      await expect(
        caller.accountRecovery.sendVerificationEmail()
      ).rejects.toThrow("Email is already verified");
    });

    it("should verify email with valid token", async () => {
      // Reset email verification status
      const dbInstance = await db.getDb();
      if (dbInstance) {
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await dbInstance
          .update(users)
          .set({ emailVerified: false })
          .where(eq(users.id, testUserId));
      }

      const token = await db.generateEmailVerificationToken(testUserId);
      const publicCaller = createCaller({ user: null });
      const result = await publicCaller.accountRecovery.verifyEmail({ token });
      expect(result.success).toBe(true);
    });

    it("should reject invalid verification token", async () => {
      const publicCaller = createCaller({ user: null });
      await expect(
        publicCaller.accountRecovery.verifyEmail({ token: "invalid-token" })
      ).rejects.toThrow("Invalid or expired verification token");
    });
  });

  describe("Password Reset", () => {
    it("should request password reset", async () => {
      const publicCaller = createCaller({ user: null });
      const result = await publicCaller.accountRecovery.requestPasswordReset({
        email: "recovery@test.com",
      });
      expect(result.success).toBe(true);
    });

    it("should not reveal if email doesn't exist", async () => {
      const publicCaller = createCaller({ user: null });
      const result = await publicCaller.accountRecovery.requestPasswordReset({
        email: "nonexistent@test.com",
      });
      // Should still return success to prevent email enumeration
      expect(result.success).toBe(true);
    });

    it("should verify valid reset token", async () => {
      const resetData = await db.generatePasswordResetToken("recovery@test.com");
      expect(resetData).not.toBeNull();

      const publicCaller = createCaller({ user: null });
      const result = await publicCaller.accountRecovery.verifyResetToken({
        token: resetData!.token,
      });
      expect(result.valid).toBe(true);
      expect(result.userId).toBe(testUserId);
    });

    it("should reject invalid reset token", async () => {
      const publicCaller = createCaller({ user: null });
      await expect(
        publicCaller.accountRecovery.verifyResetToken({ token: "invalid-token" })
      ).rejects.toThrow("Invalid or expired reset token");
    });

    it("should complete password reset", async () => {
      const resetData = await db.generatePasswordResetToken("recovery@test.com");
      const publicCaller = createCaller({ user: null });
      const result = await publicCaller.accountRecovery.resetPassword({
        token: resetData!.token,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Recovery Email", () => {
    it("should set recovery email", async () => {
      const result = await caller.accountRecovery.setRecoveryEmail({
        recoveryEmail: "backup@test.com",
      });
      expect(result.success).toBe(true);
    });

    it("should get recovery status", async () => {
      const result = await caller.accountRecovery.getRecoveryStatus();
      expect(result).toHaveProperty("emailVerified");
      expect(result).toHaveProperty("hasRecoveryEmail");
      expect(result).toHaveProperty("recoveryEmailVerified");
    });
  });
});
