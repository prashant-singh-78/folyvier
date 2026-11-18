import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { user, isSuperAdmin, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#B8C2D1]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1677FF]" />
          <p className="text-sm">Verifying secure FOLIBEIR session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={requireSuperAdmin ? '/admin/login' : '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
