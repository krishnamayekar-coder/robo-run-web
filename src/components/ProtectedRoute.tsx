import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const idToken = localStorage.getItem('idToken');
  
  if (!idToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

