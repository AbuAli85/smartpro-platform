import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import * as XLSX from "xlsx";

/**
 * Translation Export Router
 * Exports all office and template translations to Excel format
 */

export const translationExportRouter = router({
  /**
   * Export all office translations with completion status
   */
  exportOfficeTranslations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can export translations",
      });
    }

    // Get all offices
    const { offices } = await db.listSanadOffices({ limit: 10000 });

    // Format data for Excel
    const data = offices.map((office) => {
      const hasNameAr = !!office.officeNameAr;
      const hasDescAr = !!office.descriptionAr;
      const completionStatus =
        hasNameAr && hasDescAr
          ? "Complete"
          : hasNameAr || hasDescAr
          ? "Partial"
          : "Missing";

      return {
        ID: office.id,
        "Office Name (English)": office.officeName,
        "Office Name (Arabic)": office.officeNameAr || "",
        "Description (English)": office.description || "",
        "Description (Arabic)": office.descriptionAr || "",
        Governorate: office.governorate,
        Status: office.status,
        "Translation Status": completionStatus,
        "Created At": new Date(office.createdAt).toLocaleDateString(),
      };
    });

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Office Translations");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 },  // ID
      { wch: 30 }, // Office Name (English)
      { wch: 30 }, // Office Name (Arabic)
      { wch: 50 }, // Description (English)
      { wch: 50 }, // Description (Arabic)
      { wch: 15 }, // Governorate
      { wch: 12 }, // Status
      { wch: 18 }, // Translation Status
      { wch: 15 }, // Created At
    ];

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const base64 = buffer.toString("base64");

    return {
      filename: `office_translations_${new Date().toISOString().split("T")[0]}.xlsx`,
      data: base64,
      totalOffices: offices.length,
      complete: offices.filter(o => o.officeNameAr && o.descriptionAr).length,
      partial: offices.filter(o => (o.officeNameAr || o.descriptionAr) && !(o.officeNameAr && o.descriptionAr)).length,
      missing: offices.filter(o => !o.officeNameAr && !o.descriptionAr).length,
    };
  }),

  /**
   * Export all template translations with completion status
   */
  exportTemplateTranslations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can export translations",
      });
    }

    // Get all templates
    const { templates } = await db.listDocumentTemplates({ limit: 10000 });

    // Format data for Excel
    const data = templates.map((template) => {
      const hasNameAr = !!template.templateNameAr;
      const hasDescAr = !!template.descriptionAr;
      const completionStatus =
        hasNameAr && hasDescAr
          ? "Complete"
          : hasNameAr || hasDescAr
          ? "Partial"
          : "Missing";

      return {
        ID: template.id,
        "Template Name (English)": template.templateName,
        "Template Name (Arabic)": template.templateNameAr || "",
        "Description (English)": template.description || "",
        "Description (Arabic)": template.descriptionAr || "",
        Category: template.category,
        Language: template.language,
        "Translation Status": completionStatus,
        "Usage Count": template.usageCount,
        "Created At": new Date(template.createdAt).toLocaleDateString(),
      };
    });

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Translations");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 },  // ID
      { wch: 30 }, // Template Name (English)
      { wch: 30 }, // Template Name (Arabic)
      { wch: 50 }, // Description (English)
      { wch: 50 }, // Description (Arabic)
      { wch: 15 }, // Category
      { wch: 10 }, // Language
      { wch: 18 }, // Translation Status
      { wch: 12 }, // Usage Count
      { wch: 15 }, // Created At
    ];

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const base64 = buffer.toString("base64");

    return {
      filename: `template_translations_${new Date().toISOString().split("T")[0]}.xlsx`,
      data: base64,
      totalTemplates: templates.length,
      complete: templates.filter(t => t.templateNameAr && t.descriptionAr).length,
      partial: templates.filter(t => (t.templateNameAr || t.descriptionAr) && !(t.templateNameAr && t.descriptionAr)).length,
      missing: templates.filter(t => !t.templateNameAr && !t.descriptionAr).length,
    };
  }),

  /**
   * Export combined report with both offices and templates
   */
  exportAllTranslations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can export translations",
      });
    }

    // Get all offices and templates
    const { offices } = await db.listSanadOffices({ limit: 10000 });
    const { templates } = await db.listDocumentTemplates({ limit: 10000 });

    // Format office data
    const officeData = offices.map((office) => {
      const hasNameAr = !!office.officeNameAr;
      const hasDescAr = !!office.descriptionAr;
      const completionStatus =
        hasNameAr && hasDescAr
          ? "Complete"
          : hasNameAr || hasDescAr
          ? "Partial"
          : "Missing";

      return {
        ID: office.id,
        "Name (English)": office.officeName,
        "Name (Arabic)": office.officeNameAr || "",
        "Description (English)": office.description || "",
        "Description (Arabic)": office.descriptionAr || "",
        "Translation Status": completionStatus,
      };
    });

    // Format template data
    const templateData = templates.map((template) => {
      const hasNameAr = !!template.templateNameAr;
      const hasDescAr = !!template.descriptionAr;
      const completionStatus =
        hasNameAr && hasDescAr
          ? "Complete"
          : hasNameAr || hasDescAr
          ? "Partial"
          : "Missing";

      return {
        ID: template.id,
        "Name (English)": template.templateName,
        "Name (Arabic)": template.templateNameAr || "",
        "Description (English)": template.description || "",
        "Description (Arabic)": template.descriptionAr || "",
        "Translation Status": completionStatus,
      };
    });

    // Create summary data
    const summaryData = [
      {
        Type: "Offices",
        Total: offices.length,
        Complete: offices.filter(o => o.officeNameAr && o.descriptionAr).length,
        Partial: offices.filter(o => (o.officeNameAr || o.descriptionAr) && !(o.officeNameAr && o.descriptionAr)).length,
        Missing: offices.filter(o => !o.officeNameAr && !o.descriptionAr).length,
        "Completion %": ((offices.filter(o => o.officeNameAr && o.descriptionAr).length / offices.length) * 100).toFixed(1) + "%",
      },
      {
        Type: "Templates",
        Total: templates.length,
        Complete: templates.filter(t => t.templateNameAr && t.descriptionAr).length,
        Partial: templates.filter(t => (t.templateNameAr || t.descriptionAr) && !(t.templateNameAr && t.descriptionAr)).length,
        Missing: templates.filter(t => !t.templateNameAr && !t.descriptionAr).length,
        "Completion %": ((templates.filter(t => t.templateNameAr && t.descriptionAr).length / templates.length) * 100).toFixed(1) + "%",
      },
    ];

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet["!cols"] = [
      { wch: 12 }, // Type
      { wch: 10 }, // Total
      { wch: 10 }, // Complete
      { wch: 10 }, // Partial
      { wch: 10 }, // Missing
      { wch: 15 }, // Completion %
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Offices sheet
    const officeSheet = XLSX.utils.json_to_sheet(officeData);
    officeSheet["!cols"] = [
      { wch: 8 },  // ID
      { wch: 30 }, // Name (English)
      { wch: 30 }, // Name (Arabic)
      { wch: 50 }, // Description (English)
      { wch: 50 }, // Description (Arabic)
      { wch: 18 }, // Translation Status
    ];
    XLSX.utils.book_append_sheet(workbook, officeSheet, "Offices");

    // Templates sheet
    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    templateSheet["!cols"] = [
      { wch: 8 },  // ID
      { wch: 30 }, // Name (English)
      { wch: 30 }, // Name (Arabic)
      { wch: 50 }, // Description (English)
      { wch: 50 }, // Description (Arabic)
      { wch: 18 }, // Translation Status
    ];
    XLSX.utils.book_append_sheet(workbook, templateSheet, "Templates");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const base64 = buffer.toString("base64");

    return {
      filename: `all_translations_${new Date().toISOString().split("T")[0]}.xlsx`,
      data: base64,
      summary: summaryData,
    };
  }),
});
