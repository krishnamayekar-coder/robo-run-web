import { Navigate } from "react-router-dom";

const Index = () => {
  const idToken = localStorage.getItem('idToken');
  
  if (idToken) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default Index;
