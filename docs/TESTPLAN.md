# Test Plan (TESTPLAN)

> **Purpose:** Regression checklist and test scenarios. Updated by QA agent.  
> **Owner:** QA.

---

## Scope

- **Personas:** Customer, Sanad Office, Admin  
- **Commands:** `pnpm test` (Vitest), `pnpm check` (type-check)

---

## Regression checklist (key flows)

### Customer

- [ ] Login / session
- [ ] Service discovery / booking
- [ ] RTL/LTR and bilingual UI
- [ ] (Add flows per feature)

### Sanad Office

- [ ] Login / session
- [ ] Request/booking management
- [ ] RTL/LTR and bilingual UI
- [ ] (Add flows per feature)

### Admin

- [ ] Login / session
- [ ] Admin dashboards and config
- [ ] Revenue Models: list, create, export (PR5)
- [ ] Revenue Models: preview and versioning (when added)
- [ ] (Add flows per feature)

---

## Feature-specific scenarios

### Revenue Models v1

| # | Scenario | Steps | Expected | Status |
|---|----------|--------|----------|--------|
| 1 | Admin creates draft revenue model | 1. Navigate to `/admin/revenue-models`<br>2. Click "New Revenue Model"<br>3. Fill basic info (stream type, name EN/AR, effective date)<br>4. Configure rules (per stream type)<br>5. Submit | Model created as draft; redirects to list; model appears in list | |
| 2 | Admin filters revenue models | 1. Open `/admin/revenue-models`<br>2. Select stream type filter (e.g., "Marketplace")<br>3. Select status filter (e.g., "Draft") | List updates to show only matching models | |
| 3 | Admin exports revenue model | 1. Open `/admin/revenue-models`<br>2. Click Export on a model row | JSON file downloads with filename `revenue-model-{id}.json`; file contains model + versions | |
| 4 | Admin cannot access revenue models (non-admin) | 1. Log in as Customer or Sanad Office<br>2. Navigate to `/admin/revenue-models` | Redirected or shown unauthorized (ProtectedRoute guard) | |
| 5 | Revenue model versioning (immutability) | 1. Create model (version 1)<br>2. Create new version via API<br>3. Verify old version remains unchanged | Version 1 is read-only; new version has incremented version number | |
| 6 | Bilingual and RTL support | 1. Switch language to Arabic<br>2. Open `/admin/revenue-models`<br>3. Create model with Arabic name | UI shows `dir="rtl"`; Arabic labels render correctly; model name shows Arabic in list | |

### [Feature name]

| # | Scenario | Steps | Expected | Status |
|---|----------|--------|----------|--------|
| 1 |          |        |          |        |

---

## Automated tests

- **Location:** `server/*.test.ts` (and other test folders as defined).
- **Run:** `pnpm test`
- **Coverage:** Critical paths and new procedures must have tests; QA adds or updates as needed.
