import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';
import type { Role } from '../types';

interface Props {
  allow: Role[];
  redirectTo?: string;
}

export default function ProtectedRoute({ allow, redirectTo = '/login' }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to={redirectTo} replace />;
  if (!allow.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
