# Security Checklist & Risk Register

> **Purpose:** Auth, rate limiting, audit, and risk tracking. Updated by Security agent.  
> **Owner:** Security.

---

## Checklist (per feature / release)

- [ ] **Auth boundaries** — Customer vs Sanad Office vs Admin; each tRPC procedure has correct context checks
- [ ] **Rate limiting** — Sensitive and public endpoints covered (`server/_core/rateLimiter.ts`)
- [ ] **Audit logging** — Sensitive actions (e.g. financial, PII, config) logged
- [ ] **Secrets** — No secrets or sensitive config in client bundle or logs
- [ ] **Data exposure** — tRPC routers do not expose PII or financial data beyond intended scope

### Revenue Models v1 (PR2–PR5)

- [x] **Auth boundaries** — All `revenueModels.*` procedures use `adminProcedure` (protectedProcedure + role check + MFA enforcement)
- [x] **Rate limiting** — Revenue model endpoints are rate-limited by global `apiLimiter` (500 req/15min per IP) applied to all `/api/*` routes including `/api/trpc/*`. See [PR7_RATE_LIMITING.md](./PR7_RATE_LIMITING.md) for optional stricter admin limits.
- [x] **Audit logging** — Model creation/versioning records `createdByUserId` and timestamps; export/activate/archive actions logged to `activity_log` (PR8)
- [x] **Secrets** — `rulesJson` stored in DB; no secrets in client bundle
- [x] **Data exposure** — Export returns model + versions (admin-only); preview requires admin; no PII exposure
- [x] **Version immutability** — Versions are immutable (new version creates new row, old versions remain read-only)
- [x] **Input validation** — `effectiveFrom` validated as YYYY-MM-DD; `rulesJson` parsed safely with error handling

---

## Risk register

| ID   | Risk | Impact | Mitigation | Owner |
|------|------|--------|------------|-------|
| SEC-1 | Unauthorized access to revenue model config | High | All procedures gated by `adminProcedure` (role + MFA); ProtectedRoute on UI routes | Backend + Frontend |
| SEC-2 | Export exposes sensitive revenue rules | Low | Export is admin-only; JSON contains model config only (no PII); export actions logged to activity_log (PR8) | Backend |
| SEC-3 | Tampering with active revenue models | High | Version immutability enforced (new version creates new row); activate requires validation; archived models cannot be reactivated without new version | Backend |
| SEC-4 | Malformed rulesJson causing preview errors | Low | `parseRulesJson` helper validates and throws BAD_REQUEST; preview errors are caught and returned as warnings | Backend |
| SEC-5 | Rate limiting bypass on admin endpoints | Low | Admin endpoints are covered by global `apiLimiter` (500 req/15min). Optional stricter limits documented in PR7_RATE_LIMITING.md | Backend |

---

## References

- Manus OAuth + session management  
- `server/_core/rateLimiter.ts`  
- Audit logging usage in `server/routers/*`  
