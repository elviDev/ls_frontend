import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api-client';
import { MeResponse } from './use-auth';

/**
 * Hook to initialize authentication state
 * Should only be called once at the app level (in AuthProvider)
 */
export function useAuthInit() {
  const { setUser, setLoading, _hasHydrated } = useAuthStore();
  const hasToken = !!apiClient.getToken();

  useEffect(() => {
    if (!_hasHydrated) return;

    const initAuth = async () => {
      if (!hasToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.auth.me() as MeResponse;
        setUser(data.user);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [_hasHydrated, hasToken, setUser, setLoading]);
}
