import { beforeAll, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("offices.myOffices", () => {
  let testContext: TrpcContext;

  beforeAll(() => {
    // Mock authenticated user context
    testContext = {
      user: {
        id: 1,
        openId: "test-open-id",
        name: "Test User",
        email: "test@example.com",
        phone: "+968 1234 5678",
        loginMethod: "google",
        role: "sanad_owner",
        avatarUrl: null,
        preferredLanguage: "en",
        notificationPreferences: null,
        whatsappEnabled: false,
        referralCode: "TEST123",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
  });

  it("should return offices owned by the authenticated user", async () => {
    const caller = appRouter.createCaller(testContext);
    const result = await caller.offices.myOffices();

    // Should return an array (may be empty if user has no offices)
    expect(Array.isArray(result)).toBe(true);

    // If offices exist, verify structure
    if (result.length > 0) {
      const office = result[0];
      expect(office).toHaveProperty("id");
      expect(office).toHaveProperty("officeName");
      expect(office).toHaveProperty("ownerId");
      expect(office.ownerId).toBe(testContext.user!.id);
    }
  });

  it("should require authentication", async () => {
    const unauthContext: TrpcContext = {
      user: null,
      req: {} as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(unauthContext);

    await expect(caller.offices.myOffices()).rejects.toThrow();
  });

  it("should be accessible via both offices and sanadOffice routers", async () => {
    const caller = appRouter.createCaller(testContext);

    // Both should work and return the same data
    const officesResult = await caller.offices.myOffices();
    const sanadOfficeResult = await caller.sanadOffice.myOffices();

    expect(officesResult).toEqual(sanadOfficeResult);
  });
});
