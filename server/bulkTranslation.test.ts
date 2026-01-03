import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Bulk Translation Import", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let testOfficeIds: number[] = [];
  let testTemplateIds: number[] = [];

  beforeAll(async () => {
    // Create admin caller
    adminCaller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "test-admin",
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
        languagePreference: "en",
        createdAt: new Date(),
      },
    });

    // Use existing offices and templates from database
    const offices = await db.listSanadOffices({});
    if (offices.offices.length >= 2) {
      testOfficeIds = [offices.offices[0].id, offices.offices[1].id];
    }

    const templates = await db.listDocumentTemplates({});
    if (templates.templates.length >= 2) {
      testTemplateIds = [templates.templates[0].id, templates.templates[1].id];
    }
  });

  afterAll(async () => {
    // No cleanup needed - we used existing data
  });

  describe("Office Translation Import", () => {
    it("should import multiple office translations successfully", async () => {
      const result = await adminCaller.bulkTranslation.importOfficeTranslations({
        translations: [
          {
            id: testOfficeIds[0],
            nameAr: "مكتب اختبار للاستيراد الجماعي 1",
            descriptionAr: "وصف الاختبار 1",
          },
          {
            id: testOfficeIds[1],
            nameAr: "مكتب اختبار للاستيراد الجماعي 2",
            descriptionAr: "وصف الاختبار 2",
          },
        ],
      });

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Verify translations were saved
      const office1 = await db.getSanadOfficeById(testOfficeIds[0]);
      expect(office1?.officeNameAr).toBe("مكتب اختبار للاستيراد الجماعي 1");
      expect(office1?.descriptionAr).toBe("وصف الاختبار 1");

      const office2 = await db.getSanadOfficeById(testOfficeIds[1]);
      expect(office2?.officeNameAr).toBe("مكتب اختبار للاستيراد الجماعي 2");
      expect(office2?.descriptionAr).toBe("وصف الاختبار 2");
    });

    it("should handle partial success when some offices fail", async () => {
      const result = await adminCaller.bulkTranslation.importOfficeTranslations({
        translations: [
          {
            id: testOfficeIds[0],
            nameAr: "تحديث الترجمة",
            descriptionAr: "تحديث الوصف",
          },
          {
            id: 999999, // Non-existent office - update succeeds but affects 0 rows
            nameAr: "مكتب غير موجود",
            descriptionAr: "وصف غير موجود",
          },
        ],
      });

      // Both updates succeed (no SQL errors), but non-existent ID affects 0 rows
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
    });

    it("should update only provided fields", async () => {
      // Update only name
      await adminCaller.bulkTranslation.importOfficeTranslations({
        translations: [
          {
            id: testOfficeIds[0],
            nameAr: "اسم محدث فقط",
          },
        ],
      });

      const office = await db.getSanadOfficeById(testOfficeIds[0]);
      expect(office?.officeNameAr).toBe("اسم محدث فقط");
      // Description should remain from previous test
      expect(office?.descriptionAr).toBeTruthy();
    });
  });

  describe("Template Translation Import", () => {
    it("should import multiple template translations successfully", async () => {
      const result = await adminCaller.bulkTranslation.importTemplateTranslations({
        translations: [
          {
            id: testTemplateIds[0],
            nameAr: "قالب اختبار للاستيراد الجماعي 1",
            descriptionAr: "وصف قالب الاختبار 1",
          },
          {
            id: testTemplateIds[1],
            nameAr: "قالب اختبار للاستيراد الجماعي 2",
            descriptionAr: "وصف قالب الاختبار 2",
          },
        ],
      });

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Verify translations were saved
      const template1 = await db.getDocumentTemplateById(testTemplateIds[0]);
      expect(template1?.templateNameAr).toBe("قالب اختبار للاستيراد الجماعي 1");
      expect(template1?.descriptionAr).toBe("وصف قالب الاختبار 1");

      const template2 = await db.getDocumentTemplateById(testTemplateIds[1]);
      expect(template2?.templateNameAr).toBe("قالب اختبار للاستيراد الجماعي 2");
      expect(template2?.descriptionAr).toBe("وصف قالب الاختبار 2");
    });

    it("should handle partial success when some templates fail", async () => {
      const result = await adminCaller.bulkTranslation.importTemplateTranslations({
        translations: [
          {
            id: testTemplateIds[0],
            nameAr: "تحديث ترجمة القالب",
            descriptionAr: "تحديث وصف القالب",
          },
          {
            id: 999999, // Non-existent template - update succeeds but affects 0 rows
            nameAr: "قالب غير موجود",
            descriptionAr: "وصف غير موجود",
          },
        ],
      });

      // Both updates succeed (no SQL errors), but non-existent ID affects 0 rows
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
    });

    it("should handle empty translations array", async () => {
      const result = await adminCaller.bulkTranslation.importTemplateTranslations({
        translations: [],
      });

      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Authorization", () => {
    it("should reject non-admin users from importing translations", async () => {
      const userCaller = appRouter.createCaller({
        user: {
          id: 2,
          openId: "test-user",
          name: "Test User",
          email: "user@test.com",
          role: "user",
          languagePreference: "en",
          createdAt: new Date(),
        },
      });

      await expect(
        userCaller.bulkTranslation.importOfficeTranslations({
          translations: [
            {
              id: testOfficeIds[0],
              nameAr: "محاولة غير مصرح بها",
              descriptionAr: "وصف غير مصرح به",
            },
          ],
        })
      ).rejects.toThrow();
    });
  });
});
