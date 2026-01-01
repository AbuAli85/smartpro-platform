import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { batchTranslationJobs, sanadOffices, documentTemplates, translationMemory, translationReviews } from "../../drizzle/schema";
import { eq, isNull, or, and } from "drizzle-orm";
import { translateToArabic } from "../_core/machineTranslation";

interface TranslationResult {
  entityType: string;
  entityId: number;
  fieldName: string;
  status: "success" | "queued" | "failed";
  confidence?: number;
  error?: string;
}

// Calculate confidence score based on multiple factors
function calculateConfidenceScore(params: {
  translatedText: string;
  sourceText: string;
  hasMemoryMatch: boolean;
  memoryMatchScore?: number;
}): number {
  let confidence = 50; // Base confidence

  // Length similarity (max +20)
  const lengthRatio = params.translatedText.length / params.sourceText.length;
  if (lengthRatio >= 0.5 && lengthRatio <= 2.0) {
    confidence += 20;
  } else if (lengthRatio >= 0.3 && lengthRatio <= 3.0) {
    confidence += 10;
  }

  // Memory match bonus (max +30)
  if (params.hasMemoryMatch && params.memoryMatchScore) {
    confidence += params.memoryMatchScore * 30;
  }

  // Character validation (+10 if contains Arabic characters)
  const hasArabic = /[\u0600-\u06FF]/.test(params.translatedText);
  if (hasArabic) {
    confidence += 10;
  }

  return Math.min(100, Math.max(0, confidence));
}

// Find similar translations in memory
async function findMemorySuggestion(sourceText: string, context: string): Promise<{ text: string; score: number } | null> {
  const db = await getDb();
  if (!db) return null;

  const memories = await db
    .select()
    .from(translationMemory)
    .where(eq(translationMemory.context, context))
    .limit(10);

  if (memories.length === 0) return null;

  // Simple similarity scoring (could be improved with Levenshtein distance)
  let bestMatch: { text: string; score: number } | null = null;
  const sourceLower = sourceText.toLowerCase();

  for (const memory of memories) {
    const memoryLower = memory.sourceText.toLowerCase();
    
    // Exact match
    if (memoryLower === sourceLower) {
      return { text: memory.translatedText, score: 1.0 };
    }

    // Partial match scoring
    const commonWords = sourceLower.split(' ').filter(word => 
      memoryLower.includes(word) && word.length > 3
    ).length;
    const totalWords = sourceLower.split(' ').length;
    const score = commonWords / totalWords;

    if (score > 0.5 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { text: memory.translatedText, score };
    }
  }

  return bestMatch;
}

export const smartBatchProcessingRouter = router({
  // Create and start a batch translation job
  startBatchJob: adminProcedure
    .input(
      z.object({
        jobName: z.string(),
        entityType: z.enum(["office", "template", "both"]),
        targetEntityIds: z.array(z.number()).optional(),
        confidenceThreshold: z.number().min(0).max(100).default(80),
        useMemorySuggestions: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create job record
      const [result] = await db.insert(batchTranslationJobs).values({
        jobName: input.jobName,
        entityType: input.entityType,
        targetEntityIds: input.targetEntityIds as any,
        status: "pending",
        confidenceThreshold: input.confidenceThreshold,
        useMemorySuggestions: input.useMemorySuggestions ? 1 : 0,
        createdBy: ctx.user.id,
        createdByName: ctx.user.name || "Unknown",
        createdAt: new Date().toISOString(),
      });

      const jobId = (result as any).insertId;

      // Start processing asynchronously (in real production, use a queue)
      processBatchJob(jobId, input).catch(error => {
        console.error(`Batch job ${jobId} failed:`, error);
      });

      return {
        success: true,
        jobId,
      };
    }),

  // Get job status
  getJobStatus: adminProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [job] = await db
        .select()
        .from(batchTranslationJobs)
        .where(eq(batchTranslationJobs.id, input.jobId));

      if (!job) {
        throw new Error("Job not found");
      }

      return job;
    }),

  // List all batch jobs
  listJobs: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(batchTranslationJobs);

      if (input.status) {
        query = query.where(eq(batchTranslationJobs.status, input.status)) as any;
      }

      if (input.limit) {
        query = query.limit(input.limit) as any;
      }

      const jobs = await query;
      return jobs;
    }),

  // Get untranslated items count
  getUntranslatedCount: adminProcedure
    .input(
      z.object({
        entityType: z.enum(["office", "template", "both"]),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let officeCount = 0;
      let templateCount = 0;

      if (input.entityType === "office" || input.entityType === "both") {
        const offices = await db
          .select()
          .from(sanadOffices)
          .where(
            or(
              isNull(sanadOffices.officeNameAr),
              isNull(sanadOffices.descriptionAr)
            )
          );
        officeCount = offices.length;
      }

      if (input.entityType === "template" || input.entityType === "both") {
        const templates = await db
          .select()
          .from(documentTemplates)
          .where(
            or(
              isNull(documentTemplates.templateNameAr),
              isNull(documentTemplates.descriptionAr)
            )
          );
        templateCount = templates.length;
      }

      return {
        offices: officeCount,
        templates: templateCount,
        total: officeCount + templateCount,
      };
    }),
});

// Background job processor
async function processBatchJob(
  jobId: number,
  config: {
    entityType: "office" | "template" | "both";
    targetEntityIds?: number[];
    confidenceThreshold: number;
    useMemorySuggestions: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Update job status to processing
    await db
      .update(batchTranslationJobs)
      .set({
        status: "processing",
        startedAt: new Date().toISOString(),
      })
      .where(eq(batchTranslationJobs.id, jobId));

    const results: TranslationResult[] = [];
    let autoApprovedCount = 0;
    let queuedForReviewCount = 0;
    let failedCount = 0;

    // Process offices
    if (config.entityType === "office" || config.entityType === "both") {
      let officesQuery = db.select().from(sanadOffices);
      
      if (config.targetEntityIds && config.targetEntityIds.length > 0) {
        // Filter by specific IDs
        officesQuery = officesQuery.where(
          and(
            or(
              isNull(sanadOffices.officeNameAr),
              isNull(sanadOffices.descriptionAr)
            )
          )
        ) as any;
      } else {
        officesQuery = officesQuery.where(
          or(
            isNull(sanadOffices.officeNameAr),
            isNull(sanadOffices.descriptionAr)
          )
        ) as any;
      }

      const offices = await officesQuery;

      for (const office of offices) {
        // Process name
        if (!office.officeNameAr && office.officeName) {
          const result = await processTranslation({
            entityType: "office",
            entityId: office.id,
            fieldName: "nameAr",
            sourceText: office.officeName,
            context: "office_name",
            confidenceThreshold: config.confidenceThreshold,
            useMemorySuggestions: config.useMemorySuggestions,
          });
          results.push(result);
          if (result.status === "success") autoApprovedCount++;
          else if (result.status === "queued") queuedForReviewCount++;
          else failedCount++;
        }

        // Process description
        if (!office.descriptionAr && office.description) {
          const result = await processTranslation({
            entityType: "office",
            entityId: office.id,
            fieldName: "descriptionAr",
            sourceText: office.description,
            context: "office_description",
            confidenceThreshold: config.confidenceThreshold,
            useMemorySuggestions: config.useMemorySuggestions,
          });
          results.push(result);
          if (result.status === "success") autoApprovedCount++;
          else if (result.status === "queued") queuedForReviewCount++;
          else failedCount++;
        }
      }
    }

    // Process templates
    if (config.entityType === "template" || config.entityType === "both") {
      let templatesQuery = db.select().from(documentTemplates);
      
      if (config.targetEntityIds && config.targetEntityIds.length > 0) {
        templatesQuery = templatesQuery.where(
          and(
            or(
              isNull(documentTemplates.templateNameAr),
              isNull(documentTemplates.descriptionAr)
            )
          )
        ) as any;
      } else {
        templatesQuery = templatesQuery.where(
          or(
            isNull(documentTemplates.templateNameAr),
            isNull(documentTemplates.descriptionAr)
          )
        ) as any;
      }

      const templates = await templatesQuery;

      for (const template of templates) {
        // Process name
        if (!template.templateNameAr && template.templateName) {
          const result = await processTranslation({
            entityType: "template",
            entityId: template.id,
            fieldName: "nameAr",
            sourceText: template.templateName,
            context: "template_name",
            confidenceThreshold: config.confidenceThreshold,
            useMemorySuggestions: config.useMemorySuggestions,
          });
          results.push(result);
          if (result.status === "success") autoApprovedCount++;
          else if (result.status === "queued") queuedForReviewCount++;
          else failedCount++;
        }

        // Process description
        if (!template.descriptionAr && template.description) {
          const result = await processTranslation({
            entityType: "template",
            entityId: template.id,
            fieldName: "descriptionAr",
            sourceText: template.description,
            context: "template_description",
            confidenceThreshold: config.confidenceThreshold,
            useMemorySuggestions: config.useMemorySuggestions,
          });
          results.push(result);
          if (result.status === "success") autoApprovedCount++;
          else if (result.status === "queued") queuedForReviewCount++;
          else failedCount++;
        }
      }
    }

    // Update job with results
    await db
      .update(batchTranslationJobs)
      .set({
        status: "completed",
        totalItems: results.length,
        processedItems: results.length,
        autoApprovedCount,
        queuedForReviewCount,
        failedCount,
        results: results as any,
        completedAt: new Date().toISOString(),
      })
      .where(eq(batchTranslationJobs.id, jobId));

  } catch (error) {
    console.error("Batch job processing error:", error);
    await db
      .update(batchTranslationJobs)
      .set({
        status: "failed",
        completedAt: new Date().toISOString(),
      })
      .where(eq(batchTranslationJobs.id, jobId));
  }
}

async function processTranslation(params: {
  entityType: string;
  entityId: number;
  fieldName: string;
  sourceText: string;
  context: string;
  confidenceThreshold: number;
  useMemorySuggestions: boolean;
}): Promise<TranslationResult> {
  const db = await getDb();
  if (!db) {
    return {
      entityType: params.entityType,
      entityId: params.entityId,
      fieldName: params.fieldName,
      status: "failed",
      error: "Database not available",
    };
  }

  try {
    let translatedText: string;
    let hasMemoryMatch = false;
    let memoryMatchScore = 0;

    // Try memory suggestion first
    if (params.useMemorySuggestions) {
      const memorySuggestion = await findMemorySuggestion(params.sourceText, params.context);
      if (memorySuggestion && memorySuggestion.score > 0.8) {
        translatedText = memorySuggestion.text;
        hasMemoryMatch = true;
        memoryMatchScore = memorySuggestion.score;
      } else {
        // Use AI translation
        const result = await translateToArabic({ text: params.sourceText, context: params.context });
        translatedText = result.translatedText;
      }
    } else {
      // Use AI translation
      const result = await translateToArabic({ text: params.sourceText, context: params.context });
      translatedText = result.translatedText;
    }

    // Calculate confidence score
    const confidence = calculateConfidenceScore({
      translatedText,
      sourceText: params.sourceText,
      hasMemoryMatch,
      memoryMatchScore,
    });

    // Auto-approve if confidence is high enough
    if (confidence >= params.confidenceThreshold) {
      // Apply translation directly
      if (params.entityType === "office") {
        const updateData: any = {};
        if (params.fieldName === "nameAr") {
          updateData.officeNameAr = translatedText;
        } else if (params.fieldName === "descriptionAr") {
          updateData.descriptionAr = translatedText;
        }
        
        if (Object.keys(updateData).length > 0) {
          await db
            .update(sanadOffices)
            .set(updateData)
            .where(eq(sanadOffices.id, params.entityId));
        }
      } else if (params.entityType === "template") {
        const updateData: any = {};
        if (params.fieldName === "nameAr") {
          updateData.templateNameAr = translatedText;
        } else if (params.fieldName === "descriptionAr") {
          updateData.descriptionAr = translatedText;
        }
        
        if (Object.keys(updateData).length > 0) {
          await db
            .update(documentTemplates)
            .set(updateData)
            .where(eq(documentTemplates.id, params.entityId));
        }
      }

      return {
        entityType: params.entityType,
        entityId: params.entityId,
        fieldName: params.fieldName,
        status: "success",
        confidence,
      };
    } else {
      // Queue for review
      await db.insert(translationReviews).values({
        entityType: params.entityType as "office" | "template",
        entityId: params.entityId,
        fieldName: params.fieldName,
        translatedText,
        status: "pending",
        submittedBy: 1, // System user
        submittedByName: "Smart Batch Processor",
        submittedAt: new Date().toISOString(),
      });

      return {
        entityType: params.entityType,
        entityId: params.entityId,
        fieldName: params.fieldName,
        status: "queued",
        confidence,
      };
    }
  } catch (error) {
    console.error("Translation processing error:", error);
    return {
      entityType: params.entityType,
      entityId: params.entityId,
      fieldName: params.fieldName,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
