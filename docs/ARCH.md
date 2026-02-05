# Architecture (ARCH)

> **Purpose:** Single source of truth for technical design — DB, API, UI modules.  
> **Owner:** Orchestrator (initial) + Architect (DB/API refinement).

---

## Feature / initiative

**Title:**  
**Stack:** React + TS (`client/`), Node/Express + tRPC (`server/`), Drizzle (`drizzle/`), shared types (`shared/`). MySQL/TiDB.

---

## High-level components

| Layer    | Components / modules |
|----------|------------------------|
| UI       | (e.g. pages, components) |
| API      | (e.g. tRPC routers, procedures) |
| DB       | (e.g. tables, indexes) |
| Shared   | (e.g. types, constants) |

---

## Database (DB/API section — Architect maintains)

### Tables

| Table        | Purpose | Key columns / indexes |
|-------------|---------|------------------------|
|             |         |                        |

### Migrations

- Changes applied via `drizzle/schema.ts` and `pnpm db:push`.

---

## API (tRPC)

### Routers / procedures

| Router            | Procedure | Auth | Purpose |
|-------------------|-----------|------|---------|
|                   |           |      |         |

### New or changed types in `shared/`

- 

---

## UI modules

| Area       | Pages / components |
|------------|--------------------|
|            |                    |

---

## References

- `drizzle/schema.ts`
- `server/routers/*`
- `shared/*`
- [PRD.md](./PRD.md) | [TASKS.md](./TASKS.md) | [ACCEPTANCE.md](./ACCEPTANCE.md)
