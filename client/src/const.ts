export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Returns null when OAuth is not configured (no throw).
export const getLoginUrl = (): string | null => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  if (!oauthPortalUrl || typeof oauthPortalUrl !== "string" || oauthPortalUrl.trim() === "") {
    console.error("[Auth] VITE_OAUTH_PORTAL_URL is not configured");
    return null;
  }
  if (!appId || typeof appId !== "string" || appId.trim() === "") {
    console.error("[Auth] VITE_APP_ID is not configured");
    return null;
  }
  try {
    new URL(oauthPortalUrl);
  } catch {
    console.error("[Auth] Invalid OAuth portal URL:", oauthPortalUrl);
    return null;
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url.toString();
};
