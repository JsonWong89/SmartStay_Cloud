import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {

  const user = useAuthStore((state) => state.user);
    // const isAuthenticated = !!user;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Not logged in 
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but does NOT have the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
