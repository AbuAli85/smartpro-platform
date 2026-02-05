export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Validate required environment variables
  if (!oauthPortalUrl || typeof oauthPortalUrl !== 'string' || oauthPortalUrl.trim() === '') {
    console.error('[Auth] VITE_OAUTH_PORTAL_URL is not configured');
    // Return a fallback URL or throw an error
    throw new Error('OAuth portal URL is not configured. Please set VITE_OAUTH_PORTAL_URL environment variable.');
  }
  
  if (!appId || typeof appId !== 'string' || appId.trim() === '') {
    console.error('[Auth] VITE_APP_ID is not configured');
    throw new Error('App ID is not configured. Please set VITE_APP_ID environment variable.');
  }

  // Validate that oauthPortalUrl is a valid URL
  try {
    new URL(oauthPortalUrl);
  } catch {
    console.error('[Auth] Invalid OAuth portal URL:', oauthPortalUrl);
    throw new Error(`Invalid OAuth portal URL: ${oauthPortalUrl}`);
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
