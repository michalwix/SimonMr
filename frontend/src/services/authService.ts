/**
 * Auth Service
 * 
 * HTTP API calls for session management.
 */

import type { 
  CreateSessionResponse, 
  JoinGameResponse, 
  VerifySessionResponse 
} from '../shared/types';
import { API_BASE_URL, getApiUrl } from '../config/apiConfig';

/**
 * Create a new game session (host)
 */
export async function createSession(
  displayName: string,
  avatarId: string
): Promise<CreateSessionResponse> {
  const url = `${API_BASE_URL}/api/auth/create-session`;
  console.log('🌐 Creating session:', { url, displayName, avatarId });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // CRITICAL: Send/receive cookies
      body: JSON.stringify({ displayName, avatarId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
      console.error('❌ Create session error:', error);
      throw new Error(error.error || 'Failed to create session');
    }

    const data = await response.json();
    console.log('✅ Session created:', data);
    return data;
  } catch (err) {
    console.error('❌ Fetch error:', err);
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running on port 3000.`);
    }
    throw err;
  }
}

/**
 * Join an existing game
 */
export async function joinGame(
  displayName: string,
  avatarId: string,
  gameCode: string
): Promise<JoinGameResponse> {
  const url = `${API_BASE_URL}/api/auth/join-game`;
  console.log('🌐 Joining game:', { url, displayName, avatarId, gameCode });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // CRITICAL: Send/receive cookies
      body: JSON.stringify({ displayName, avatarId, gameCode }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
      console.error('❌ Join game error:', error);
      throw new Error(error.error || 'Failed to join game');
    }

    const data = await response.json();
    console.log('✅ Joined game:', data);
    return data;
  } catch (err) {
    console.error('❌ Fetch error:', err);
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running on port 3000.`);
    }
    throw err;
  }
}

/**
 * Verify if session is valid (on page load)
 */
export async function verifySession(): Promise<VerifySessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-session`, {
    method: 'GET',
    credentials: 'include', // CRITICAL: Send cookies
  });

  if (!response.ok) {
    return { valid: false };
  }

  return response.json();
}

/**
 * Logout and leave game
 */
export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
