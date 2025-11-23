import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere onboarding y el usuario es primera vez, redirigir
  if (!requireOnboarding && user?.isFirstTime) {
    return <Navigate to="/onboarding" replace />;
  }

  // Si está en onboarding pero ya no es primera vez, redirigir al home
  if (requireOnboarding && !user?.isFirstTime) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
