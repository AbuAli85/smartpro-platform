# Revenue Models v1 — PR2–PR4 exact file mapping

This doc maps PR2 (shared + engine), PR3 (DB), and PR4 (API) to your repo conventions. Use it when implementing.

---

## Repo conventions (observed)

- **IDs:** `drizzle/schema.ts` uses `int().autoincrement()` for PKs (no uuid). Use the same for `revenue_models.id` and `revenue_model_versions.id` unless you explicitly want uuid (then use `varchar(36)` + nanoid).
- **Admin gating:** Two patterns in use:
  1. **`adminProcedure`** from `server/_core/trpc.ts` — checks `ctx.user.role !== 'admin'`, no MFA.
  2. **Local adminProcedure** in `server/routers/admin.ts` — `protectedProcedure` + role check + `enforceMFAForAdmin(ctx)`. Use this for revenue models so Admin MFA is enforced.
- **Router registration:** All routers are imported and mounted in `server/routers.ts`; add `revenueModels: revenueModelsRouter` and wire `revenueModelsRouter` from `server/routers/revenueModels.ts`.

---

## PR2 — Shared types + engine skeleton

| Item | Location | Notes |
|------|----------|--------|
| Rules schema types | `shared/revenue-models.ts` (new) | Define stream enums, `RevenueRules` (subscription/marketplace/sanad/pro), `ScenarioInput`, `PreviewResult`. Use Zod if you want runtime validation. |
| Engine entry | `shared/revenue-engine/index.ts` (new) | Export `computeRevenue(rules, scenario) => { totals, breakdown, warnings }`. Implement flat/percent first; tiered optional. |
| Unit tests | `server/revenueEngine.test.ts` (new) or `shared/revenue-engine/engine.test.ts` | Test flat fee, percent, and one tiered case. Vitest. |

**Verification:** `pnpm check` → pass; `pnpm test` → pass.

---

## PR3 — DB schema (Drizzle)

**File:** `drizzle/schema.ts`

- Add enums (or use `mysqlEnum` inline):
  - `streamType`: `'subscription' | 'marketplace' | 'sanad' | 'pro'`
  - `status`: `'draft' | 'active' | 'archived'`
- Add table **`revenue_models`**:
  - `id` int PK autoincrement (or varchar(36) if you prefer uuid)
  - `stream_type` mysqlEnum
  - `status` mysqlEnum default `'draft'`
  - `currency` varchar(3) default `'OMR'`
  - `created_by` int (FK to users if you have a users table reference)
  - `created_at`, `updated_at` timestamp
  - Indexes: `(stream_type, status)`, `(created_at)`
- Add table **`revenue_model_versions`**:
  - `id` int PK autoincrement
  - `model_id` int, FK to revenue_models.id
  - `version` int not null
  - `name_en` varchar(255), `name_ar` varchar(255)
  - `effective_from` date
  - `rules_json` json
  - `notes` text optional
  - `created_by` int, `created_at` timestamp
  - Unique index `(model_id, version)`; index `(model_id, effective_from)`

**Verification:** `pnpm check` → pass; `pnpm db:push` → succeeds.

**Rollback:** If you use migration files, add a down step; otherwise document manual `DROP TABLE revenue_model_versions; DROP TABLE revenue_models;` if needed.

---

## PR4 — API router

| Item | Location | Notes |
|------|----------|--------|
| Router file | `server/routers/revenueModels.ts` (new) | Create router with procedures below. Use **same admin pattern as admin.ts**: `protectedProcedure` + `ctx.user.role !== 'admin'` + `enforceMFAForAdmin(ctx)` so MFA is required. |
| Procedures | Same file | `listModels`, `getModel`, `createModel`, `createVersion`, `activateModel`, `archiveModel`, `preview`, `exportModel`. All use the admin procedure. |
| Router wiring | `server/routers.ts` | Add `import { revenueModelsRouter } from "./routers/revenueModels";` and in `appRouter` add `revenueModels: revenueModelsRouter`. |
| Tests | `server/revenueModels.test.ts` (new) | Test: non-admin cannot call procedures (FORBIDDEN); admin can list/create; preview returns shape from engine. |

**Admin procedure snippet (copy pattern from `server/routers/admin.ts`):**

```ts
import { enforceMFAForAdmin } from "../_core/mfaEnforcement";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  enforceMFAForAdmin(ctx);
  return next({ ctx });
});
```

**Verification:** `pnpm check` → pass; `pnpm test` → pass.

---

## Summary

- **PR2:** `shared/revenue-models.ts`, `shared/revenue-engine/index.ts`, `server/revenueEngine.test.ts` (or under shared).
- **PR3:** `drizzle/schema.ts` only (tables + indexes).
- **PR4:** `server/routers/revenueModels.ts` (new), `server/routers.ts` (add import + mount), `server/revenueModels.test.ts` (new).

After PR4, the client can call `trpc.revenueModels.listModels.useQuery()`, etc., and Admin UI (PR5) can consume these procedures.
