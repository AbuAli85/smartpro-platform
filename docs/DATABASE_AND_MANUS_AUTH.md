# Database and Manus Auth

How the SmartPro database is built and how user data from Manus OAuth gets into your database.

---

## 1. Build / set up the database

The app uses **your own database** (e.g. Railway MySQL). Manus does **not** host your app’s DB. You create the schema and run migrations locally or on your host.

### One-time setup

1. **Set `DATABASE_URL`** (e.g. in a root `.env`):
   ```bash
   DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
   ```
   For Railway, use the MySQL connection URL from your Railway project variables.

2. **Run migrations** from the repo root:
   ```bash
   cd C:\Users\HP\Documents\GitHub\smartpro-platform
   pnpm run db:push
   ```
   Or only apply existing migrations (no new generation):
   ```bash
   pnpm exec drizzle-kit migrate
   ```

This creates/updates all tables, including:

- `users` – app users (synced from Manus on login)
- `auth_audit_log` – auth events
- `active_sessions` – session tracking
- Plus all other app tables (offices, bookings, etc.)

### Optional: seed demo data

```bash
pnpm run seed:demo
```

---

## 2. How user data gets from Manus into your database

There is **no bulk “pull users from Manus”** in this repo. User records are created/updated **only when someone signs in** (and when the session is refreshed and the user is missing).

Flow:

1. User clicks **Sign In** → goes to Manus OAuth portal.
2. After login, Manus redirects to your API: `/api/oauth/callback?code=...&state=...`.
3. Your server (`server/_core/oauth.ts`):
   - Exchanges the code for an access token.
   - Calls Manus to get user info (`openId`, name, email, login method).
   - **Upserts** that user into your `users` table via `db.upsertUser(...)`.
4. Session is stored in an HTTP-only cookie; later requests are authenticated and may trigger `db.upsertUser` again if the user row was missing (e.g. after a DB reset).

So:

- **Database** = yours (Railway MySQL or other). You **build** it with `pnpm run db:push` (or `drizzle-kit migrate`).
- **Auth** = Manus OAuth. **User rows** are created/updated automatically on **login** (and when refreshing a session if the user is missing). There is no separate script to “pull all users from Manus.”

---

## 3. Checklist for a new environment

| Step | Action |
|------|--------|
| 1 | Set `DATABASE_URL` in `.env` (or in Railway/env). |
| 2 | From repo root, run `pnpm run db:push` (or `pnpm exec drizzle-kit migrate`). |
| 3 | Configure Manus: redirect URI = `https://YOUR_API_URL/api/oauth/callback`. |
| 4 | Set `OAUTH_SERVER_URL`, `VITE_APP_ID`, `JWT_SECRET` (and frontend `VITE_API_URL`, etc.) per `docs/SPLIT_HOSTING.md`. |
| 5 | Have users sign in; they will appear in your `users` table automatically. |

---

## 4. If you need a bulk user sync from Manus

The current code only syncs users **on login**. If Manus provides an API to **list users** for your app, you could add a one-off script that:

1. Calls that Manus API (you’d need the endpoint and auth from Manus docs/support).
2. For each user, calls `db.upsertUser({ openId, name, email, loginMethod, lastSignedIn })`.

That would be new code; it doesn’t exist in the repo today.
