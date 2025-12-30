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
 * Default token for testing/development (DEV_MANAGER role)
 * TODO: Remove this in production
 */
const DEFAULT_TOKEN = 'eyJraWQiOiJFS1VxNDRXc01xVDFyZENqRUZVa3dGUjZNNlQ1eEhTVzlOSFJnTWdOa3ljPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJmNGY4NzQ5OC1hMDkxLTcwODctOGY1Zi1mNDI2MWI0MzM2NzkiLCJjb2duaXRvOmdyb3VwcyI6WyJERVZfTUFOQUdFUiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfTDNqa2xuMkVMIiwiY29nbml0bzp1c2VybmFtZSI6ImY0Zjg3NDk4LWEwOTEtNzA4Ny04ZjVmLWY0MjYxYjQzMzY3OSIsIm9yaWdpbl9qdGkiOiIxOTU3NjJlOC1lZjc5LTRlN2YtYWQxYi1jZjcxY2M5Nzk3NTEiLCJhdWQiOiI2Zm00NHFubTliNWwxanZsZnZyZjlsOXMyYyIsImV2ZW50X2lkIjoiNTU3NzY5YWEtZmMwYS00MTNmLWFhMDYtZGFiNzNiMjQ5ZDA2IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NjcwODM5NjIsImV4cCI6MTc2NzA4NzU2MiwiY3VzdG9tOnJvbGUiOiJERVZfTUFOQUdFUiIsImlhdCI6MTc2NzA4Mzk2MiwianRpIjoiYWE0NzlkMzQtYjk5NS00OGE2LWI4NzYtYWFkM2YwMDkzZGQ4IiwiZW1haWwiOiJrcmlzaG5hLm1heWVrYXJAYWl0aGlua2Vycy5jb20ifQ.fCB47TeYMrRnN1mIDZZKzlyC8RsB9LJvI5i3HdOBbv7LJ3jUyUo2b5dRTF8uYxW8U5DTBe8XdDRO7YleJnma6SxdKI_Ygy00W6Q3FN249kCrfuu8xNl1GCc9bch1nfun9Hk2tJM1WmIML3cQcM2BZntVd2vsNjzdcQes4joLrwR1w_z-21suOvpgSxy7vFnxXvsd4Y30ALt9KqMJzd37yddWB096aqrL_fFTbwVfYXiDyOWYzzm5DaTC5xZt4FRGBKOrPlKOSJ-S7N06JIcrozcxzdHMn2jXcn4HtU19YWeEWbTpGFcgzFHXMbTztA8vEnCcBPH5_ZdIEDrVcgOEkA';

/**
 * Gets the current token from localStorage, with fallback to default token for testing
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('idToken');
  // Use default token if no token in localStorage (for testing)
  return token || DEFAULT_TOKEN;
}

