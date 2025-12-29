"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function GuestOnlyWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
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

    if (isAuthenticated && user) {
      hasRedirected.current = true;

      // Get callback URL from query params
      const callbackUrl = searchParams?.get('callbackUrl');

      // Redirect based on user type and callback
      if (callbackUrl) {
        // Only allow dashboard access for staff users
        if (callbackUrl.includes('/dashboard') && user.userType === 'staff' && user.isApproved) {
          router.replace(callbackUrl);
        } else if (!callbackUrl.includes('/dashboard')) {
          router.replace(callbackUrl);
        } else {
          // Non-staff trying to access dashboard, redirect to home
          router.replace('/');
        }
      } else if (user.userType === 'staff' && user.isApproved) {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
      return;
    }

    // Not authenticated, allow access to guest page
    setIsChecking(false);
  }, [isLoading, isAuthenticated, user, router, searchParams]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null; // Router will redirect
  }

  return <>{children}</>;
}