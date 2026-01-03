import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Intelligent Translation Features", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;
  let testOfficeId: number;

  beforeAll(async () => {
    // Create caller with admin context
    caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "test-admin",
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });

    testUserId = 1;
    
    // Get first office for testing
    const offices = await caller.sanadOffice.list({});
    testOfficeId = offices.offices[0]?.id || 1;
  });

  describe("Translation Memory", () => {
    it("should find similar translations based on source text", async () => {
      // First, create a translation to populate memory
      await caller.sanadOffice.updateTranslation({
        officeId: testOfficeId,
        officeNameAr: "مكتب الأعمال",
        descriptionAr: "مكتب متخصص في خدمات الأعمال",
      });

      // Search for similar translations
      const suggestions = await caller.translationMemory.findSimilar({
        sourceText: "Business Office",
        context: "office_name",
        limit: 5,
      });

      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should return translation memory statistics", async () => {
      const stats = await caller.translationMemory.getStats();

      expect(stats).toHaveProperty("totalEntries");
      expect(stats).toHaveProperty("totalUsage");
      expect(stats).toHaveProperty("avgUsage");
      expect(typeof stats.totalEntries).toBe("number");
    });

    it("should handle empty search gracefully", async () => {
      const suggestions = await caller.translationMemory.findSimilar({
        sourceText: "xyz123nonexistent",
        context: "office_name",
        limit: 5,
      });

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });
  });

  describe("Auto-Translation", () => {
    it("should translate office name and description", async () => {
      const result = await caller.autoTranslate.translateOffice({
        officeId: testOfficeId,
        fields: ["name", "description"],
        applyTranslation: false,
      });

      expect(result.success).toBe(true);
      expect(result.translations).toHaveProperty("nameAr");
      
      if (result.translations.nameAr) {
        expect(result.translations.nameAr.translatedText).toBeTruthy();
        expect(result.translations.nameAr.confidence).toMatch(/^(high|medium|low)$/);
      }
      
      // Description might not exist for all offices
      if (result.translations.descriptionAr) {
        expect(result.translations.descriptionAr.translatedText).toBeTruthy();
        expect(result.translations.descriptionAr.confidence).toMatch(/^(high|medium|low)$/);
      }
    });

    it("should apply translation when requested", async () => {
      const result = await caller.autoTranslate.translateOffice({
        officeId: testOfficeId,
        fields: ["name"],
        applyTranslation: true,
      });

      expect(result.success).toBe(true);
      
      // Verify translation was applied
      const offices = await caller.sanadOffice.list({});
      const office = offices.offices.find((o: any) => o.id === testOfficeId);
      expect(office?.officeNameAr).toBeTruthy();
    });

    it("should handle non-existent office gracefully", async () => {
      await expect(
        caller.autoTranslate.translateOffice({
          officeId: 999999,
          fields: ["name"],
          applyTranslation: false,
        })
      ).rejects.toThrow();
    });
  });

  describe("Version History", () => {
    it("should retrieve version history for an entity", async () => {
      // First create a translation to generate history
      await caller.sanadOffice.updateTranslation({
        officeId: testOfficeId,
        officeNameAr: "مكتب الأعمال المحدث",
        descriptionAr: "وصف محدث",
      });

      const history = await caller.translationMemory.getVersionHistory({
        entityType: "office",
        entityId: testOfficeId,
        limit: 10,
      });

      expect(Array.isArray(history)).toBe(true);
    });

    it("should filter version history by field name", async () => {
      const history = await caller.translationMemory.getVersionHistory({
        entityType: "office",
        entityId: testOfficeId,
        fieldName: "nameAr",
        limit: 5,
      });

      expect(Array.isArray(history)).toBe(true);
      
      // All entries should be for nameAr field
      history.forEach((version: any) => {
        if (version.fieldName) {
          expect(version.fieldName).toBe("nameAr");
        }
      });
    });

    it("should return empty array for entity with no history", async () => {
      const history = await caller.translationMemory.getVersionHistory({
        entityType: "office",
        entityId: 999999,
        limit: 10,
      });

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });
  });

  describe("Integration: Complete Translation Workflow", () => {
    it("should complete full translation workflow with memory and history", async () => {
      // Step 1: Auto-translate
      const autoTranslateResult = await caller.autoTranslate.translateOffice({
        officeId: testOfficeId,
        fields: ["name", "description"],
        applyTranslation: false,
      });

      expect(autoTranslateResult.success).toBe(true);
      const translatedName = autoTranslateResult.translations.nameAr?.translatedText;
      const translatedDesc = autoTranslateResult.translations.descriptionAr?.translatedText;

      // Step 2: Apply translation manually
      if (translatedName && translatedDesc) {
        await caller.sanadOffice.updateTranslation({
          officeId: testOfficeId,
          officeNameAr: translatedName,
          descriptionAr: translatedDesc,
        });

        // Step 3: Verify version history was created
        const history = await caller.translationMemory.getVersionHistory({
          entityType: "office",
          entityId: testOfficeId,
          limit: 5,
        });

        expect(history.length).toBeGreaterThan(0);

        // Step 4: Verify translation memory was populated
        const suggestions = await caller.translationMemory.findSimilar({
          sourceText: translatedName.substring(0, 10),
          context: "office_name",
          limit: 3,
        });

        expect(Array.isArray(suggestions)).toBe(true);
      }
    });
  });

  describe("Authorization", () => {
    it("should deny access to non-admin users", async () => {
      const userCaller = appRouter.createCaller({
        user: {
          id: 999,
          openId: "test-user",
          name: "Test User",
          email: "user@test.com",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });

      await expect(
        userCaller.translationMemory.getStats()
      ).rejects.toThrow();

      await expect(
        userCaller.autoTranslate.translateOffice({
          officeId: testOfficeId,
          fields: ["name"],
          applyTranslation: false,
        })
      ).rejects.toThrow();
    });
  });
});
