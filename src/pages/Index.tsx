import { Navigate } from "react-router-dom";
import { isTokenValid } from "@/lib/auth";

const Index = () => {
  if (isTokenValid()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default Index;
