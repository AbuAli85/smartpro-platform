import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { createInnerContext } from "./_core/context";
import type { User } from "../drizzle/schema";
import * as db from "./db";

describe("Request Wizard & Document Upload", () => {
  let testUser: User;
  let testContext: any;

  beforeAll(async () => {
    // Create test user
    const openId = `test-wizard-${Date.now()}`;
    await db.upsertUser({
      openId,
      name: "Test Wizard User",
      email: `wizard-${Date.now()}@test.com`,
      role: "user",
    });
    
    testUser = await db.getUserByOpenId(openId) as User;

    // Create test context
    testContext = await createInnerContext({
      req: {
        headers: {},
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
      } as any,
      res: {} as any,
    });
    testContext.user = testUser;
  });

  afterAll(async () => {
    // Cleanup test data - tests will clean up their own data
  });

  describe("Document Upload Router", () => {
    it("should get required documents for a service type", async () => {
      const caller = appRouter.createCaller(testContext);
      
      const result = await caller.documentUpload.getRequiredDocuments({
        serviceType: "Commercial Registration",
      });

      expect(result).toBeDefined();
      expect(result.requirements).toBeInstanceOf(Array);
      expect(result.requirements.length).toBeGreaterThan(0);
      expect(result.totalRequired).toBeGreaterThanOrEqual(0);
      expect(result.totalOptional).toBeGreaterThanOrEqual(0);
    });

    it("should validate file size limits", async () => {
      const caller = appRouter.createCaller(testContext);
      
      // Create a mock file that's too large (>16MB)
      const largeFileData = Buffer.alloc(17 * 1024 * 1024).toString("base64");

      await expect(
        caller.documentUpload.uploadDocument({
          fileName: "large-file.pdf",
          fileData: largeFileData,
          mimeType: "application/pdf",
        })
      ).rejects.toThrow("File size exceeds 16MB limit");
    });

    it("should validate file types", async () => {
      const caller = appRouter.createCaller(testContext);
      
      const invalidFileData = Buffer.from("test data").toString("base64");

      await expect(
        caller.documentUpload.uploadDocument({
          fileName: "test.txt",
          fileData: invalidFileData,
          mimeType: "text/plain",
        })
      ).rejects.toThrow("Invalid file type");
    });

    it("should upload a valid document", async () => {
      const caller = appRouter.createCaller(testContext);
      
      // Create a small valid PDF (mock)
      const validFileData = Buffer.from("PDF mock data").toString("base64");

      const result = await caller.documentUpload.uploadDocument({
        fileName: "test-document.pdf",
        fileData: validFileData,
        mimeType: "application/pdf",
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.fileKey).toBeDefined();
      expect(result.fileName).toBe("test-document.pdf");
      expect(result.mimeType).toBe("application/pdf");
    });

    it("should check document completeness", async () => {
      const caller = appRouter.createCaller(testContext);
      
      const result = await caller.documentUpload.checkCompleteness({
        uploadedDocuments: [
          { type: "national_id" },
          { type: "proof_of_address" },
        ],
        serviceType: "Commercial Registration",
      });

      expect(result).toBeDefined();
      expect(result.isComplete).toBeDefined();
      expect(result.missingDocuments).toBeInstanceOf(Array);
    });
  });

  describe("Service Request Creation with Documents", () => {
    it("should create a service request with documents", async () => {
      const caller = appRouter.createCaller(testContext);
      
      const request = await caller.serviceMarketplace.createRequest({
        title: "Test Commercial Registration Request",
        description: "This is a test request for commercial registration with document upload functionality",
        serviceType: "Commercial Registration",
        documents: [
          "https://example.com/doc1.pdf",
          "https://example.com/doc2.pdf",
        ],
        urgency: "medium",
        remoteAccepted: true,
      });

      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.trackingNumber).toBeDefined();
      expect(request.trackingNumber).toMatch(/^SR-\d{8}-[A-Z0-9]{6}$/);
    });

    it("should retrieve request by ID", async () => {
      const caller = appRouter.createCaller(testContext);
      
      // Create a request first
      const createdRequest = await caller.serviceMarketplace.createRequest({
        title: "Test Request for Retrieval",
        description: "This request will be retrieved to test the getRequestById procedure",
        serviceType: "Tax Registration",
        urgency: "low",
        remoteAccepted: true,
      });

      // Retrieve the request
      const retrievedRequest = await caller.serviceMarketplace.getRequestById({
        id: createdRequest.id,
      });

      expect(retrievedRequest).toBeDefined();
      expect(retrievedRequest.id).toBe(createdRequest.id);
      expect(retrievedRequest.title).toBe("Test Request for Retrieval");
      expect(retrievedRequest.trackingNumber).toBe(createdRequest.trackingNumber);
    });
  });

  describe("Document Validation", () => {
    it("should get required documents for different service types", async () => {
      const serviceTypes = [
        "Commercial Registration",
        "Tax Registration",
        "VAT Registration",
        "Business License",
        "Legal Consultation",
      ];

      const caller = appRouter.createCaller(testContext);

      for (const serviceType of serviceTypes) {
        const result = await caller.documentUpload.getRequiredDocuments({
          serviceType,
        });

        expect(result).toBeDefined();
        expect(result.requirements).toBeInstanceOf(Array);
        
        // Each service type should have at least one requirement
        if (serviceType !== "Legal Consultation") {
          expect(result.requirements.length).toBeGreaterThan(0);
        }
      }
    });

    it("should handle document validation gracefully when AI fails", async () => {
      const caller = appRouter.createCaller(testContext);
      
      // Upload a document first
      const validFileData = Buffer.from("Test document").toString("base64");
      const uploadResult = await caller.documentUpload.uploadDocument({
        fileName: "test-doc.pdf",
        fileData: validFileData,
        mimeType: "application/pdf",
      });

      // Validate with invalid URL (should handle gracefully)
      const validation = await caller.documentUpload.validateDocument({
        documentUrl: "invalid-url",
        fileName: "test-doc.pdf",
        expectedType: "national_id",
        serviceType: "Commercial Registration",
      });

      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toBeInstanceOf(Array);
      expect(validation.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Request Tracking", () => {
    it("should generate unique tracking numbers", async () => {
      const caller = appRouter.createCaller(testContext);
      
      const trackingNumbers = new Set<string>();

      // Create multiple requests
      for (let i = 0; i < 5; i++) {
        const request = await caller.serviceMarketplace.createRequest({
          title: `Test Request ${i}`,
          description: "Testing unique tracking number generation",
          serviceType: "Commercial Registration",
          urgency: "medium",
          remoteAccepted: true,
        });

        trackingNumbers.add(request.trackingNumber);
      }

      // All tracking numbers should be unique
      expect(trackingNumbers.size).toBe(5);
    });

    it("should retrieve user's service requests", async () => {
      const caller = appRouter.createCaller(testContext);
      
      // Create a request
      await caller.serviceMarketplace.createRequest({
        title: "Test Request for Listing",
        description: "This request should appear in the user's request list",
        serviceType: "Business License",
        urgency: "high",
        remoteAccepted: true,
      });

      // Get user's requests
      const requests = await caller.serviceMarketplace.getMyRequests();

      expect(requests).toBeDefined();
      expect(requests).toBeInstanceOf(Array);
      expect(requests.length).toBeGreaterThan(0);
      
      // Find our test request
      const testRequest = requests.find(r => r.title === "Test Request for Listing");
      expect(testRequest).toBeDefined();
    });
  });

  describe("Wizard Flow Validation", () => {
    it("should validate minimum title length", async () => {
      const caller = appRouter.createCaller(testContext);
      
      await expect(
        caller.serviceMarketplace.createRequest({
          title: "Short",
          description: "This description is long enough to pass validation requirements",
          serviceType: "Commercial Registration",
          urgency: "medium",
          remoteAccepted: true,
        })
      ).rejects.toThrow();
    });

    it("should validate minimum description length", async () => {
      const caller = appRouter.createCaller(testContext);
      
      await expect(
        caller.serviceMarketplace.createRequest({
          title: "Valid Title That Is Long Enough",
          description: "Too short",
          serviceType: "Commercial Registration",
          urgency: "medium",
          remoteAccepted: true,
        })
      ).rejects.toThrow();
    });

    it("should accept valid request with all optional fields", async () => {
      const caller = appRouter.createCaller(testContext);
      
      const request = await caller.serviceMarketplace.createRequest({
        title: "Complete Test Request",
        description: "This is a complete test request with all optional fields filled in to test the full wizard flow",
        serviceType: "VAT Registration",
        requirements: "Additional requirements here",
        documents: ["https://example.com/doc.pdf"],
        budgetMin: 100,
        budgetMax: 500,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        urgency: "urgent",
        governorate: "Muscat",
        wilayat: "Muscat",
        remoteAccepted: false,
      });

      expect(request).toBeDefined();
      expect(request.budgetMin).toBe("100.00");
      expect(request.budgetMax).toBe("500.00");
      expect(request.governorate).toBe("Muscat");
      expect(request.wilayat).toBe("Muscat");
      expect(request.remoteAccepted).toBe(false);
    });
  });
});
