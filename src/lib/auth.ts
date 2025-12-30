/**
 * Auth utility functions for token validation and user activity tracking
 */

/**
 * Decodes a JWT token and returns its payload
 */
export function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
}

/**
 * Checks if a token exists and is valid (not expired)
 */
export function isTokenValid(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = getAuthToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
}

/**
 * Gets the token expiration time in milliseconds
 */
export function getTokenExpirationTime(token: string): number | null {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  
  return decoded.exp * 1000;
}

/**
 * Clears all auth-related data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('idToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
}

/**
 * Gets the current token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('idToken');
}

