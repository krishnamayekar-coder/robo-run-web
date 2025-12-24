import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid, isTokenExpired, getAuthToken, clearAuthData } from '@/lib/auth';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const TOKEN_CHECK_INTERVAL = 60 * 1000; // Check token every minute

/**
 * Hook for managing user authentication state, activity tracking, and auto-logout
 */
export function useAuth() {
  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());
  const tokenCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(() => {
    clearAuthData();
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Reset inactivity timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
      // User has been inactive for the timeout period
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  const checkTokenValidity = useCallback(() => {
    const token = getAuthToken();
    
    if (!token || isTokenExpired(token)) {
      handleLogout();
      return false;
    }
    
    return true;
  }, [handleLogout]);

  useEffect(() => {
    // Initial token check
    if (!checkTokenValidity()) {
      return;
    }

    // Set up activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Initial inactivity timeout
    updateActivity();

    // Set up periodic token validation
    tokenCheckIntervalRef.current = setInterval(() => {
      checkTokenValidity();
    }, TOKEN_CHECK_INTERVAL);

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
      
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [updateActivity, checkTokenValidity]);

  return {
    isAuthenticated: isTokenValid(),
    logout: handleLogout,
  };
}

