# Product Requirements Document (PRD)

> **Purpose:** Single source of truth for feature scope, user flows, roles, and edge cases.  
> **Owner:** Orchestrator / Product. Update before coding starts.

---

# Revenue Models v1 (Config + Rules Engine)

## 1) Objective

Deliver an **Admin-only** module to configure SmartPRO revenue streams and compute revenue breakdowns using a deterministic rules engine. This version is **configuration + calculation only** (no payment capture, no invoices, no Stripe).

## 2) Personas & Roles

* **Admin** (primary): create/edit revenue models, activate/deactivate, preview calculations.
* **Finance Admin** (optional later): view reports/exports; same permissions as Admin for v1.

## 3) Revenue Streams (v1 scope)

Admin can create one or more revenue models per stream:

1. **Subscription**: monthly/annual plan price, seat-based add-ons, discounts.
2. **Marketplace Commission**: percentage commission per service category/provider tier.
3. **Sanad Office Fees**: fixed fees per transaction type + optional tiered fees.
4. **PRO Services**: fixed fee / hourly fee + add-ons (gov fees pass-through excluded in v1).

## 4) User Stories

### US-01: Create revenue model

As an Admin, I can create a revenue model with:

* Stream type (Subscription / Marketplace / Sanad / PRO)
* Name (EN/AR)
* Effective start date
* Currency (OMR default)
* Rules (structured, versioned)
* Status: Draft → Active → Archived

### US-02: Edit revenue model (versioning)

As an Admin, I can edit an existing revenue model by creating a **new version** (immutability for audit).

* Previous versions remain read-only.

### US-03: Preview calculation (scenario input)

As an Admin, I can input a scenario (e.g., 200 subscribers, 10,000 OMR GMV) and see:

* Revenue by stream
* Platform share vs provider share (where applicable)
* Notes/warnings if inputs are missing

### US-04: Export config (basic)

As an Admin, I can export a model configuration as JSON (download) for investor reporting and auditing.

## 5) Out of Scope (explicit)

* Payments (Stripe), invoices, receipts
* Automated billing cycles
* Provider payouts
* Multi-tenant customer-level pricing
* Integration to real transactions tables (we use scenario inputs for v1)

## 6) Functional Requirements

### Admin UI

* List models with filters: stream type, status, effective date
* Create/Edit in wizard form:

  * Step 1: Basic info (name EN/AR, stream, currency)
  * Step 2: Rule builder (structured fields, not free text)
  * Step 3: Preview scenario + computed outputs
  * Step 4: Activate (requires validation)

### Rules Engine

* Deterministic calculations from:

  * Model rules
  * Scenario inputs
* Supports:

  * flat fees
  * percent fees
  * tiered brackets (optional in v1—must be designed but can ship minimal tiers)

### Bilingual

* EN/AR for model name and key UI labels
* No translation required for rule JSON; only UI and display labels.

### Oman compliance notes (v1)

* Must support **OMR** as default currency
* Must separate:

  * "Platform fee/commission"
  * "Government fees pass-through" (marked as pass-through, excluded from revenue)

## 7) Non-Functional Requirements

* Auditability: immutable versions + createdBy + timestamps
* Security: Admin-only access (server-side enforced)
* Performance: compute preview under 200ms for typical inputs

## 8) Acceptance Criteria

* Admin can create Draft model, preview calculations, then activate
* Editing an active model creates a new version; old version stays read-only
* Preview produces correct totals and breakdowns for 4 stream types
* Export works and includes metadata + rules + version
* All endpoints reject non-admin users

---

## References

- [ARCH.md](./ARCH.md) — technical design  
- [TASKS.md](./TASKS.md) — implementation tasks  
- [ACCEPTANCE.md](./ACCEPTANCE.md) — done criteria  
