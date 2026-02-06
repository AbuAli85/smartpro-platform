import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { enforceMFAForAdmin } from "../_core/mfaEnforcement";
import { getDb } from "../db";
import { revenueModels, revenueModelVersions } from "../../drizzle/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { computeRevenue } from "../../shared/revenue-engine";
import type { RevenueRules, ScenarioInput } from "../../shared/revenue-models";

/**
 * Single normalization point for revenue model rules from the DB.
 * Drivers may return JSON columns as parsed object or as string; this helper accepts unknown
 * and returns RevenueRules so we never duplicate parse logic or allow string-as-object bugs.
 */
function parseRulesJson(raw: unknown): RevenueRules {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as RevenueRules;
    } catch {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid rules JSON in this version",
      });
    }
  }
  if (raw && typeof raw === "object") {
    return raw as RevenueRules;
  }
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Missing or invalid rules for this version",
  });
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  enforceMFAForAdmin(ctx);
  return next({ ctx });
});

const streamTypeSchema = z.enum(["subscription", "marketplace", "sanad", "pro"]);
const statusSchema = z.enum(["draft", "active", "archived"]);
/** API contract: date-only YYYY-MM-DD for MySQL date column compatibility */
const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

export const revenueModelsRouter = router({
  listModels: adminProcedure
    .input(
      z
        .object({
          streamType: streamTypeSchema.optional(),
          status: statusSchema.optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const conds: ReturnType<typeof eq>[] = [];
      if (input?.streamType) conds.push(eq(revenueModels.streamType, input.streamType));
      if (input?.status) conds.push(eq(revenueModels.status, input.status));
      const whereClause = conds.length ? and(...conds) : undefined;

      const rows = await db
        .select()
        .from(revenueModels)
        .where(whereClause)
        .orderBy(desc(revenueModels.createdAt));
      const modelIds = rows.map((r) => r.id);
      if (modelIds.length === 0) return { models: rows, versionsByModel: {} };

      const versions = await db
        .select()
        .from(revenueModelVersions)
        .where(inArray(revenueModelVersions.modelId, modelIds))
        .orderBy(desc(revenueModelVersions.version));

      const versionsByModel: Record<number, typeof versions> = {};
      for (const v of versions) {
        if (!versionsByModel[v.modelId]) versionsByModel[v.modelId] = [];
        versionsByModel[v.modelId].push(v);
      }
      return { models: rows, versionsByModel };
    }),

  getModel: adminProcedure
    .input(z.object({ modelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [model] = await db.select().from(revenueModels).where(eq(revenueModels.id, input.modelId));
      if (!model) throw new TRPCError({ code: "NOT_FOUND", message: "Revenue model not found" });

      const versions = await db
        .select()
        .from(revenueModelVersions)
        .where(eq(revenueModelVersions.modelId, input.modelId))
        .orderBy(desc(revenueModelVersions.version));
      return { model, versions };
    }),

  createModel: adminProcedure
    .input(
      z.object({
        streamType: streamTypeSchema,
        currency: z.string().length(3).default("OMR"),
        nameEn: z.string().min(1),
        nameAr: z.string().min(1),
        effectiveFrom: dateOnlySchema,
        rulesJson: z.record(z.unknown()),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const result = await db.insert(revenueModels).values({
        streamType: input.streamType,
        status: "draft",
        currency: input.currency,
        createdByUserId: ctx.user!.id,
      });
      // MySQL/driver may return ResultSetHeader or [ResultSetHeader]; support both
      const header = Array.isArray(result) ? result[0] : result;
      const modelId = Number((header as { insertId?: number })?.insertId ?? 0);
      if (!modelId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Insert failed" });

      await db.insert(revenueModelVersions).values({
        modelId: Number(modelId),
        version: 1,
        nameEn: input.nameEn,
        nameAr: input.nameAr,
        effectiveFrom: input.effectiveFrom,
        rulesJson: input.rulesJson as unknown as Record<string, unknown>,
        notes: input.notes ?? null,
        createdByUserId: ctx.user!.id,
      });

      return { modelId: Number(modelId), version: 1 };
    }),

  createVersion: adminProcedure
    .input(
      z.object({
        modelId: z.number(),
        nameEn: z.string().min(1),
        nameAr: z.string().min(1),
        effectiveFrom: dateOnlySchema,
        rulesJson: z.record(z.unknown()),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const versions = await db
        .select({ version: revenueModelVersions.version })
        .from(revenueModelVersions)
        .where(eq(revenueModelVersions.modelId, input.modelId))
        .orderBy(desc(revenueModelVersions.version))
        .limit(1);
      const nextVersion = versions[0] ? versions[0].version + 1 : 1;

      await db.insert(revenueModelVersions).values({
        modelId: input.modelId,
        version: nextVersion,
        nameEn: input.nameEn,
        nameAr: input.nameAr,
        effectiveFrom: input.effectiveFrom,
        rulesJson: input.rulesJson as unknown as Record<string, unknown>,
        notes: input.notes ?? null,
        createdByUserId: ctx.user!.id,
      });
      return { modelId: input.modelId, version: nextVersion };
    }),

  activateModel: adminProcedure
    .input(z.object({ modelId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [model] = await db.select().from(revenueModels).where(eq(revenueModels.id, input.modelId));
      if (!model) throw new TRPCError({ code: "NOT_FOUND", message: "Revenue model not found" });
      if (model.status !== "draft") throw new TRPCError({ code: "BAD_REQUEST", message: "Only draft models can be activated" });

      const [latest] = await db
        .select()
        .from(revenueModelVersions)
        .where(eq(revenueModelVersions.modelId, input.modelId))
        .orderBy(desc(revenueModelVersions.version))
        .limit(1);
      if (!latest) throw new TRPCError({ code: "BAD_REQUEST", message: "No version found" });

      await db.update(revenueModels).set({ status: "active" }).where(eq(revenueModels.id, input.modelId));
      return { success: true };
    }),

  archiveModel: adminProcedure
    .input(z.object({ modelId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [model] = await db.select().from(revenueModels).where(eq(revenueModels.id, input.modelId));
      if (!model) throw new TRPCError({ code: "NOT_FOUND", message: "Revenue model not found" });

      await db.update(revenueModels).set({ status: "archived" }).where(eq(revenueModels.id, input.modelId));
      return { success: true };
    }),

  preview: adminProcedure
    .input(
      z.object({
        modelVersionId: z.number(),
        scenarioInput: z.record(z.unknown()) as z.ZodType<ScenarioInput>,
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [version] = await db
        .select()
        .from(revenueModelVersions)
        .where(eq(revenueModelVersions.id, input.modelVersionId));
      if (!version) throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });

      const raw: unknown = version.rulesJson;
      const rules = parseRulesJson(raw);
      const scenario = input.scenarioInput;
      return computeRevenue({ rules, scenario });
    }),

  exportModel: adminProcedure
    .input(z.object({ modelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [model] = await db.select().from(revenueModels).where(eq(revenueModels.id, input.modelId));
      if (!model) throw new TRPCError({ code: "NOT_FOUND", message: "Revenue model not found" });

      const versions = await db
        .select()
        .from(revenueModelVersions)
        .where(eq(revenueModelVersions.modelId, input.modelId))
        .orderBy(revenueModelVersions.version);
      return { model, versions };
    }),
});
