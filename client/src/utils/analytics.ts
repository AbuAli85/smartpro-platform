/**
 * Analytics initialization utility
 * Dynamically loads Umami analytics script only if environment variables are configured
 */

export function initializeAnalytics() {
  // Check if analytics environment variables are available
  const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;

  // Only initialize if both values are provided and valid
  if (!analyticsEndpoint || !websiteId) {
    if (import.meta.env.DEV) {
      console.debug('[Analytics] Environment variables not configured, skipping analytics initialization');
    }
    return;
  }

  // Validate that the endpoint is a valid URL
  try {
    new URL(analyticsEndpoint);
  } catch {
    console.warn('[Analytics] Invalid analytics endpoint URL:', analyticsEndpoint);
    return;
  }

  // Check if script is already loaded
  const existingScript = document.querySelector(`script[data-website-id="${websiteId}"]`);
  if (existingScript) {
    console.log('[Analytics] Script already loaded');
    return;
  }

  // Create and inject the analytics script
  const script = document.createElement('script');
  script.defer = true;
  script.src = `${analyticsEndpoint}/umami`;
  script.setAttribute('data-website-id', websiteId);
  script.onerror = () => {
    console.error('[Analytics] Failed to load analytics script');
  };
  script.onload = () => {
    console.log('[Analytics] Successfully initialized');
  };

  document.head.appendChild(script);
}
