# PR7 — Rate Limiting for Revenue Models (optional)

> **Status:** Optional enhancement. Revenue models endpoints are already rate-limited by global `apiLimiter` (500 req/15min). This PR adds stricter admin-specific limits if desired.

---

## Current state

- **Global rate limiting:** `app.use("/api", apiLimiter)` in `server/_core/index.ts` applies to all `/api/*` routes, including `/api/trpc/*` (where revenue models live).
- **Current limit:** 500 requests per 15 minutes per IP (via `apiLimiter`).
- **Coverage:** All `revenueModels.*` procedures are already rate-limited.

---

## Option A: Document existing coverage (recommended)

If the global `apiLimiter` is sufficient for admin endpoints:

1. Update `docs/SECURITY.md`:
   - Mark rate limiting as ✅ (covered by global `apiLimiter`).
   - Note: Admin endpoints share the same 500 req/15min limit as public endpoints.

**No code changes needed.**

---

## Option B: Add stricter admin rate limiter (if extra protection desired)

If you want stricter limits for admin actions:

### 1) Add admin limiter in `server/_core/rateLimiter.ts`

```typescript
// Admin actions rate limiter - 100 requests per 15 minutes
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 admin actions per windowMs
  message: "Too many admin actions, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many admin actions",
      message: "You have exceeded the admin action limit. Please try again later.",
      retryAfter: Math.ceil((req as any).rateLimit?.resetTime ? ((req as any).rateLimit.resetTime - Date.now()) / 1000 : 900),
    });
  },
});
```

### 2) Apply to admin routes in `server/_core/index.ts`

Since tRPC routes are all under `/api/trpc`, you'd need to apply the limiter at the procedure level OR create a separate Express route group. **This is more complex** and may not be worth it if global limiting is sufficient.

**Recommendation:** Use Option A (document existing coverage) unless you have a specific abuse concern.

---

## Decision

- **If global `apiLimiter` is sufficient:** Use Option A (update SECURITY.md only).
- **If stricter limits needed:** Implement Option B (add `adminLimiter` and wire it appropriately).

---

## Verification

- **Option A:** Update `docs/SECURITY.md` checklist.
- **Option B:** Test rate limiting by making >100 requests in 15 minutes to a revenue model endpoint; expect 429 response.
