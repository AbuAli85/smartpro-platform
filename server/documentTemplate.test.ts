import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import { generatePDF } from "./pdfGenerator";

describe("Document Template Generation", () => {
  let templateId: number;

  beforeAll(async () => {
    // Get a template from the database for testing
    const templates = await db.listDocumentTemplates({
      category: "employment",
      limit: 1,
    });
    
    if (templates.templates.length > 0) {
      templateId = templates.templates[0].id;
    }
  }, 30000); // 30 second timeout

  it("should list document templates with filters", async () => {
    const result = await db.listDocumentTemplates({
      category: "employment",
      limit: 10,
    });

    expect(result).toBeDefined();
    expect(result.templates).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("should retrieve a specific template by ID", async () => {
    if (!templateId) {
      console.log("No templates found, skipping test");
      return;
    }

    const template = await db.getDocumentTemplateById(templateId);

    expect(template).toBeDefined();
    expect(template?.id).toBe(templateId);
    expect(template?.templateName).toBeDefined();
    expect(template?.category).toBeDefined();
  });

  it("should have valid field definitions in template", async () => {
    if (!templateId) {
      console.log("No templates found, skipping test");
      return;
    }

    const template = await db.getDocumentTemplateById(templateId);

    expect(template).toBeDefined();
    expect(template?.templateName).toBeDefined();
    expect(template?.category).toBeDefined();
    
    // Field definitions may be stored as JSON string or object
    if (template?.fieldDefinitions) {
      const fields = typeof template.fieldDefinitions === 'string' 
        ? JSON.parse(template.fieldDefinitions)
        : template.fieldDefinitions;
      expect(Array.isArray(fields)).toBe(true);
    }
  });

  it("should generate PDF with valid data", async () => {
    if (!templateId) {
      console.log("No templates found, skipping test");
      return;
    }

    const template = await db.getDocumentTemplateById(templateId);
    if (!template) {
      console.log("Template not found, skipping test");
      return;
    }

    const sampleData = {
      employeeName: "Ahmed Al-Balushi",
      employeeId: "EMP-12345",
      position: "Software Engineer",
      department: "IT Department",
      startDate: "2024-01-15",
      salary: "2500",
      companyName: "Tech Solutions LLC",
      companyAddress: "Muscat, Oman",
    };

    const pdfBuffer = await generatePDF({
      template: template,
      filledData: sampleData,
      language: "en"
    });

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it("should increment template usage count", async () => {
    if (!templateId) {
      console.log("No templates found, skipping test");
      return;
    }

    const templateBefore = await db.getDocumentTemplateById(templateId);
    const usageCountBefore = templateBefore?.usageCount || 0;

    await db.incrementTemplateUsage(templateId);

    const templateAfter = await db.getDocumentTemplateById(templateId);
    const usageCountAfter = templateAfter?.usageCount || 0;

    expect(usageCountAfter).toBe(usageCountBefore + 1);
  });

  it("should search templates by name", async () => {
    const result = await db.listDocumentTemplates({
      search: "Employment",
      limit: 10,
    });

    expect(result.templates.length).toBeGreaterThan(0);
    
    const hasEmploymentInName = result.templates.some(
      (t) => t.templateName.toLowerCase().includes("employment")
    );
    expect(hasEmploymentInName).toBe(true);
  });

  it("should filter templates by language", async () => {
    const result = await db.listDocumentTemplates({
      language: "en",
      limit: 10,
    });

    expect(result.templates).toBeInstanceOf(Array);
    
    if (result.templates.length > 0) {
      result.templates.forEach((template) => {
        expect(template.language).toBe("en");
      });
    }
  });
});
