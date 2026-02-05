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

---

## Risk register

| ID   | Risk | Impact | Mitigation | Owner |
|------|------|--------|------------|-------|
| SEC-1 |      |        |            |       |

---

## References

- Manus OAuth + session management  
- `server/_core/rateLimiter.ts`  
- Audit logging usage in `server/routers/*`  
