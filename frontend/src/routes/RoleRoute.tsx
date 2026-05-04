import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface RoleRouteProps {
  allow: Role[];
}

export default function RoleRoute({ allow }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
