'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSpinner } from '@/components/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireStaff?: boolean;
  requireAdmin?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
  loadingComponent?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireStaff = false,
  requireAdmin = false,
  allowedRoles,
  redirectTo,
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasRole, isStaff: checkIsStaff, isAdmin: checkIsAdmin } = useAuthStore();
  const hasRedirected = useRef(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth initialization to complete
    if (isLoading) {
      setIsChecking(true);
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    const currentPath = window.location.pathname;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      hasRedirected.current = true;
      const callbackUrl = encodeURIComponent(currentPath);
      router.replace(redirectTo || `/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    // If authenticated, check role requirements
    if (isAuthenticated && user) {
      // Check admin requirement
      if (requireAdmin && !checkIsAdmin()) {
        hasRedirected.current = true;
        router.replace('/');
        return;
      }

      // Check staff requirement (admins are also considered staff)
      if (requireStaff && !checkIsStaff() && !checkIsAdmin()) {
        hasRedirected.current = true;
        router.replace('/signin?callbackUrl=/dashboard');
        return;
      }

      // Check specific roles
      if (allowedRoles && !hasRole(allowedRoles)) {
        hasRedirected.current = true;
        router.replace('/');
        return;
      }
    }

    // All checks passed
    setIsChecking(false);
  }, [
    isLoading,
    isAuthenticated,
    user,
    requireAuth,
    requireStaff,
    requireAdmin,
    allowedRoles,
    hasRole,
    checkIsStaff,
    checkIsAdmin,
    router,
    redirectTo,
  ]);

  // Show loading state
  if (isLoading || isChecking) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Check all conditions before rendering
  if (requireAuth && !isAuthenticated) return null;
  if (requireAdmin && !checkIsAdmin()) return null;
  if (requireStaff && !checkIsStaff() && !checkIsAdmin()) return null;
  if (allowedRoles && !hasRole(allowedRoles)) return null;

  return <>{children}</>;
}

// Convenience components for common use cases
export function DashboardRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireStaff redirectTo="/signin?callbackUrl=/dashboard">
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      {children}
    </ProtectedRoute>
  );
}

export function AuthRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAuth>
      {children}
    </ProtectedRoute>
  );
}