/** Resolve API base URL for axios (must point to Render backend in production) */

function resolveApiUrl() {
  let url = import.meta.env.VITE_API_URL || '';

  if (!url || url === '/api') {
    // Local dev: Vite proxy handles /api
    if (import.meta.env.DEV) {
      return '/api';
    }
    // Production without env → requests hit Vercel static host → 405
    return '/api';
  }

  url = url.replace(/\/$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

/** True when deployed on Vercel without a backend URL configured */
export function isMisconfiguredProduction() {
  const onVercel =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('vercel.live'));
  const noBackendUrl = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '/api';
  return !import.meta.env.DEV && onVercel && noBackendUrl;
}

export const API_URL = resolveApiUrl();
