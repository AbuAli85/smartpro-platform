# Architecture (ARCH)

> **Purpose:** Single source of truth for technical design — DB, API, UI modules.  
> **Owner:** Orchestrator (initial) + Architect (DB/API refinement).

---

# Revenue Models v1 (DB + API + UI modules)

## 1) High-level design

We implement:

* **Config store**: revenue models and versioned rules
* **Rules engine**: pure functions (shared) used by server and optionally client preview
* **Admin UI**: CRUD + preview + export

## 2) Data model (Drizzle / MySQL)

### Table: `revenue_models`

Represents the logical model group (stable identity).

Columns:

* `id` (PK, uuid)
* `stream_type` (enum: `subscription | marketplace | sanad | pro`)
* `status` (enum: `draft | active | archived`)
* `currency` (string, default `OMR`)
* `created_by` (user id)
* `created_at`, `updated_at`

Indexes:

* `(stream_type, status)`
* `(created_at)`

### Table: `revenue_model_versions`

Immutable versions of a model.

Columns:

* `id` (PK, uuid)
* `model_id` (FK -> revenue_models.id)
* `version` (int, starts at 1)
* `name_en` (string)
* `name_ar` (string)
* `effective_from` (date)
* `rules_json` (json)
* `notes` (text, optional)
* `created_by`
* `created_at`

Indexes:

* `(model_id, version)` unique
* `(model_id, effective_from)`

### Optional table (v1.1): `revenue_model_exports`

Not required; export can be on-demand.

## 3) Rules JSON schema (shared)

Define a typed schema in `shared/revenue-models.ts`:

Common:

* `streamType`
* `currency`
* `passThrough` fields (gov fees) separated from platform revenue
* `rules` per stream

Examples (conceptual):

* Subscription: `{ basePrice, period, seats?: {pricePerSeat}, discounts?: [...] }`
* Marketplace: `{ commissionPct, tiered?: [{min,max,pct}] }`
* Sanad: `{ fixedFeeByTxnType: { ... }, tiered?: ... }`
* PRO: `{ pricingMode: fixed|hourly, fixedFee?, hourlyRate?, addOns?: [...] }`

## 4) API (tRPC)

Create `server/routers/revenueModels.ts` with procedures:

* `listModels({streamType?, status?})`
* `getModel({modelId})` → includes latest version
* `createModel({streamType, currency, nameEn, nameAr, effectiveFrom, rulesJson})`

  * creates `revenue_models` + version=1 in `revenue_model_versions`
* `createVersion({modelId, nameEn, nameAr, effectiveFrom, rulesJson})`

  * increments version; immutable
* `activateModel({modelId})`

  * validates rules + required fields
* `archiveModel({modelId})`
* `preview({modelVersionId, scenarioInput})`

  * returns breakdown computed by rules engine
* `exportModel({modelId})`

  * returns JSON blob (model + versions)

Security:

* All procedures require `isAdmin === true` enforced in middleware.

## 5) Rules engine placement

* `shared/revenue-engine/` (pure TS functions)
* Exposed function: `computeRevenue({rules, scenario}) => { totals, breakdown, warnings }`

Server uses engine for `preview`.
Client may optionally use it for immediate preview (but server is source of truth).

## 6) UI modules (client)

Add:

* `client/src/pages/admin/revenue-models/RevenueModelsPage.tsx`
* `client/src/components/admin/revenue-models/ModelFormWizard.tsx`
* `client/src/components/admin/revenue-models/RuleBuilder.tsx`
* `client/src/components/admin/revenue-models/PreviewPanel.tsx`
* `client/src/components/admin/revenue-models/ExportButton.tsx`

Routing:

* Add Admin nav entry: "Revenue Models / نماذج الإيرادات"
* Role guard: Admin only

i18n:

* Add translation keys: `admin.revenueModels.*`

## 7) Logging & audit

* Record `created_by` and timestamps
* For preview calls: no DB writes required
* Ensure export includes version metadata and createdBy IDs

---

## References

- `drizzle/schema.ts`
- `server/routers/*`
- `shared/*`
- [PRD.md](./PRD.md) | [TASKS.md](./TASKS.md) | [ACCEPTANCE.md](./ACCEPTANCE.md)
