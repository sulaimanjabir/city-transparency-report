import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { UserRole } from '../store/auth.store';

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { token, user } = useAuthStore();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
