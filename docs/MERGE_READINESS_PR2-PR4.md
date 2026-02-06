# PR2–PR4 merge readiness checklist

Use this before opening or merging PR2, PR3, and PR4. Run the **Final pre-flight checks** then the **Exact local verification sequence**.

---

## 0) Final pre-flight checks (~3 min)

- [ ] **listModels filter:** Build `conds: ReturnType<typeof eq>[] = []`, push only when filter exists, `where(conds.length ? and(...conds) : undefined)`. No `and(undefined, …)`.
- [ ] **rulesJson at boundary:** In preview, read from DB as `unknown`; normalize via `parseRulesJson(raw)`, then cast to `RevenueRules` only inside the helper. Prevents string-masquerading-as-object bugs.
- [ ] **effectiveFrom:** API uses **YYYY-MM-DD** only: `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` for createModel and createVersion. Matches MySQL `date()` column.
- [ ] **createdByUserId:** Schema and session use **int** (matches `users.id`). No string OAuth subject in this table.

---

## 1) PR2–PR4 merge readiness checklist

### PR2 (shared engine + tests)

- [ ] `shared/revenue-models.ts` exports only **serializable** types (no Date objects in runtime payloads).
- [ ] `computeRevenue()` is **pure**: no DB, no env, no i18n calls.
- [ ] Engine output always includes:
  - `totals.platformRevenueOMR`
  - `totals.passThroughOMR`
  - `totals.grossOMR`
  - `breakdown[]`
  - `warnings[]`
- [ ] Sanad pass-through is counted only in `passThroughOMR`, not added to platform revenue.

### PR3 (schema)

- [ ] `revenue_models.createdByUserId` matches your existing user id type (int).
- [ ] `rulesJson` column type matches your DB (MySQL 5.7+/8 or TiDB JSON compatibility).
- [ ] `uniqueIndex(modelId, version)` is correctly declared and imported in `drizzle/schema.ts`.
- [ ] `effectiveFrom` uses Drizzle MySQL `date()` type; inputs use string `YYYY-MM-DD` or ISO date.

### PR4 (router + wiring)

- [ ] Admin guard is enforced in every procedure:
  - `protectedProcedure`
  - role check (`ctx.user?.role !== "admin"`)
  - `enforceMFAForAdmin(ctx)` for admin routes
- [ ] `createModel` uses insert result **insertId** (supports both array and single-object driver return shape); no `.returning()`.
- [ ] `listModels` uses `conds` array and `where(conds.length ? and(...conds) : undefined)`.
- [ ] `preview` reads `rulesJson` as `unknown` and uses `parseRulesJson(raw)` helper; throws `BAD_REQUEST` if malformed.

---

## 2) Exact local verification sequence

Run from repo root (Windows PowerShell):

```powershell
pnpm install
pnpm check
pnpm test
pnpm db:push
pnpm test
pnpm dev
```

**Expected:**

- `pnpm check` — TypeScript passes (no errors).
- `pnpm test` — All tests pass, including:
  - `server/revenueEngine.test.ts`
  - `server/revenueModels.test.ts`
- `pnpm db:push` — Schema applies successfully (run against local/dev DB first if destructive).
- `pnpm dev` — App starts; smoke-check admin/revenue flows if UI exists.

---

## 3) High-risk implementation points (already addressed)

| Risk | Mitigation in repo |
|------|--------------------|
| **Drizzle insert return shape** | `createModel` uses `const header = Array.isArray(result) ? result[0] : result` and `(header as { insertId?: number })?.insertId`. No `.returning()` used. |
| **JSON column runtime type** | `preview` normalizes `rulesJson`: if `typeof raw === "string"` → `JSON.parse(raw)` with try/catch; else if object → use as-is; else throw `BAD_REQUEST`. |
| **Date handling (`effectiveFrom`)** | Schema uses `date("effective_from")`. Router accepts `z.string()` (YYYY-MM-DD or ISO). UI should send same format. |
| **`and()` filters** | `listModels` builds `conditions[]`, then `where(conditions.length > 0 ? and(...conditions) : undefined)`. No `and(undefined, …)`. |
| **Test DB availability** | `revenueModels.test.ts` admin test accepts either success `{ models, versionsByModel }` or `INTERNAL_SERVER_ERROR` when DB is unavailable. |

---

## 4) Recommended PR split

- **PR2:** `shared/revenue-models.ts`, `shared/revenue-engine/index.ts`, `server/revenueEngine.test.ts`
- **PR3:** `drizzle/schema.ts` (revenue_models + revenue_model_versions only)
- **PR4:** `server/routers/revenueModels.ts`, `server/routers.ts`, `server/revenueModels.test.ts`

Keeps reviews and rollbacks scoped.

---

## 5) Commit plan (clean history for 3 PRs)

If you have **uncommitted** PR2–PR4 changes and want one branch with three logical commits (or to create three branches from them):

```powershell
# From repo root, branch (if not already)
git checkout -b feat/revenue-models-v1

# --- Commit 1 (PR2) ---
git add shared/revenue-models.ts shared/revenue-engine/index.ts server/revenueEngine.test.ts
git commit -m "feat: add revenue model types + revenue engine"

# --- Commit 2 (PR3) ---
git add drizzle/schema.ts
git commit -m "feat: add revenue_models tables"

# --- Commit 3 (PR4) ---
git add server/routers/revenueModels.ts server/routers.ts server/revenueModels.test.ts docs/MERGE_READINESS_PR2-PR4.md
git commit -m "feat: add revenue models admin router"
```

To open **separate PRs** from the same work: after the three commits, create branches from the first and second commit for PR2 and PR3, then PR4 from the third (or use GitHub’s “PR from branch” and only include the relevant files per PR).

---

## 6) If a local run fails

Paste:

- The **command** that failed (`pnpm check` / `pnpm test` / `pnpm db:push` / `pnpm dev`).
- The **output** (error message and stack).
- **File + line** referenced in the error.

Common fixes:

- **Insert result typing** — use the `header` pattern above.
- **JSON parsing** — use the `preview` normalization (string vs object).
- **Drizzle date typing** — keep `effectiveFrom` as string input and `date()` column.
- **Router wiring** — ensure `revenueModels: revenueModelsRouter` is in `appRouter` and import path is correct.
