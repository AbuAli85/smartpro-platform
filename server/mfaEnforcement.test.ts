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

describe("MFA Enforcement for Admins", () => {
  let adminWithoutMFA: ReturnType<typeof createCaller>;
  let adminWithMFA: ReturnType<typeof createCaller>;
  let regularUser: ReturnType<typeof createCaller>;
  let adminUserId: number;
  let adminWithMFAUserId: number;
  let regularUserId: number;

  beforeAll(async () => {
    // Create admin user without MFA
    await db.upsertUser({
      openId: "test-admin-no-mfa",
      name: "Admin Without MFA",
      email: "admin-no-mfa@test.com",
      role: "admin",
    });

    const adminUser = await db.getUserByOpenId("test-admin-no-mfa");
    adminUserId = adminUser!.id;

    adminWithoutMFA = createCaller({
      user: {
        id: adminUserId,
        openId: "test-admin-no-mfa",
        name: "Admin Without MFA",
        email: "admin-no-mfa@test.com",
        role: "admin",
        mfaEnabled: false,
      },
    });

    // Create admin user with MFA
    await db.upsertUser({
      openId: "test-admin-with-mfa",
      name: "Admin With MFA",
      email: "admin-with-mfa@test.com",
      role: "admin",
    });

    const adminWithMFAUser = await db.getUserByOpenId("test-admin-with-mfa");
    adminWithMFAUserId = adminWithMFAUser!.id;

    // Enable MFA for this admin
    const dbInstance = await db.getDb();
    if (dbInstance) {
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await dbInstance
        .update(users)
        .set({ mfaEnabled: true, mfaSecret: "test-secret" })
        .where(eq(users.id, adminWithMFAUserId));
    }

    adminWithMFA = createCaller({
      user: {
        id: adminWithMFAUserId,
        openId: "test-admin-with-mfa",
        name: "Admin With MFA",
        email: "admin-with-mfa@test.com",
        role: "admin",
        mfaEnabled: true,
      },
    });

    // Create regular user
    await db.upsertUser({
      openId: "test-regular-user",
      name: "Regular User",
      email: "regular@test.com",
      role: "user",
    });

    const regUser = await db.getUserByOpenId("test-regular-user");
    regularUserId = regUser!.id;

    regularUser = createCaller({
      user: {
        id: regularUserId,
        openId: "test-regular-user",
        name: "Regular User",
        email: "regular@test.com",
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
      const { eq, or } = await import("drizzle-orm");
      await dbInstance
        .delete(users)
        .where(
          or(
            eq(users.openId, "test-admin-no-mfa"),
            eq(users.openId, "test-admin-with-mfa"),
            eq(users.openId, "test-regular-user")
          )
        );
    }
  });

  describe("Admin Access Control", () => {
    it("should block admin without MFA from accessing admin routes", async () => {
      await expect(adminWithoutMFA.admin.getAllUsers()).rejects.toThrow(
        "MFA_REQUIRED_FOR_ADMIN"
      );
    });

    it("should allow admin with MFA to access admin routes", async () => {
      const result = await adminWithMFA.admin.getAllUsers();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should block regular user from accessing admin routes", async () => {
      await expect(regularUser.admin.getAllUsers()).rejects.toThrow(
        "Admin access required"
      );
    });
  });

  describe("MFA Enforcement Errors", () => {
    it("should provide setup URL in error for admin without MFA", async () => {
      try {
        await adminWithoutMFA.admin.getAllUsers();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("MFA_REQUIRED_FOR_ADMIN");
        expect(error.cause?.setupUrl).toBe("/security/mfa");
      }
    });
  });

  describe("Regular User MFA", () => {
    it("should allow regular user without MFA to access non-admin routes", async () => {
      // Regular users should be able to access their profile without MFA
      const result = await regularUser.auth.me();
      expect(result).toBeDefined();
      expect(result?.id).toBe(regularUserId);
    });
  });

  describe("MFA Status Check", () => {
    it("should correctly identify admin without MFA", async () => {
      const { enforceMFAForAdmin, shouldEnforceMFA } = await import(
        "./_core/mfaEnforcement"
      );

      const ctx = {
        user: {
          id: adminUserId,
          role: "admin" as const,
          mfaEnabled: false,
        },
      } as any;

      expect(shouldEnforceMFA(ctx)).toBe(true);
      expect(() => enforceMFAForAdmin(ctx)).toThrow();
    });

    it("should correctly identify admin with MFA", async () => {
      const { enforceMFAForAdmin, shouldEnforceMFA } = await import(
        "./_core/mfaEnforcement"
      );

      const ctx = {
        user: {
          id: adminWithMFAUserId,
          role: "admin" as const,
          mfaEnabled: true,
        },
      } as any;

      expect(shouldEnforceMFA(ctx)).toBe(false);
      expect(() => enforceMFAForAdmin(ctx)).not.toThrow();
    });

    it("should not enforce MFA for regular users", async () => {
      const { shouldEnforceMFA } = await import("./_core/mfaEnforcement");

      const ctx = {
        user: {
          id: regularUserId,
          role: "user" as const,
          mfaEnabled: false,
        },
      } as any;

      expect(shouldEnforceMFA(ctx)).toBe(false);
    });
  });
});
