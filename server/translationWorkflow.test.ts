import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Translation Workflow System", () => {
  let adminCaller: any;
  let userCaller: any;

  beforeAll(async () => {
    // Create admin caller
    adminCaller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "admin-test",
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      },
      req: {} as any,
      res: {} as any,
    });

    // Create regular user caller
    userCaller = appRouter.createCaller({
      user: {
        id: 2,
        openId: "user-test",
        name: "Regular User",
        email: "user@test.com",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });
  });

  describe("Translation Request System", () => {
    it("should allow users to create translation requests", async () => {
      // Get first office
      const { offices } = await db.listSanadOffices({ limit: 1 });
      if (offices.length === 0) {
        console.log("No offices found, skipping test");
        return;
      }

      const office = offices[0];

      const result = await userCaller.translationRequest.create({
        entityType: "office",
        entityId: office.id,
        proposedNameAr: "اسم تجريبي",
        proposedDescriptionAr: "وصف تجريبي",
        notes: "Test translation request",
        priority: "medium",
      });

      expect(result.success).toBe(true);
      expect(result.requestId).toBeGreaterThan(0);
    });

    it("should allow admins to list all translation requests", async () => {
      const requests = await adminCaller.translationRequest.list({
        limit: 10,
      });

      expect(Array.isArray(requests)).toBe(true);
    });

    it("should allow users to list only their own requests", async () => {
      const requests = await userCaller.translationRequest.list({
        limit: 10,
      });

      expect(Array.isArray(requests)).toBe(true);
      // All requests should belong to the user
      requests.forEach((req: any) => {
        expect(req.requesterId).toBe(2);
      });
    });

    it("should allow admins to approve translation requests", async () => {
      // Create a request first
      const { offices } = await db.listSanadOffices({ limit: 1 });
      if (offices.length === 0) return;

      const createResult = await userCaller.translationRequest.create({
        entityType: "office",
        entityId: offices[0].id,
        proposedNameAr: "اسم للموافقة",
        proposedDescriptionAr: "وصف للموافقة",
        priority: "high",
      });

      // Approve the request
      const approveResult = await adminCaller.translationRequest.approve({
        id: createResult.requestId,
        reviewNotes: "Approved for testing",
        applyTranslation: true,
      });

      expect(approveResult.success).toBe(true);
    });

    it("should allow admins to reject translation requests", async () => {
      // Create a request first
      const { offices } = await db.listSanadOffices({ limit: 1 });
      if (offices.length === 0) return;

      const createResult = await userCaller.translationRequest.create({
        entityType: "office",
        entityId: offices[0].id,
        proposedNameAr: "اسم للرفض",
        priority: "low",
      });

      // Reject the request
      const rejectResult = await adminCaller.translationRequest.reject({
        id: createResult.requestId,
        reviewNotes: "Translation quality needs improvement",
      });

      expect(rejectResult.success).toBe(true);
    });

    it("should prevent non-admins from approving requests", async () => {
      try {
        await userCaller.translationRequest.approve({
          id: 1,
          reviewNotes: "Should fail",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should get pending translation requests count", async () => {
      const count = await adminCaller.translationRequest.getPendingCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Translation Export System", () => {
    it("should export office translations", async () => {
      const result = await adminCaller.translationExport.exportOfficeTranslations();

      expect(result.filename).toContain("office_translations");
      expect(result.data).toBeTruthy();
      expect(result.totalOffices).toBeGreaterThanOrEqual(0);
      expect(result.complete).toBeGreaterThanOrEqual(0);
      expect(result.partial).toBeGreaterThanOrEqual(0);
      expect(result.missing).toBeGreaterThanOrEqual(0);
    });

    it("should export template translations", async () => {
      const result = await adminCaller.translationExport.exportTemplateTranslations();

      expect(result.filename).toContain("template_translations");
      expect(result.data).toBeTruthy();
      expect(result.totalTemplates).toBeGreaterThanOrEqual(0);
      expect(result.complete).toBeGreaterThanOrEqual(0);
      expect(result.partial).toBeGreaterThanOrEqual(0);
      expect(result.missing).toBeGreaterThanOrEqual(0);
    });

    it("should export all translations with summary", async () => {
      const result = await adminCaller.translationExport.exportAllTranslations();

      expect(result.filename).toContain("all_translations");
      expect(result.data).toBeTruthy();
      expect(result.summary).toBeTruthy();
      expect(Array.isArray(result.summary)).toBe(true);
      expect(result.summary.length).toBe(2); // Offices and Templates
    });

    it("should prevent non-admins from exporting translations", async () => {
      try {
        await userCaller.translationExport.exportOfficeTranslations();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Translation Analytics System", () => {
    it("should get translation statistics summary", async () => {
      const stats = await adminCaller.translationAnalytics.getStatisticsSummary();

      expect(stats.offices).toBeTruthy();
      expect(stats.templates).toBeTruthy();
      expect(stats.overallCompletion).toBeTruthy();
      expect(typeof stats.pendingRequests).toBe("number");
      expect(typeof stats.recentActivityCount).toBe("number");
    });

    it("should get completion trends", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const trends = await adminCaller.translationAnalytics.getCompletionTrends({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: "day",
      });

      expect(Array.isArray(trends)).toBe(true);
    });

    it("should get translator leaderboard", async () => {
      const leaderboard = await adminCaller.translationAnalytics.getTranslatorLeaderboard({
        limit: 10,
      });

      expect(Array.isArray(leaderboard)).toBe(true);
    });

    it("should get recent translation activity", async () => {
      const activity = await adminCaller.translationAnalytics.getRecentActivity({
        limit: 20,
      });

      expect(Array.isArray(activity)).toBe(true);
    });

    it("should prevent non-admins from viewing analytics", async () => {
      try {
        await userCaller.translationAnalytics.getStatisticsSummary();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Translation Activity Logging", () => {
    it("should log translation activity when updating office translation", async () => {
      const { offices } = await db.listSanadOffices({ limit: 1 });
      if (offices.length === 0) return;

      const office = offices[0];

      // Update translation
      await db.updateOfficeTranslation(office.id, {
        officeNameAr: "اسم محدث",
        descriptionAr: "وصف محدث",
      });

      // Log the activity
      await db.logTranslationActivity({
        entityType: "office",
        entityId: office.id,
        entityName: office.officeName,
        translatorId: 1,
        translatorName: "Test Admin",
        actionType: "updated",
        fieldChanged: "both",
        source: "manual",
      });

      // Verify activity was logged
      const activities = await db.getTranslationActivityLog({
        entityType: "office",
        entityId: office.id,
        limit: 1,
      });

      expect(activities.length).toBeGreaterThan(0);
    });

    it("should retrieve translation activity by entity", async () => {
      const { offices } = await db.listSanadOffices({ limit: 1 });
      if (offices.length === 0) return;

      const activities = await db.getTranslationActivityLog({
        entityType: "office",
        entityId: offices[0].id,
        limit: 10,
      });

      expect(Array.isArray(activities)).toBe(true);
    });

    it("should retrieve recent translation activity", async () => {
      const activities = await db.getRecentTranslationActivity(10);

      expect(Array.isArray(activities)).toBe(true);
    });
  });

  describe("Bulk Translation Import", () => {
    it("should import office translations in bulk", async () => {
      const { offices } = await db.listSanadOffices({ limit: 3 });
      if (offices.length === 0) return;

      const translations = offices.map((office) => ({
        id: office.id,
        officeNameAr: `${office.officeName} - عربي`,
        descriptionAr: `وصف ${office.officeName}`,
      }));

      const result = await adminCaller.bulkTranslation.importOfficeTranslations({
        translations,
      });

      // Result contains success count
      expect(result.success).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it("should import template translations in bulk", async () => {
      const { templates } = await db.listDocumentTemplates({ limit: 3 });
      if (templates.length === 0) return;

      const translations = templates.map((template) => ({
        id: template.id,
        templateNameAr: `${template.templateName} - عربي`,
        descriptionAr: `وصف ${template.templateName}`,
      }));

      const result = await adminCaller.bulkTranslation.importTemplateTranslations({
        translations,
      });

      // Result contains success count
      expect(result.success).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it("should prevent non-admins from bulk importing", async () => {
      try {
        await userCaller.bulkTranslation.importOfficeTranslations({
          translations: [],
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});
