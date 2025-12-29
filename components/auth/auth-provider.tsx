'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthInit } from '@/hooks/use-auth-init';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, _hasHydrated, isLoading } = useAuthStore();
  const router = useRouter();

  // Initialize authentication state once
  useAuthInit();

  useEffect(() => {
    // Set up unauthorized handler
    apiClient.setUnauthorizedHandler(() => {
      setUser(null);
      router.push('/signin');
      toast.error('Session expired. Please log in again.');
    });
  }, [setUser, router]);

  // Don't render children until store has rehydrated and auth is initialized
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}