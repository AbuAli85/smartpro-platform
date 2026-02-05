# Runbook

> **Purpose:** Commands and steps for local and CI. Agents must use only these known-good commands.  
> **Owner:** Team.

---

## Baseline commands (README / Cursor agents)

Run from **repo root** (`smartpro-platform`):

| Command | Purpose |
|---------|--------|
| `pnpm install` | Install dependencies |
| `pnpm db:push` | Generate Drizzle migrations and run them (schema → DB) |
| `pnpm dev` | Start development server (client + server); app at `http://localhost:3000` |
| `pnpm check` | TypeScript type-check (`tsc --noEmit`) |
| `pnpm test` | Run Vitest tests |

---

## Prerequisites

- Node.js 22+
- pnpm
- MySQL 8+ or TiDB
- Environment variables set (e.g. DB URL; on Manus these may be auto-configured)

---

## Verification block (use every time)

**Rule:** Every agent must state: **“I ran X, got Y output.”** Run these in your **local terminal** (not Cursor sandbox) to avoid EPERM/spawn issues.

| Step | Command | Expected |
|------|---------|----------|
| 1. Install | `pnpm install` | Dependencies installed, no errors |
| 2. Schema (if changed) | `pnpm db:push` | Migrations generated and applied |
| 3. Typecheck | `pnpm check` | `tsc --noEmit` exits 0 |
| 4. Tests | `pnpm test` | Vitest passes |
| 5. Smoke | `pnpm dev` | App at `http://localhost:3000`, key flows load |

Before marking any change done, run the steps that apply (e.g. if schema changed, run step 2; always run 3, 4, 5 for code changes).

---

## Notes

- **Windows:** The `pnpm dev` script uses `NODE_ENV=development` (Unix-style). On PowerShell use `$env:NODE_ENV="development"; pnpm dev` if needed, or run from Git Bash/WSL.
- **Cursor / sandbox:** Commands that spawn subprocesses (e.g. `pnpm db:push`, `pnpm test`, Vite/esbuild) may need to be run in a full environment (e.g. local terminal with DB configured) if you see `EPERM` or spawn errors.

## References

- [README.md](../README.md) — Quick start  
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) — Production  
- [PLATFORM_OVERVIEW.md](../PLATFORM_OVERVIEW.md) — Features  
