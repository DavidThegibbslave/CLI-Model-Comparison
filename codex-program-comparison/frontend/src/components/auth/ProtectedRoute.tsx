import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Spinner } from '../ui/Spinner';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, status, isRefreshing } = useAuth();
  const location = useLocation();

  if (status === 'loading' || isRefreshing) {
    return (
      <div className="page-container" style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Spinner /> <span>Verifying session…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
