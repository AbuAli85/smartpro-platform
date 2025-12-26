import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const translationQualityRouter = router({
  // Get overall translation quality metrics
  getQualityMetrics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get total translations count
    const [officeStats] = await db.execute(sql`
      SELECT 
        COUNT(*) as totalOffices,
        SUM(CASE WHEN officeNameAr IS NOT NULL AND officeNameAr != '' THEN 1 ELSE 0 END) as translatedNames,
        SUM(CASE WHEN descriptionAr IS NOT NULL AND descriptionAr != '' THEN 1 ELSE 0 END) as translatedDescriptions,
        SUM(CASE WHEN officeNameAr IS NOT NULL AND officeNameAr != '' 
                  AND descriptionAr IS NOT NULL AND descriptionAr != '' THEN 1 ELSE 0 END) as fullyTranslated
      FROM sanad_offices
      WHERE status = 'active'
    `);

    const [templateStats] = await db.execute(sql`
      SELECT 
        COUNT(*) as totalTemplates,
        SUM(CASE WHEN templateNameAr IS NOT NULL AND templateNameAr != '' THEN 1 ELSE 0 END) as translatedNames,
        SUM(CASE WHEN descriptionAr IS NOT NULL AND descriptionAr != '' THEN 1 ELSE 0 END) as translatedDescriptions,
        SUM(CASE WHEN templateNameAr IS NOT NULL AND templateNameAr != '' 
                  AND descriptionAr IS NOT NULL AND descriptionAr != '' THEN 1 ELSE 0 END) as fullyTranslated
      FROM document_templates
      WHERE isActive = 1
    `);

    const officeData = (officeStats as any)[0] || {};
    const templateData = (templateStats as any)[0] || {};

    return {
      offices: {
        total: Number(officeData.totalOffices) || 0,
        translatedNames: Number(officeData.translatedNames) || 0,
        translatedDescriptions: Number(officeData.translatedDescriptions) || 0,
        fullyTranslated: Number(officeData.fullyTranslated) || 0,
        completionRate: officeData.totalOffices > 0 
          ? Math.round((Number(officeData.fullyTranslated) / Number(officeData.totalOffices)) * 100)
          : 0,
      },
      templates: {
        total: Number(templateData.totalTemplates) || 0,
        translatedNames: Number(templateData.translatedNames) || 0,
        translatedDescriptions: Number(templateData.translatedDescriptions) || 0,
        fullyTranslated: Number(templateData.fullyTranslated) || 0,
        completionRate: templateData.totalTemplates > 0
          ? Math.round((Number(templateData.fullyTranslated) / Number(templateData.totalTemplates)) * 100)
          : 0,
      },
    };
  }),

  // Get translator performance scores
  getTranslatorPerformance: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const endDate = input.endDate || new Date();
      const limit = input.limit || 10;

      const results = await db.execute(sql`
        SELECT 
          translatorId,
          translatorName,
          COUNT(*) as totalTranslations,
          COUNT(DISTINCT entityId) as uniqueEntities,
          SUM(CASE WHEN actionType = 'created' THEN 1 ELSE 0 END) as newTranslations,
          SUM(CASE WHEN actionType = 'updated' THEN 1 ELSE 0 END) as updates,
          SUM(CASE WHEN source = 'manual' THEN 1 ELSE 0 END) as manualTranslations,
          SUM(CASE WHEN source = 'auto_translate' THEN 1 ELSE 0 END) as autoTranslations,
          SUM(CASE WHEN source = 'bulk_import' THEN 1 ELSE 0 END) as bulkImports,
          MIN(createdAt) as firstTranslation,
          MAX(createdAt) as lastTranslation
        FROM translation_activity_log
        WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
        GROUP BY translatorId, translatorName
        ORDER BY totalTranslations DESC
        LIMIT ${limit}
      `);

      const rows = (results as any)[0] || [];
      return (rows as any[]).map((row: any) => ({
        translatorId: Number(row.translatorId),
        translatorName: row.translatorName,
        totalTranslations: Number(row.totalTranslations),
        uniqueEntities: Number(row.uniqueEntities),
        newTranslations: Number(row.newTranslations),
        updates: Number(row.updates),
        manualTranslations: Number(row.manualTranslations),
        autoTranslations: Number(row.autoTranslations),
        bulkImports: Number(row.bulkImports),
        firstTranslation: row.firstTranslation,
        lastTranslation: row.lastTranslation,
        // Calculate performance score (weighted)
        performanceScore: Math.round(
          (Number(row.manualTranslations) * 2) + // Manual translations worth more
          (Number(row.autoTranslations) * 1) +
          (Number(row.bulkImports) * 0.5)
        ),
      }));
    }),

  // Get most-used memory phrases
  getMostUsedPhrases: adminProcedure
    .input(
      z.object({
        context: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const limit = input.limit || 20;

      let query = sql`
        SELECT 
          id,
          sourceText,
          translatedText,
          context,
          usageCount,
          lastUsedAt,
          createdAt
        FROM translation_memory
      `;

      if (input.context) {
        query = sql`${query} WHERE context = ${input.context}`;
      }

      query = sql`${query} ORDER BY usageCount DESC, lastUsedAt DESC LIMIT ${limit}`;

      const results = await db.execute(query);
      const rows = (results as any)[0] || [];

      return (rows as any[]).map((row: any) => ({
        id: Number(row.id),
        sourceText: row.sourceText,
        translatedText: row.translatedText,
        context: row.context,
        usageCount: Number(row.usageCount),
        lastUsedAt: row.lastUsedAt,
        createdAt: row.createdAt,
      }));
    }),

  // Get translation accuracy trends (based on version history - fewer changes = higher accuracy)
  getAccuracyTrends: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        groupBy: z.enum(["day", "week", "month"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();
      const groupByFormat = input.groupBy === "month" ? "%Y-%m" : 
                            input.groupBy === "week" ? "%Y-%U" : "%Y-%m-%d";

      const results = await db.execute(sql`
        SELECT 
          DATE_FORMAT(createdAt, ${groupByFormat}) as period,
          COUNT(DISTINCT entityId) as entitiesModified,
          COUNT(*) as totalChanges,
          AVG(CASE WHEN source = 'manual' THEN 1 ELSE 0 END) * 100 as manualChangePercent
        FROM translation_versions
        WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
        GROUP BY DATE_FORMAT(createdAt, ${groupByFormat})
        ORDER BY period
      `);

      const rows = (results as any)[0] || [];
      return (rows as any[]).map((row: any) => ({
        period: row.period,
        entitiesModified: Number(row.entitiesModified),
        totalChanges: Number(row.totalChanges),
        manualChangePercent: Math.round(Number(row.manualChangePercent)),
        // Accuracy score: fewer changes per entity = higher accuracy
        accuracyScore: row.entitiesModified > 0
          ? Math.max(0, 100 - Math.round((Number(row.totalChanges) / Number(row.entitiesModified)) * 10))
          : 100,
      }));
    }),

  // Get translation source distribution
  getSourceDistribution: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db.execute(sql`
      SELECT 
        source,
        COUNT(*) as count,
        COUNT(DISTINCT translatorId) as uniqueTranslators
      FROM translation_activity_log
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY source
      ORDER BY count DESC
    `);

    const rows = (results as any)[0] || [];
    return (rows as any[]).map((row: any) => ({
      source: row.source,
      count: Number(row.count),
      uniqueTranslators: Number(row.uniqueTranslators),
    }));
  }),
});
