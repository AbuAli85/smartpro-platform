export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime. When frontend is on a different host than the API (e.g. Vercel
// frontend + Railway API), redirect URI must point to the API so the OAuth callback hits the server.
// Returns null when OAuth is not configured (no throw).
export const getLoginUrl = (): string | null => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

  if (!oauthPortalUrl || typeof oauthPortalUrl !== "string" || oauthPortalUrl.trim() === "") {
    return null;
  }
  if (!appId || typeof appId !== "string" || appId.trim() === "") {
    return null;
  }
  try {
    new URL(oauthPortalUrl);
  } catch {
    return null;
  }

  const redirectUri = apiBase
    ? `${apiBase}/api/oauth/callback`
    : `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url.toString();
};
