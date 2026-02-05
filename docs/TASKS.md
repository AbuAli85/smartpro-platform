# Tasks (TASKS)

> **Purpose:** Checkbox tasks for implementation. One task = one PR-sized, testable change.  
> **Owner:** Orchestrator creates; Backend/Frontend/QA tick off.

---

## Rule

Each task **must** list:

- **Files touched**
- **Commands run**
- **Expected output**

---

## Feature: [Title from PRD]

### Backend

- [ ] **Task B1:**  
  - Files:  
  - Commands: `pnpm db:push` (if schema), `pnpm check`, `pnpm test`  
  - Expected:  

- [ ] **Task B2:**  
  - Files:  
  - Commands:  
  - Expected:  

### Frontend

- [ ] **Task F1:**  
  - Files:  
  - Commands: `pnpm check`, `pnpm dev` (smoke)  
  - Expected:  

- [ ] **Task F2:**  
  - Files:  
  - Commands:  
  - Expected:  

### Shared

- [ ] **Task S1:** (if types/constants added)  
  - Files: `shared/*`  
  - Commands: `pnpm check`  
  - Expected:  

### QA

- [ ] **Task Q1:**  
  - Files: `server/*.test.ts` or test folders  
  - Commands: `pnpm test`  
  - Expected:  

### Security

- [ ] **Task Sec1:** Checklist + risk register in `docs/SECURITY.md`  
  - Files: `docs/SECURITY.md`  
  - Expected: Checklist and risk register updated  

---

## Verification (all agents)

Before marking feature done:

- `pnpm check`
- `pnpm test`
- `pnpm dev` — smoke test

---

## Example: First end-to-end run — "Add a new revenue model type"

Use this as a 30–60 min run to exercise the full workflow (Orchestrator → Architect → Backend → Frontend → QA → Security).

### Backend (drizzle + server)

- [ ] **B1** Add/enum revenue model type in schema  
  - Files: `drizzle/schema.ts`  
  - Commands: `pnpm db:push`, `pnpm check`  
  - Expected: Migration applies; no type errors  

- [ ] **B2** Add tRPC procedure to read/update revenue model config  
  - Files: `server/routers/*.ts` (e.g. admin or new router)  
  - Commands: `pnpm check`, `pnpm test`  
  - Expected: Procedure callable; tests pass  

- [ ] **B3** Restrict procedure to Admin (auth context)  
  - Files: Same router  
  - Commands: `pnpm test`  
  - Expected: Non-admin cannot call  

### Shared

- [ ] **S1** Add shared type for revenue model config (if used by client)  
  - Files: `shared/types.ts` (or new file in `shared/`)  
  - Commands: `pnpm check`  
  - Expected: Client and server both type-check  

### Frontend (client)

- [ ] **F1** Admin page or section for revenue model config  
  - Files: `client/src/pages/*` or `client/src/components/*`  
  - Commands: `pnpm check`, `pnpm dev`  
  - Expected: Page loads; RTL/LTR and bilingual  

- [ ] **F2** Form/UI to select and save revenue model type  
  - Files: `client/src/components/*`  
  - Commands: `pnpm dev`  
  - Expected: Can save and see success/error  

- [ ] **F3** Translation keys for new labels  
  - Files: `client/src/**` (locales/translations)  
  - Commands: `pnpm dev`  
  - Expected: Arabic and English show correct copy  

### QA

- [ ] **Q1** Unit test for new router procedure  
  - Files: `server/*.test.ts`  
  - Commands: `pnpm test`  
  - Expected: New test passes  

- [ ] **Q2** Regression: Customer / Sanad Office cannot access admin revenue config  
  - Files: `docs/TESTPLAN.md`  
  - Commands: Manual or automated  
  - Expected: Steps in TESTPLAN.md  

### Security

- [ ] **Sec1** Auth and risk check  
  - Files: `docs/SECURITY.md`  
  - Commands: N/A  
  - Expected: Checklist and risk register updated for new admin procedure
