'use client';

import { DashboardRoute } from '@/components/auth/protected-route';
import { RoleGuard, AdminOnly, StaffOnly } from '@/components/auth/role-guard';
import { usePermissions } from '@/components/auth/role-guard';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Settings, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isAdmin, hasRole, canAccess } = usePermissions();

  return (
    <DashboardRoute>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
          <Badge variant={user?.userType === 'staff' ? 'default' : 'secondary'}>
            {user?.role || user?.userType}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Always visible to staff */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Basic Stats</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                Total listeners this month
              </p>
            </CardContent>
          </Card>

          {/* Only visible to specific roles */}
          <RoleGuard roles={['ADMIN', 'HOST', 'PRODUCER']}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Management</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">56</div>
                <p className="text-xs text-muted-foreground">
                  Pending content reviews
                </p>
                <Button className="mt-2 w-full" size="sm">
                  Manage Content
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Admin only section */}
          <AdminOnly>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Panel</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Pending staff approvals
                </p>
                <Button className="mt-2 w-full" size="sm" variant="destructive">
                  Admin Settings
                </Button>
              </CardContent>
            </Card>
          </AdminOnly>

          {/* Staff only (any staff role) */}
          <StaffOnly>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Tools</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Active broadcasts
                </p>
                <Button className="mt-2 w-full" size="sm">
                  Manage Broadcasts
                </Button>
              </CardContent>
            </Card>
          </StaffOnly>
        </div>

        {/* Conditional rendering using hooks */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User Type:</span>
                <span className="capitalize">{user?.userType}</span>
              </div>
              {user?.role && (
                <div className="flex justify-between">
                  <span className="font-medium">Role:</span>
                  <span>{user.role}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Admin Access:</span>
                <span>{isAdmin ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>What you can access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Can manage content:</span>
                <span>{canAccess(['ADMIN', 'HOST', 'PRODUCER']) ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Can manage users:</span>
                <span>{hasRole('ADMIN') ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Can broadcast:</span>
                <span>{canAccess(['ADMIN', 'HOST', 'CO_HOST']) ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Can manage technical:</span>
                <span>{canAccess(['ADMIN', 'SOUND_ENGINEER', 'TECHNICAL_SUPPORT']) ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example of fallback content */}
        <RoleGuard 
          roles="ADMIN" 
          fallback={
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Admin-only content is hidden. Contact an administrator for access.
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Admin-only dangerous operations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                Reset All Settings
              </Button>
            </CardContent>
          </Card>
        </RoleGuard>
      </div>
    </DashboardRoute>
  );
}