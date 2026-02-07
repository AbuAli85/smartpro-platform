# Split Hosting: Vercel (Frontend) + Railway / Manus (Backend)

When the **frontend** is hosted on **Vercel** (or another static host) and the **API** is on **Railway** (or Manus), you need to configure both sides so login and API calls work.

---

## Overview

| Before (Manus only) | Now (Split) |
|---------------------|-------------|
| One host serves frontend + API | Frontend: Vercel (e.g. `https://sanad.thesmartpro.io`) |
| Same origin for `/api/trpc` and `/api/oauth/callback` | API: Railway (e.g. `https://smartpro-platform-production.up.railway.app`) |

The browser loads the app from Vercel but must call the API on Railway and complete OAuth with the callback on Railway.

---

## 1. Frontend (Vercel) – Environment Variables

Set these in **Vercel** → Project → Settings → Environment Variables (for Production / Preview as needed):

| Variable | Example | Required |
|----------|---------|----------|
| `VITE_API_URL` | `https://smartpro-platform-production.up.railway.app` | **Yes** – so tRPC and OAuth redirect go to the API |
| `VITE_OAUTH_PORTAL_URL` | `https://app.manus.im` (or your Manus portal URL) | **Yes** – for Sign In button |
| `VITE_APP_ID` | Your Manus OAuth application ID | **Yes** – for Sign In |

- No trailing slash in `VITE_API_URL`.
- Rebuild and redeploy the frontend after changing these (Vite bakes them in at build time).

---

## 2. Backend (Railway) – Environment Variables

Set these on **Railway** (or your API host):

| Variable | Example | Required |
|----------|---------|----------|
| `FRONTEND_URL` | `https://sanad.thesmartpro.io` | **Yes** for split hosting – where to send the user after login (and after OAuth errors) |
| `CORS_ORIGIN` | `https://sanad.thesmartpro.io` (or comma-separated list) | **Yes** – must include the Vercel frontend origin so the browser allows API requests with credentials |
| `VITE_OAUTH_PORTAL_URL` | Same as frontend (used in emails/links) | Optional |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL | Yes (for token exchange) |
| `VITE_APP_ID` | Same as frontend | Yes (for OAuth) |
| `JWT_SECRET` | Session signing secret | Yes |
| `DATABASE_URL` | Your DB connection string | Yes |

- **CORS**: If you use a custom domain for the frontend, add that exact origin to `CORS_ORIGIN` (e.g. `https://sanad.thesmartpro.io`). Defaults in code may already include it; if not, set it explicitly.
- **FRONTEND_URL**: After a successful OAuth login (or an error), the API redirects the user to this URL so they land back on the Vercel app.

---

## 3. OAuth / Login Flow (Split Hosting)

1. User is on **Vercel** (e.g. `https://sanad.thesmartpro.io`).
2. User clicks **Sign In** → app builds login URL with `redirect_uri = VITE_API_URL + "/api/oauth/callback"` (e.g. Railway URL).
3. User is sent to **Manus** (or your OAuth portal); after login, Manus redirects to **Railway** `/api/oauth/callback?...`.
4. **Railway** exchanges the code, creates a session cookie (for the Railway domain), and redirects the browser to **FRONTEND_URL** (Vercel).
5. User is back on **Vercel**; the app calls `auth.me` and other APIs on **Railway** with `credentials: 'include'`, so the session cookie is sent and login works.

---

## 4. Manus Settings (if using Manus OAuth)

- In the Manus app/config for this project, set the OAuth **redirect URI** to your **API** callback URL, e.g.  
  `https://smartpro-platform-production.up.railway.app/api/oauth/callback`  
  (not the Vercel URL).
- Use the same `VITE_APP_ID` (and portal URL) on both frontend and backend.

---

## 5. Quick Checklist

**Vercel (frontend)**  
- [ ] `VITE_API_URL` = full API base URL (no trailing slash)  
- [ ] `VITE_OAUTH_PORTAL_URL` = Manus portal URL  
- [ ] `VITE_APP_ID` = Manus app ID  
- [ ] Rebuild/redeploy after changing env

**Railway (API)**  
- [ ] `FRONTEND_URL` = full frontend URL (no trailing slash)  
- [ ] `CORS_ORIGIN` includes frontend origin (e.g. `https://sanad.thesmartpro.io`)  
- [ ] OAuth and DB env vars set (e.g. `OAUTH_SERVER_URL`, `VITE_APP_ID`, `JWT_SECRET`, `DATABASE_URL`)

**Manus (if used)**  
- [ ] Redirect URI = `https://<your-api-host>/api/oauth/callback`

---

## 6. Troubleshooting

- **“Sign-in not configured”**  
  Frontend env: set `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` and redeploy.

- **CORS / “blocked by CORS”**  
  Backend: add the exact frontend origin (e.g. `https://sanad.thesmartpro.io`) to `CORS_ORIGIN`.

- **Login redirects to wrong place / blank**  
  Backend: set `FRONTEND_URL` to the exact frontend URL (e.g. `https://sanad.thesmartpro.io`).

- **Session lost after login**  
  API must set the session cookie with `SameSite=None; Secure` when frontend and API are on different domains; the app’s cookie options should already support this for cross-origin.

For more env details, see [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) and [client/.env.example](../client/.env.example).
