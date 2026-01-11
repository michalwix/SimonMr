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
 * 3. Auto-detect from frontend URL (production only)
 * 4. Development fallback (localhost)
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

  // 3. Auto-detect in production (Render deployment)
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If on Render domain, try to construct backend URL
    if (hostname.includes('onrender.com')) {
      // Pattern: simon-game-frontend-XXXX.onrender.com -> simon-game-backend-XXXX.onrender.com
      const match = hostname.match(/simon-game-frontend-([^.]+)/);
      if (match) {
        const backendUrl = `https://simon-game-backend-${match[1]}.onrender.com`;
        console.log('🔍 Auto-detected backend URL:', backendUrl);
        return backendUrl;
      }
      
      // Alternative: try replacing 'frontend' with 'backend'
      if (hostname.includes('frontend')) {
        const backendUrl = hostname.replace('frontend', 'backend');
        console.log('🔍 Auto-detected backend URL:', `https://${backendUrl}`);
        return `https://${backendUrl}`;
      }
    }
  }

  // 4. Development fallback
  const devUrl = 'http://localhost:3000';
  console.log('🔧 Using development API URL:', devUrl);
  return devUrl;
}

/**
 * Get the WebSocket URL
 * Same priority as API URL - always uses same URL as API
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

  // 3. Use same as API URL (WebSocket uses same endpoint)
  return getApiUrl();
}

// Export constants (evaluated at module load time)
export const API_BASE_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

// Log the configured URLs for debugging
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    API_BASE_URL,
    SOCKET_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
    windowConfig: window.__API_CONFIG__,
    isProduction: import.meta.env.PROD,
  });
}
