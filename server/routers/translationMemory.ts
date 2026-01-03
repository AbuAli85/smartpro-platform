import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  findSimilarTranslations,
  getTranslationMemoryStats,
  getTranslationVersionHistory,
  rollbackToVersion,
} from "../db";

export const translationMemoryRouter = router({
  // Find similar translations for suggestions
  findSimilar: adminProcedure
    .input(
      z.object({
        sourceText: z.string(),
        context: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await findSimilarTranslations(input);
    }),

  // Get translation memory statistics
  getStats: adminProcedure.query(async () => {
    return await getTranslationMemoryStats();
  }),

  // Get version history for an entity
  getVersionHistory: adminProcedure
    .input(
      z.object({
        entityType: z.enum(["office", "template"]),
        entityId: z.number(),
        fieldName: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getTranslationVersionHistory(input);
    }),

  // Rollback to a previous version
  rollback: adminProcedure
    .input(
      z.object({
        versionId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const version = await rollbackToVersion(input.versionId);
      return {
        success: true,
        version,
      };
    }),
});
