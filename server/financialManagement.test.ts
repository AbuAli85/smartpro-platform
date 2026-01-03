import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import * as db from "./db";

// Mock context for office owner
const createMockContext = (userId: number, role: "admin" | "user" | "sanad_owner" = "sanad_owner"): Context => ({
  user: {
    id: userId,
    openId: `test-openid-${userId}`,
    name: `Test User ${userId}`,
    email: `test${userId}@example.com`,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    phone: null,
    avatar: null,
    preferredLanguage: "en",
    notificationPreferences: null,
    mfaEnabled: 0,
    mfaSecret: null,
    emailVerified: 0,
    emailVerificationToken: null,
    emailVerificationExpiry: null,
    recoveryEmail: null,
    recoveryEmailVerified: 0,
  },
  req: {} as any,
  res: {} as any,
});

describe("Financial Management Router", () => {
  let testOfficeId: number;
  let testOwnerId: number;

  beforeAll(async () => {
    // Create test owner
    testOwnerId = 999101;
    
    // Create test office
    testOfficeId = await db.createOffice({
      officeName: "Test Office for Financial Management",
      officeNameAr: "مكتب اختبار للإدارة المالية",
      description: "Test office for financial management tests",
      descriptionAr: "مكتب اختبار للإدارة المالية",
      licenseNumber: "TEST-FIN-001",
      address: "Test Address",
      addressAr: "عنوان الاختبار",
      city: "Muscat",
      region: "Muscat",
      phone: "+96812345678",
      email: "fintest@example.com",
      ownerId: testOwnerId,
      isVerified: false,
      isAvailable: false,
      serviceIds: [],
    });
  });

  describe("getFinancialOverview", () => {
    it("should retrieve financial overview for office owner", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const overview = await caller.financialManagement.getFinancialOverview({
        officeId: testOfficeId,
      });

      expect(overview).toHaveProperty("totalRevenue");
      expect(overview).toHaveProperty("completedBookings");
      expect(overview).toHaveProperty("pendingRevenue");
      expect(overview).toHaveProperty("pendingBookings");
      expect(overview).toHaveProperty("revenueByService");
      expect(overview).toHaveProperty("period");
      
      expect(typeof overview.totalRevenue).toBe("number");
      expect(typeof overview.completedBookings).toBe("number");
      expect(Array.isArray(overview.revenueByService)).toBe(true);
    });

    it("should fail when non-owner tries to access financial data", async () => {
      const caller = appRouter.createCaller(createMockContext(888888));
      
      await expect(
        caller.financialManagement.getFinancialOverview({
          officeId: testOfficeId,
        })
      ).rejects.toThrow("You do not own this office");
    });

    it("should accept custom date range", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");
      
      const overview = await caller.financialManagement.getFinancialOverview({
        officeId: testOfficeId,
        startDate,
        endDate,
      });

      expect(overview).toHaveProperty("totalRevenue");
      expect(overview.period.startDate).toBeDefined();
      expect(overview.period.endDate).toBeDefined();
    });
  });

  describe("getPaymentHistory", () => {
    it("should retrieve payment history with pagination", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const history = await caller.financialManagement.getPaymentHistory({
        officeId: testOfficeId,
        limit: 10,
        offset: 0,
        status: "all",
      });

      expect(history).toHaveProperty("payments");
      expect(history).toHaveProperty("total");
      expect(history).toHaveProperty("hasMore");
      expect(Array.isArray(history.payments)).toBe(true);
      expect(typeof history.total).toBe("number");
      expect(typeof history.hasMore).toBe("boolean");
    });

    it("should filter by payment status", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const completedPayments = await caller.financialManagement.getPaymentHistory({
        officeId: testOfficeId,
        status: "completed",
      });

      expect(completedPayments).toHaveProperty("payments");
      expect(Array.isArray(completedPayments.payments)).toBe(true);
    });

    it("should respect pagination limits", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const history = await caller.financialManagement.getPaymentHistory({
        officeId: testOfficeId,
        limit: 5,
        offset: 0,
      });

      expect(history.payments.length).toBeLessThanOrEqual(5);
    });

    it("should fail when non-owner tries to access payment history", async () => {
      const caller = appRouter.createCaller(createMockContext(888888));
      
      await expect(
        caller.financialManagement.getPaymentHistory({
          officeId: testOfficeId,
        })
      ).rejects.toThrow("You do not own this office");
    });
  });

  describe("getRevenueTrends", () => {
    it("should retrieve revenue trends for default period", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const trends = await caller.financialManagement.getRevenueTrends({
        officeId: testOfficeId,
        period: "30days",
      });

      expect(Array.isArray(trends)).toBe(true);
      
      if (trends.length > 0) {
        expect(trends[0]).toHaveProperty("date");
        expect(trends[0]).toHaveProperty("revenue");
        expect(trends[0]).toHaveProperty("bookingCount");
        expect(typeof trends[0].revenue).toBe("number");
        expect(typeof trends[0].bookingCount).toBe("number");
      }
    });

    it("should support different time periods", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const periods: Array<"7days" | "30days" | "90days" | "1year"> = ["7days", "30days", "90days", "1year"];
      
      for (const period of periods) {
        const trends = await caller.financialManagement.getRevenueTrends({
          officeId: testOfficeId,
          period,
        });
        
        expect(Array.isArray(trends)).toBe(true);
      }
    });

    it("should fail when non-owner tries to access trends", async () => {
      const caller = appRouter.createCaller(createMockContext(888888));
      
      await expect(
        caller.financialManagement.getRevenueTrends({
          officeId: testOfficeId,
          period: "30days",
        })
      ).rejects.toThrow("You do not own this office");
    });
  });

  describe("getServicePricing", () => {
    it("should retrieve service pricing and performance data", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const pricing = await caller.financialManagement.getServicePricing({
        officeId: testOfficeId,
      });

      expect(Array.isArray(pricing)).toBe(true);
      
      if (pricing.length > 0) {
        expect(pricing[0]).toHaveProperty("id");
        expect(pricing[0]).toHaveProperty("serviceName");
        expect(pricing[0]).toHaveProperty("price");
        expect(pricing[0]).toHaveProperty("totalBookings");
        expect(pricing[0]).toHaveProperty("completedBookings");
        expect(pricing[0]).toHaveProperty("totalRevenue");
        expect(pricing[0]).toHaveProperty("conversionRate");
        
        expect(typeof pricing[0].price).toBe("number");
        expect(typeof pricing[0].totalRevenue).toBe("number");
        expect(typeof pricing[0].conversionRate).toBe("number");
      }
    });

    it("should calculate conversion rate correctly", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const pricing = await caller.financialManagement.getServicePricing({
        officeId: testOfficeId,
      });

      pricing.forEach(service => {
        if (service.totalBookings > 0) {
          const expectedRate = (service.completedBookings / service.totalBookings) * 100;
          expect(service.conversionRate).toBeCloseTo(expectedRate, 1);
        } else {
          expect(service.conversionRate).toBe(0);
        }
      });
    });

    it("should fail when non-owner tries to access pricing", async () => {
      const caller = appRouter.createCaller(createMockContext(888888));
      
      await expect(
        caller.financialManagement.getServicePricing({
          officeId: testOfficeId,
        })
      ).rejects.toThrow("You do not own this office");
    });
  });

  describe("exportFinancialReport", () => {
    it("should export financial report with data", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");
      
      const report = await caller.financialManagement.exportFinancialReport({
        officeId: testOfficeId,
        startDate,
        endDate,
        format: "csv",
      });

      expect(report).toHaveProperty("data");
      expect(report).toHaveProperty("format");
      expect(report).toHaveProperty("period");
      expect(report.format).toBe("csv");
      expect(Array.isArray(report.data)).toBe(true);
    });

    it("should include period information in export", async () => {
      const caller = appRouter.createCaller(createMockContext(testOwnerId));
      
      const startDate = new Date("2024-06-01");
      const endDate = new Date("2024-06-30");
      
      const report = await caller.financialManagement.exportFinancialReport({
        officeId: testOfficeId,
        startDate,
        endDate,
        format: "csv",
      });

      expect(report.period.startDate).toBeDefined();
      expect(report.period.endDate).toBeDefined();
    });

    it("should fail when non-owner tries to export", async () => {
      const caller = appRouter.createCaller(createMockContext(888888));
      
      await expect(
        caller.financialManagement.exportFinancialReport({
          officeId: testOfficeId,
          startDate: new Date(),
          endDate: new Date(),
          format: "csv",
        })
      ).rejects.toThrow("You do not own this office");
    });
  });
});
