import { Navigate } from "react-router-dom";
import { isTokenValid } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Use the auth hook to track activity and validate token
  useAuth();
  
  // Check if token exists and is valid (not expired)
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

