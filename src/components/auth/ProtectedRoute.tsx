import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_ENABLED } from '../../lib/config';

export function ProtectedRoute() {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex min-h-screen items-center justify-center gap-2 text-textSoft"><Loader2 className="animate-spin" /> Validando acesso...</div>;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function AdminRoute() {
  const { usuario, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center gap-2 text-textSoft"><Loader2 className="animate-spin" /> Validando acesso...</div>;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!ADMIN_ENABLED || !usuario.is_admin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
