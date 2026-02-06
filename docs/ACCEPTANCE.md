# Acceptance Criteria (ACCEPTANCE)

> **Purpose:** Objective "done" criteria for the feature. Used by QA and Product.  
> **Owner:** Orchestrator / Product.

---

# Revenue Models v1 (Addendum)

## Feature Acceptance Checklist

- [ ] Admin-only access enforced on server for all procedures
- [ ] Draft → Active → Archived states work
- [ ] Versioning is immutable; edits create a new version
- [ ] Preview outputs totals and breakdown per stream type
- [ ] Pass-through fees are explicitly excluded from revenue totals
- [ ] Export returns JSON including versions, rules, and metadata
- [ ] EN/AR names show correctly; UI labels translated

## Sign-off

| Role          | Name | Date | Status |
| ------------- | ---- | ---- | ------ |
| Product/Owner |      |      |        |
| Tech Lead     |      |      |        |
| QA            |      |      |        |
| Security      |      |      |        |

---

## General verification

- [ ] `pnpm check` passes
- [ ] `pnpm test` passes
- [ ] `pnpm dev` — key flows work for Admin (as per PRD)
- [ ] No regression on critical paths (see [TESTPLAN.md](./TESTPLAN.md))
- [ ] Security checklist and risk register updated (see [SECURITY.md](./SECURITY.md))
