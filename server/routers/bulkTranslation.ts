import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { updateOfficeTranslation, updateTemplateTranslation } from "../db";

export const bulkTranslationRouter = router({
  // Bulk import office translations
  importOfficeTranslations: adminProcedure
    .input(
      z.object({
        translations: z.array(
          z.object({
            id: z.number(),
            nameAr: z.string().optional(),
            descriptionAr: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const translation of input.translations) {
        try {
          await updateOfficeTranslation(translation.id, {
            officeNameAr: translation.nameAr,
            descriptionAr: translation.descriptionAr,
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(
            `Office ID ${translation.id}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      return results;
    }),

  // Bulk import template translations
  importTemplateTranslations: adminProcedure
    .input(
      z.object({
        translations: z.array(
          z.object({
            id: z.number(),
            nameAr: z.string().optional(),
            descriptionAr: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const translation of input.translations) {
        try {
          await updateTemplateTranslation(translation.id, {
            templateNameAr: translation.nameAr,
            descriptionAr: translation.descriptionAr,
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(
            `Template ID ${translation.id}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      return results;
    }),
});
