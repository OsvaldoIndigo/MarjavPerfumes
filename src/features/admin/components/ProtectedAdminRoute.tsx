import {
  Navigate,
  Outlet,
  useLocation,
  useOutletContext,
} from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { AdminProfileRow } from '@/types/database';
import { useAdminAuth } from '../hooks/useAdminAuth';

export interface AdminOutletContext {
  admin: AdminProfileRow;
  logout: () => Promise<void>;
}

export function useAdminContext(): AdminOutletContext {
  return useOutletContext<AdminOutletContext>();
}

export function ProtectedAdminRoute() {
  const { admin, isLoading, isAuthenticated, logout } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-neutral-700">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet context={{ admin, logout } satisfies AdminOutletContext} />;
}