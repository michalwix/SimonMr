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
  // PRIORITY 1: If on localhost, ALWAYS use localhost backend (development)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      const devUrl = 'http://localhost:3000';
      console.log('🔧 Development mode detected - using localhost:', devUrl);
      return devUrl;
    }
  }
  
  // PRIORITY 2: Check build-time env var (set during Render build) - but only if not localhost
  if (import.meta.env.VITE_API_URL && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }

  // PRIORITY 3: Check runtime config (set via script tag in index.html) - but only if not localhost
  if (window.__API_CONFIG__?.apiUrl && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return window.__API_CONFIG__.apiUrl;
  }

  // PRIORITY 4: Auto-detect in production (Render deployment) - ONLY if actually on Render
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Only auto-detect if we're actually on Render (not localhost)
    if (hostname.includes('onrender.com') && !hostname.includes('localhost')) {
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

  // PRIORITY 5: Final fallback - always localhost for safety
  const devUrl = 'http://localhost:3000';
  console.log('🔧 Final fallback - using localhost:', devUrl);
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

// Export constants - but ensure they're evaluated correctly
// Use IIFE to ensure window is available when evaluating
export const API_BASE_URL = (() => {
  // Force evaluation with window check
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }
  
  const hostname = window.location.hostname;
  const url = getApiUrl();
  
  console.log('🔧 API Configuration:', {
    API_BASE_URL: url,
    SOCKET_URL: getSocketUrl(),
    hostname: hostname,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
    windowConfig: window.__API_CONFIG__,
    isProduction: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
  });
  
  return url;
})();

export const SOCKET_URL = (() => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }
  return getSocketUrl();
})();

// Export functions for dynamic access
export function getAPI_BASE_URL(): string {
  return getApiUrl();
}

export function getSOCKET_URL(): string {
  return getSocketUrl();
}
