import { useCallback, useEffect, useState } from 'react';
import type { AdminProfileRow } from '@/types/database';
import {
  getCurrentAdminProfile,
  loginAdmin,
  logoutAdmin,
  onAdminAuthStateChange,
} from '@/features/admin/services/authService';

interface UseAdminAuthReturn {
  admin: AdminProfileRow | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AdminProfileRow>;
  logout: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [admin, setAdmin] = useState<AdminProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const profile = await getCurrentAdminProfile();
        if (isMounted) {
          setAdmin(profile);
        }
      } catch {
        if (isMounted) {
          setAdmin(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    hydrateSession();

    const unsubscribe = onAdminAuthStateChange((hasSession) => {
      if (!isMounted) return;

      if (!hasSession) {
        setAdmin(null);
        setIsLoading(false);
      } else {
        hydrateSession();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AdminProfileRow> => {
      const profile = await loginAdmin(email, password);
      setAdmin(profile);
      return profile;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutAdmin();
    setAdmin(null);
  }, []);

  return {
    admin,
    isLoading,
    isAuthenticated: Boolean(admin),
    login,
    logout,
  };
}