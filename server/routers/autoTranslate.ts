import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { translateToArabic, batchTranslateToArabic } from "../_core/machineTranslation";
import { updateOfficeTranslation, updateTemplateTranslation } from "../db";

export const autoTranslateRouter = router({
  // Translate a single text
  translateText: adminProcedure
    .input(
      z.object({
        text: z.string(),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await translateToArabic(input);
    }),

  // Auto-translate office fields
  translateOffice: adminProcedure
    .input(
      z.object({
        officeId: z.number(),
        fields: z.array(z.enum(["name", "description"])),
        applyTranslation: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get office data
      const { getSanadOfficeById } = await import("../db");
      const office = await getSanadOfficeById(input.officeId);

      if (!office) {
        throw new Error("Office not found");
      }

      const translations: {
        nameAr?: { translatedText: string; confidence: string };
        descriptionAr?: { translatedText: string; confidence: string };
      } = {};

      // Translate name if requested
      if (input.fields.includes("name") && office.officeName) {
        translations.nameAr = await translateToArabic({
          text: office.officeName,
          context: "office_name",
        });
      }

      // Translate description if requested
      if (input.fields.includes("description") && office.description) {
        translations.descriptionAr = await translateToArabic({
          text: office.description,
          context: "office_description",
        });
      }

      // Apply translations if requested
      if (input.applyTranslation) {
        await updateOfficeTranslation(
          input.officeId,
          {
            officeNameAr: translations.nameAr?.translatedText,
            descriptionAr: translations.descriptionAr?.translatedText,
          },
          {
            changedBy: ctx.user.id,
            changedByName: ctx.user.name || "Unknown",
            source: "auto_translate",
          }
        );
      }

      return {
        success: true,
        translations,
      };
    }),

  // Auto-translate template fields
  translateTemplate: adminProcedure
    .input(
      z.object({
        templateId: z.number(),
        fields: z.array(z.enum(["name", "description"])),
        applyTranslation: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get template data
      const { getDocumentTemplateById } = await import("../db");
      const template = await getDocumentTemplateById(input.templateId);

      if (!template) {
        throw new Error("Template not found");
      }

      const translations: {
        nameAr?: { translatedText: string; confidence: string };
        descriptionAr?: { translatedText: string; confidence: string };
      } = {};

      // Translate name if requested
      if (input.fields.includes("name") && template.templateName) {
        translations.nameAr = await translateToArabic({
          text: template.templateName,
          context: "template_name",
        });
      }

      // Translate description if requested
      if (input.fields.includes("description") && template.description) {
        translations.descriptionAr = await translateToArabic({
          text: template.description,
          context: "template_description",
        });
      }

      // Apply translations if requested
      if (input.applyTranslation) {
        await updateTemplateTranslation(
          input.templateId,
          {
            templateNameAr: translations.nameAr?.translatedText,
            descriptionAr: translations.descriptionAr?.translatedText,
          },
          {
            changedBy: ctx.user.id,
            changedByName: ctx.user.name || "Unknown",
            source: "auto_translate",
          }
        );
      }

      return {
        success: true,
        translations,
      };
    }),
});
