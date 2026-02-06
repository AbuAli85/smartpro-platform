# Tasks (TASKS)

> **Purpose:** Checkbox tasks for implementation. One task = one PR-sized, testable change.  
> **Owner:** Orchestrator creates; Backend/Frontend/QA tick off.

---

## Work Order Header

**Feature:** Revenue Models v1 (config + rules engine, no billing)
**Users:** Admin
**Must-have:** Bilingual (EN/AR), Oman compliance (OMR default, pass-through gov fees separated)

## Definition of Done

* CRUD + versioning works for 4 stream types
* Preview returns breakdown and warnings
* Export returns JSON
* Admin-only enforcement at API level
* Verification block completed in PR (pnpm check/test/dev)

---

## Rule

Each task **must** list:

- **Files touched**
- **Commands run**
- **Expected output**

---

## PR1 — Docs only (Orchestrator)

- [ ] Fill/confirm `docs/PRD.md` scope and acceptance
- [ ] Fill/confirm `docs/ARCH.md` schema and API plan
- [ ] Update `docs/ACCEPTANCE.md` sign-off criteria

**Files:** `docs/*`
**Verify:** N/A (docs)
**Expected:** Stakeholder-approved plan

---

## PR2 — Shared types + engine skeleton (Backend scope + shared)

- [ ] Add `shared/revenue-models.ts` (rules schema types)
- [ ] Add `shared/revenue-engine/index.ts` with `computeRevenue()` skeleton
- [ ] Add unit tests for engine (tier/percent/flat computations)

**Files:** `shared/**`, `server/*.test.ts` (if tests live server-side)
**Verify:**

* `pnpm check` → pass
* `pnpm test` → pass

**Expected:** engine + types compile and test

---

## PR3 — DB schema (Backend)

- [ ] Add Drizzle tables `revenue_models`, `revenue_model_versions`
- [ ] Add indexes + constraints
- [ ] Ensure `pnpm db:push` applies cleanly

**Files:** `drizzle/**`
**Verify:**

* `pnpm check` → pass
* `pnpm db:push` → succeeds

**Expected:** tables created

**Rollback note:**

* Document drop statements or migration rollback approach (if you use migration files)

---

## PR4 — API router (Backend)

- [ ] Create `server/routers/revenueModels.ts`
- [ ] Add procedures: list/get/create/createVersion/activate/archive/preview/export
- [ ] Enforce admin middleware
- [ ] Add router wiring in main router index
- [ ] Add tests for permission gating + basic preview outputs

**Files:** `server/**`, `shared/**`
**Verify:**

* `pnpm check` → pass
* `pnpm test` → pass

**Expected:** all procedures reachable + gated

---

## PR5 — Admin UI (Frontend)

- [ ] Add admin page listing models with filters
- [ ] Add create wizard with rule builder per stream type
- [ ] Add preview panel calling `preview` endpoint
- [ ] Add export JSON download
- [ ] Add navigation entry + route guards
- [ ] Add i18n keys for EN/AR labels

**Files:** `client/src/**`, `shared/**` (types only)
**Verify:**

* `pnpm check` → pass
* `pnpm dev` → admin page loads, CRUD works

**Expected:** full admin flow functional

---

## PR6 — QA + Security gates

### QA

- [ ] Update `docs/TESTPLAN.md` with regression steps for Revenue Models
- [ ] Add at least: create/activate/version/export scenarios

### Security

- [ ] Update `docs/SECURITY.md` risk register for this module:

  * unauthorized access
  * tampering with active models
  * export data exposure
- [ ] Confirm admin check is server-side and not UI-only

**Files:** `docs/TESTPLAN.md`, `docs/SECURITY.md`, tests as needed
**Verify:**

* `pnpm test` → pass

**Expected:** release-ready gate completion

---

## Verification (all agents)

Before marking feature done:

- `pnpm check`
- `pnpm test`
- `pnpm dev` — smoke test
