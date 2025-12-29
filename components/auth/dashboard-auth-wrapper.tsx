"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardAuthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute 
      requireStaff 
      redirectTo="/signin?callbackUrl=/dashboard"
      loadingComponent={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      {children}
    </ProtectedRoute>
  );
}