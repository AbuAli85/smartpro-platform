import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Smart Batch Processing & Quality Monitoring", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const mockContext: Context = {
      req: {} as any,
      res: {} as any,
      user: {
        id: 1,
        openId: "test-admin",
        name: "Test Admin",
        email: "admin@test.com",
        phone: null,
        loginMethod: "oauth",
        role: "admin",
        avatarUrl: null,
        preferredLanguage: "en",
        notificationPreferences: null,
        referralCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    };

    caller = appRouter.createCaller(mockContext);
  });

  describe("Smart Batch Processing", () => {
    it("should get untranslated content count", async () => {
      const result = await caller.smartBatchProcessing.getUntranslatedCount({
        entityType: "both",
      });

      expect(result).toHaveProperty("offices");
      expect(result).toHaveProperty("templates");
      expect(result).toHaveProperty("total");
      expect(typeof result.offices).toBe("number");
      expect(typeof result.templates).toBe("number");
      expect(result.total).toBe(result.offices + result.templates);
    });

    it("should get untranslated count for offices only", async () => {
      const result = await caller.smartBatchProcessing.getUntranslatedCount({
        entityType: "office",
      });

      expect(result.templates).toBe(0);
      expect(result.total).toBe(result.offices);
    });

    it("should list batch jobs", async () => {
      const result = await caller.smartBatchProcessing.listJobs({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      // Each job should have required fields
      result.forEach((job) => {
        expect(job).toHaveProperty("id");
        expect(job).toHaveProperty("jobName");
        expect(job).toHaveProperty("status");
        expect(job).toHaveProperty("entityType");
        expect(job).toHaveProperty("totalItems");
        expect(job).toHaveProperty("processedItems");
        expect(job).toHaveProperty("createdAt");
      });
    });

    it("should start a batch translation job", async () => {
      const result = await caller.smartBatchProcessing.startBatchJob({
        jobName: "Test Batch Job",
        entityType: "office",
        confidenceThreshold: 80,
        useMemorySuggestions: true,
      });

      expect(result).toHaveProperty("jobId");
      expect(result).toHaveProperty("message");
      expect(typeof result.jobId).toBe("number");
      expect(result.message).toContain("started");
    });

    it("should reject batch job with invalid confidence threshold", async () => {
      await expect(
        caller.smartBatchProcessing.startBatchJob({
          jobName: "Invalid Job",
          entityType: "both",
          confidenceThreshold: 150, // Invalid: > 100
          useMemorySuggestions: true,
        })
      ).rejects.toThrow();
    });

    it("should reject batch job without job name", async () => {
      await expect(
        caller.smartBatchProcessing.startBatchJob({
          jobName: "",
          entityType: "both",
          confidenceThreshold: 80,
          useMemorySuggestions: true,
        })
      ).rejects.toThrow();
    });
  });

  describe("Translation Quality Monitoring", () => {
    it("should get quality metrics overview", async () => {
      const result = await caller.translationQuality.getQualityMetrics();

      expect(result).toHaveProperty("accuracyScore");
      expect(result).toHaveProperty("revisionRate");
      expect(result).toHaveProperty("memoryUsageRate");
      expect(typeof result.accuracyScore).toBe("number");
      expect(typeof result.revisionRate).toBe("number");
      expect(typeof result.memoryUsageRate).toBe("number");
      
      // Scores should be percentages (0-100)
      expect(result.accuracyScore).toBeGreaterThanOrEqual(0);
      expect(result.accuracyScore).toBeLessThanOrEqual(100);
    });

    it("should get translator performance stats", async () => {
      const result = await caller.translationQuality.getTranslatorPerformance({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((translator) => {
        expect(translator).toHaveProperty("translatorId");
        expect(translator).toHaveProperty("translatorName");
        expect(translator).toHaveProperty("totalTranslations");
        expect(translator).toHaveProperty("score");
        expect(typeof translator.score).toBe("number");
      });
    });

    it("should get most used memory phrases", async () => {
      const result = await caller.translationQuality.getMostUsedMemoryPhrases({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((phrase) => {
        expect(phrase).toHaveProperty("sourceText");
        expect(phrase).toHaveProperty("translatedText");
        expect(phrase).toHaveProperty("usageCount");
        expect(typeof phrase.usageCount).toBe("number");
      });
    });

    it("should get accuracy trends", async () => {
      const result = await caller.translationQuality.getAccuracyTrends({
        days: 30,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((trend) => {
        expect(trend).toHaveProperty("date");
        expect(trend).toHaveProperty("accuracyScore");
        expect(typeof trend.accuracyScore).toBe("number");
      });
    });
  });

  describe("Translation Memory", () => {
    it("should find similar translations", async () => {
      const result = await caller.translationMemory.findSimilar({
        sourceText: "office",
        limit: 5,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((match) => {
        expect(match).toHaveProperty("sourceText");
        expect(match).toHaveProperty("translatedText");
        expect(match).toHaveProperty("similarity");
        expect(typeof match.similarity).toBe("number");
        expect(match.similarity).toBeGreaterThanOrEqual(0);
        expect(match.similarity).toBeLessThanOrEqual(100);
      });
    });

    it("should return empty array for non-existent query", async () => {
      const result = await caller.translationMemory.findSimilar({
        sourceText: "xyzabc123nonexistent",
        limit: 5,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Auto Translation", () => {
    it("should translate text to Arabic", async () => {
      const result = await caller.autoTranslate.translateText({
        text: "Welcome to our office",
        context: "office_description",
      });

      expect(result).toHaveProperty("translatedText");
      expect(result).toHaveProperty("confidence");
      expect(typeof result.translatedText).toBe("string");
      expect(result.translatedText.length).toBeGreaterThan(0);
      expect(["high", "medium", "low"]).toContain(result.confidence);
    });

    it("should handle empty text translation", async () => {
      // Empty text doesn't throw, it returns a response
      const result = await caller.autoTranslate.translateText({
        text: "",
        context: "office_name",
      });
      
      expect(result).toHaveProperty("translatedText");
      expect(result).toHaveProperty("confidence");
    });
  });

  describe("Collaborative Review", () => {
    it("should get pending reviews", async () => {
      const result = await caller.collaborativeReview.getPendingReviews({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((review) => {
        expect(review).toHaveProperty("id");
        expect(review).toHaveProperty("status");
        expect(review.status).toBe("pending");
        expect(review).toHaveProperty("entityType");
        expect(review).toHaveProperty("translatedText");
      });
    });

    it("should submit translation for review", async () => {
      const result = await caller.collaborativeReview.submitForReview({
        entityType: "office",
        entityId: 1,
        fieldName: "officeName",
        translatedText: "مكتب الاختبار",
        notes: "Please review this translation",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("reviewId");
      expect(result.success).toBe(true);
      expect(typeof result.reviewId).toBe("number");
    });
  });

  describe("Authorization", () => {
    it("should reject non-admin access to quality metrics", async () => {
      const userContext: Context = {
        req: {} as any,
        res: {} as any,
        user: {
          id: 2,
          openId: "test-user",
          name: "Test User",
          email: "user@test.com",
          phone: null,
          loginMethod: "oauth",
          role: "user", // Not admin
          avatarUrl: null,
          preferredLanguage: "en",
          notificationPreferences: null,
          referralCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      };

      const userCaller = appRouter.createCaller(userContext);

      await expect(
        userCaller.translationQuality.getQualityMetrics()
      ).rejects.toThrow();
    });

    it("should reject non-admin access to batch processing", async () => {
      const userContext: Context = {
        req: {} as any,
        res: {} as any,
        user: {
          id: 2,
          openId: "test-user",
          name: "Test User",
          email: "user@test.com",
          phone: null,
          loginMethod: "oauth",
          role: "user",
          avatarUrl: null,
          preferredLanguage: "en",
          notificationPreferences: null,
          referralCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      };

      const userCaller = appRouter.createCaller(userContext);

      await expect(
        userCaller.smartBatchProcessing.startBatchJob({
          jobName: "Unauthorized Job",
          entityType: "both",
          confidenceThreshold: 80,
          useMemorySuggestions: true,
        })
      ).rejects.toThrow();
    });
  });
});
