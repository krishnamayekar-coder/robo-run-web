import { Navigate } from "react-router-dom";
import { isTokenValid } from "@/lib/auth";

const Index = () => {
  // Only redirect to dashboard if token exists and is valid (not expired)
  if (isTokenValid()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default Index;
