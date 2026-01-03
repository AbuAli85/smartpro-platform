import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Service Marketplace", () => {
  let customerContext: Context;
  let officeOwnerContext: Context;
  let requestId: number;
  let bidId: number;

  beforeAll(async () => {
    // Mock customer context
    customerContext = {
      user: {
        id: 1,
        openId: "test-customer",
        name: "Test Customer",
        email: "customer@test.com",
        role: "user",
        phoneNumber: null,
        preferredLanguage: "en",
        notificationPreferences: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };

    // Mock office owner context
    officeOwnerContext = {
      user: {
        id: 2,
        openId: "test-office-owner",
        name: "Test Office Owner",
        email: "owner@test.com",
        role: "user",
        phoneNumber: null,
        preferredLanguage: "en",
        notificationPreferences: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
  });

  describe("Service Request Creation", () => {
    it("should create a service request", async () => {
      const caller = appRouter.createCaller(customerContext);

      const result = await caller.serviceMarketplace.createRequest({
        title: "Need Commercial Registration for New Restaurant Business",
        description:
          "I am opening a new restaurant in Muscat and need help with commercial registration. The restaurant will be a small family business serving traditional Omani cuisine.",
        serviceType: "Commercial Registration",
        category: "Business Setup",
        requirements: "Need expedited processing if possible",
        budgetMin: 200,
        budgetMax: 500,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        urgency: "high",
        governorate: "Muscat",
        wilayat: "Al Seeb",
        remoteAccepted: true,
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
      requestId = result.id;
    });

    it("should reject request with short title", async () => {
      const caller = appRouter.createCaller(customerContext);

      await expect(
        caller.serviceMarketplace.createRequest({
          title: "Short",
          description:
            "This is a valid description that is long enough to pass validation requirements",
          serviceType: "Tax Registration",
          urgency: "medium",
          remoteAccepted: true,
        })
      ).rejects.toThrow();
    });

    it("should reject request with short description", async () => {
      const caller = appRouter.createCaller(customerContext);

      await expect(
        caller.serviceMarketplace.createRequest({
          title: "Valid Title That Is Long Enough",
          description: "Too short",
          serviceType: "Tax Registration",
          urgency: "medium",
          remoteAccepted: true,
        })
      ).rejects.toThrow();
    });
  });

  describe("Service Request Listing", () => {
    it("should list service requests", async () => {
      const caller = appRouter.createCaller(officeOwnerContext);

      const requests = await caller.serviceMarketplace.listRequests({});

      expect(Array.isArray(requests)).toBe(true);
      expect(requests.length).toBeGreaterThan(0);
    });

    it("should filter requests by category", async () => {
      const caller = appRouter.createCaller(officeOwnerContext);

      const requests = await caller.serviceMarketplace.listRequests({
        category: "Business Setup",
      });

      expect(Array.isArray(requests)).toBe(true);
    });

    it("should filter requests by urgency", async () => {
      const caller = appRouter.createCaller(officeOwnerContext);

      const requests = await caller.serviceMarketplace.listRequests({
        urgency: "high",
      });

      expect(Array.isArray(requests)).toBe(true);
    });
  });

  describe("Bid Creation", () => {
    it("should create a bid on a service request", async () => {
      const caller = appRouter.createCaller(officeOwnerContext);

      const result = await caller.serviceMarketplace.createBid({
        requestId,
        officeId: 1, // Assuming office ID 1 exists
        proposedPrice: 350,
        estimatedDuration: "5-7 business days",
        coverLetter:
          "We are experienced in commercial registrations and have helped over 100 restaurants get their licenses. Our team can expedite your application and ensure all documents are correctly prepared. We offer competitive pricing and excellent customer service.",
        methodology:
          "1. Initial consultation, 2. Document preparation, 3. Submission to authorities, 4. Follow-up and collection",
        portfolio: ["https://example.com/portfolio1.pdf"],
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
      bidId = result.id;
    });

    it("should reject bid with short cover letter", async () => {
      const caller = appRouter.createCaller(officeOwnerContext);

      await expect(
        caller.serviceMarketplace.createBid({
          requestId,
          officeId: 1,
          proposedPrice: 350,
          estimatedDuration: "5 days",
          coverLetter: "Short letter",
        })
      ).rejects.toThrow();
    });
  });

  describe("Request and Bid Retrieval", () => {
    it("should get customer's own requests", async () => {
      const caller = appRouter.createCaller(customerContext);

      const requests = await caller.serviceMarketplace.getMyRequests();

      expect(Array.isArray(requests)).toBe(true);
      expect(requests.length).toBeGreaterThan(0);
    });

    it("should get request with bids", async () => {
      const caller = appRouter.createCaller(customerContext);

      const request = await caller.serviceMarketplace.getRequest({
        requestId,
      });

      expect(request).toHaveProperty("id");
      expect(request).toHaveProperty("bids");
      expect(Array.isArray(request.bids)).toBe(true);
    });

    it("should get office's bids", async () => {
      const caller = appRouter.createCaller(officeOwnerContext);

      const bids = await caller.serviceMarketplace.getMyBids({
        officeId: 1,
      });

      expect(Array.isArray(bids)).toBe(true);
    });
  });

  describe("Bid Acceptance", () => {
    it("should accept a bid and create booking", async () => {
      if (!bidId) {
        // Create a fresh bid for this test
        const bidCaller = appRouter.createCaller(officeOwnerContext);
        const bidResult = await bidCaller.serviceMarketplace.createBid({
          requestId,
          officeId: 1,
          proposedPrice: 400,
          estimatedDuration: "7 business days",
          coverLetter:
            "We have extensive experience with commercial registrations and can provide excellent service for your restaurant business. Our team ensures quick turnaround times.",
        });
        bidId = bidResult.id;
      }

      const caller = appRouter.createCaller(customerContext);

      const result = await caller.serviceMarketplace.acceptBid({
        bidId,
      });

      expect(result).toHaveProperty("bookingId");
      expect(typeof result.bookingId).toBe("number");
    });

    it("should not allow accepting already accepted bid", async () => {
      const caller = appRouter.createCaller(customerContext);

      // Try to accept the same bid again (should fail because status is now 'awarded')
      await expect(
        caller.serviceMarketplace.acceptBid({
          bidId,
        })
      ).rejects.toThrow();
    });
  });
});
