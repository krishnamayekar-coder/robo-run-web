import { Navigate } from "react-router-dom";
import { isTokenValid } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  useAuth();
  
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

