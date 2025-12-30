import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid, isTokenExpired, getAuthToken, clearAuthData } from '@/lib/auth';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const TOKEN_CHECK_INTERVAL = 60 * 1000;

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
    
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
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
    if (!checkTokenValidity()) {
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    updateActivity();

    tokenCheckIntervalRef.current = setInterval(() => {
      checkTokenValidity();
    }, TOKEN_CHECK_INTERVAL);

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

