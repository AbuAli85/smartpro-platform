import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";

function createCaller(overrides: Partial<TrpcContext> = {}) {
  const ctx: TrpcContext = {
    user: overrides.user ?? null,
    req: overrides.req ?? ({ headers: {}, ip: "127.0.0.1" } as TrpcContext["req"]),
    res: overrides.res ?? ({} as TrpcContext["res"]),
    language: overrides.language ?? "en",
  };
  return appRouter.createCaller(ctx);
}

describe("revenueModels router", () => {
  const adminUser: User = {
    id: 1,
    openId: "admin-openid",
    name: "Admin",
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
    mfaEnabled: true,
    mfaSecret: null,
    mfaEnabledAt: null,
    emailVerified: false,
    emailVerificationToken: null,
    emailVerificationExpiry: null,
    recoveryEmail: null,
    recoveryEmailVerified: false,
    passwordResetToken: null,
    passwordResetExpiry: null,
  } as User;

  const regularUser: User = {
    ...adminUser,
    id: 2,
    openId: "user-openid",
    name: "User",
    email: "user@test.com",
    role: "user",
    mfaEnabled: false,
  } as User;

  describe("permission gating", () => {
    it("rejects unauthenticated caller with UNAUTHORIZED", async () => {
      const caller = createCaller({ user: null });
      try {
        await caller.revenueModels.listModels();
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect((e as TRPCError).code).toBe("UNAUTHORIZED");
      }
    });

    it("rejects non-admin caller with FORBIDDEN", async () => {
      const caller = createCaller({ user: regularUser });
      try {
        await caller.revenueModels.listModels();
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect((e as TRPCError).code).toBe("FORBIDDEN");
      }
    });

    it("admin caller is allowed to call listModels (returns data or INTERNAL_SERVER_ERROR if no DB)", async () => {
      const caller = createCaller({ user: adminUser });
      try {
        const result = await caller.revenueModels.listModels();
        expect(result).toHaveProperty("models");
        expect(result).toHaveProperty("versionsByModel");
        expect(Array.isArray(result.models)).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect((e as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });
});
