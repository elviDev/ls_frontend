'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface RoleGuardProps {
  children: ReactNode;
  roles?: string | string[];
  requireStaff?: boolean;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function RoleGuard({
  children,
  roles,
  requireStaff = false,
  requireAdmin = false,
  fallback = null,
  showFallback = true,
}: RoleGuardProps) {
  const { user, hasRole, isStaff, isAdmin } = useAuthStore();

  // Check authentication
  if (!user) {
    return showFallback ? fallback : null;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return showFallback ? fallback : null;
  }

  // Check staff requirement
  if (requireStaff && !isStaff()) {
    return showFallback ? fallback : null;
  }

  // Check specific roles
  if (roles && !hasRole(roles)) {
    return showFallback ? fallback : null;
  }

  return <>{children}</>;
}

// Convenience components
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard requireAdmin fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function StaffOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard requireStaff fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function AuthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user } = useAuthStore();
  
  if (!user) {
    return fallback || null;
  }
  
  return <>{children}</>;
}

// Hook for conditional rendering
export function usePermissions() {
  const { user, hasRole, isStaff, isAdmin } = useAuthStore();

  return {
    isAuthenticated: !!user,
    isStaff: isStaff(),
    isAdmin: isAdmin(),
    hasRole,
    canAccess: (roles?: string | string[]) => {
      if (!user) return false;
      if (!roles) return true;
      return hasRole(roles);
    },
  };
}