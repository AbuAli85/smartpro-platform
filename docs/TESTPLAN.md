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
- [ ] (Add flows per feature)

---

## Feature-specific scenarios

### [Feature name]

| # | Scenario | Steps | Expected | Status |
|---|----------|--------|----------|--------|
| 1 |          |        |          |        |

---

## Automated tests

- **Location:** `server/*.test.ts` (and other test folders as defined).
- **Run:** `pnpm test`
- **Coverage:** Critical paths and new procedures must have tests; QA adds or updates as needed.
