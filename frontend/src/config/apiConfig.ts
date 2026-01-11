/**
 * API Configuration
 * 
 * Runtime configuration for API and WebSocket URLs.
 * Supports both build-time (Vite env vars) and runtime configuration.
 */

// Try to get config from window object (set via script tag in index.html)
declare global {
  interface Window {
    __API_CONFIG__?: {
      apiUrl?: string;
      socketUrl?: string;
    };
  }
}

/**
 * Get the API base URL
 * Priority:
 * 1. Build-time env var (VITE_API_URL) - set in Render
 * 2. Runtime config from window.__API_CONFIG__ - set via script tag
 * 3. Development fallback (localhost)
 */
export function getApiUrl(): string {
  // 1. Check build-time env var (set during Render build)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Check runtime config (set via script tag in index.html)
  if (window.__API_CONFIG__?.apiUrl) {
    return window.__API_CONFIG__.apiUrl;
  }

  // 3. Development fallback
  return 'http://localhost:3000';
}

/**
 * Get the WebSocket URL
 * Same priority as API URL
 */
export function getSocketUrl(): string {
  // 1. Check build-time env var
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // 2. Check runtime config
  if (window.__API_CONFIG__?.socketUrl) {
    return window.__API_CONFIG__.socketUrl;
  }

  // 3. Use same as API URL
  return getApiUrl();
}

// Export constants (evaluated at module load time)
export const API_BASE_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();
