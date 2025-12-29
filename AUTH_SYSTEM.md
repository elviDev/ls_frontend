# Authentication & Authorization System

This document describes the comprehensive authentication and authorization system implemented for the radio station application.

## Overview

The system provides:
- JWT-based authentication with cookies and Bearer tokens
- Role-based access control (RBAC)
- Two user types: `user` and `staff`
- Staff roles: `ADMIN`, `HOST`, `CO_HOST`, `PRODUCER`, `SOUND_ENGINEER`, `CONTENT_MANAGER`, `TECHNICAL_SUPPORT`
- Email verification and password reset
- Persistent authentication state with Zustand
- TanStack Query integration for API calls

## Architecture

### Core Components

1. **Zustand Store** (`/stores/auth-store.ts`)
   - Manages authentication state
   - Provides helper methods for role checking
   - Persists user data to localStorage

2. **TanStack Query Hooks** (`/hooks/use-auth.ts`)
   - Handles all authentication API calls
   - Manages loading states and error handling
   - Provides mutations for login, register, logout, etc.

3. **API Client** (`/lib/api-client.ts`)
   - Enhanced with Bearer token support
   - Automatic token management
   - Unauthorized request handling

4. **Protection Components**
   - `ProtectedRoute`: Route-level protection
   - `RoleGuard`: Component-level access control
   - `AuthRequiredAction`: Action-level authentication

## Usage Examples

### Basic Authentication

```tsx
import { useAuthStore } from '@/stores/auth-store';
import { useLogin, useLogout } from '@/hooks/use-auth';

function MyComponent() {
  const { user, isAuthenticated } = useAuthStore();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const handleLogin = () => {
    loginMutation.mutate({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true
    });
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={() => logoutMutation.mutate()}>
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Route Protection

```tsx
import { ProtectedRoute, DashboardRoute, AdminRoute } from '@/components/auth/protected-route';

// Require authentication
function ProfilePage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}

// Require staff access
function DashboardPage() {
  return (
    <DashboardRoute>
      <div>Staff dashboard</div>
    </DashboardRoute>
  );
}

// Require admin access
function AdminPage() {
  return (
    <AdminRoute>
      <div>Admin panel</div>
    </AdminRoute>
  );
}
```

### Role-Based Component Access

```tsx
import { RoleGuard, AdminOnly, StaffOnly } from '@/components/auth/role-guard';

function Dashboard() {
  return (
    <div>
      {/* Visible to all staff */}
      <StaffOnly>
        <div>Staff content</div>
      </StaffOnly>

      {/* Visible to admins only */}
      <AdminOnly>
        <div>Admin content</div>
      </AdminOnly>

      {/* Visible to specific roles */}
      <RoleGuard roles={['ADMIN', 'HOST', 'PRODUCER']}>
        <div>Content management tools</div>
      </RoleGuard>

      {/* With fallback content */}
      <RoleGuard 
        roles="ADMIN" 
        fallback={<div>Access denied</div>}
      >
        <div>Admin-only content</div>
      </RoleGuard>
    </div>
  );
}
```

### Permission Checking

```tsx
import { usePermissions } from '@/components/auth/role-guard';

function MyComponent() {
  const { isAuthenticated, isStaff, isAdmin, hasRole, canAccess } = usePermissions();

  return (
    <div>
      {isAuthenticated && <p>User is logged in</p>}
      {isStaff() && <p>User is staff</p>}
      {isAdmin() && <p>User is admin</p>}
      {hasRole('HOST') && <p>User is a host</p>}
      {canAccess(['ADMIN', 'PRODUCER']) && <p>User can manage content</p>}
    </div>
  );
}
```

### Authentication Actions

```tsx
import { AuthRequiredAction } from '@/components/auth/auth-required-action';

function LikeButton() {
  const handleLike = () => {
    // This will only execute if user is authenticated
    console.log('Liked!');
  };

  return (
    <AuthRequiredAction onAction={handleLike}>
      <button>Like</button>
    </AuthRequiredAction>
  );
}
```

## API Integration

### Authentication Endpoints

The system integrates with these backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/register-staff` - Staff registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

### Token Management

The API client automatically:
- Adds Bearer tokens to requests
- Handles token refresh
- Clears tokens on logout
- Redirects on unauthorized responses

## User Types and Roles

### User Types

1. **user**: Regular users (listeners)
   - Can access public content
   - Can create playlists and favorites
   - Limited dashboard access

2. **staff**: Radio station staff
   - Access to staff dashboard
   - Role-based permissions
   - Content management capabilities

### Staff Roles

1. **ADMIN**: Full system access
2. **HOST**: Broadcast hosting, content management
3. **CO_HOST**: Broadcast co-hosting
4. **PRODUCER**: Content production and management
5. **SOUND_ENGINEER**: Technical audio management
6. **CONTENT_MANAGER**: Content curation and management
7. **TECHNICAL_SUPPORT**: System maintenance and support

## Setup Instructions

### 1. Install Dependencies

The system uses these packages (already installed):
- `@tanstack/react-query`
- `zustand`
- `zod`
- `react-hook-form`
- `@hookform/resolvers`

### 2. Configure Environment

Ensure your `.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Wrap Your App

Update your `layout.tsx`:

```tsx
import { AuthProvider } from '@/components/auth/auth-provider';
import { QueryProvider } from '@/providers/query-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 4. Update Navigation

Use the enhanced `AuthNav` component:

```tsx
import { AuthNav } from '@/components/auth/auth-nav';

function Header() {
  return (
    <header>
      <nav>
        <AuthNav />
      </nav>
    </header>
  );
}
```

## Security Features

1. **JWT Tokens**: Secure authentication with expiration
2. **HTTP-Only Cookies**: Prevent XSS attacks
3. **Bearer Token Support**: API authentication
4. **Role Validation**: Server-side permission checking
5. **Email Verification**: Prevent fake accounts
6. **Password Reset**: Secure password recovery
7. **Session Management**: Automatic logout on token expiry

## Error Handling

The system provides comprehensive error handling:

- Network errors are caught and displayed
- Unauthorized requests trigger automatic logout
- Form validation with user-friendly messages
- Toast notifications for user feedback
- Loading states for better UX

## Migration from Old System

If migrating from the old auth context:

1. Replace `useAuth()` with `useAuthStore()` and specific hooks
2. Update route protection to use new components
3. Replace manual permission checks with `usePermissions()`
4. Update form components to use new auth hooks

## Best Practices

1. **Always use protection components** for sensitive routes
2. **Check permissions at component level** for UI elements
3. **Use TypeScript** for better type safety
4. **Handle loading states** in your components
5. **Provide fallback content** for unauthorized users
6. **Test with different user roles** during development

## Troubleshooting

### Common Issues

1. **Token not persisting**: Check localStorage and cookie settings
2. **Unauthorized errors**: Verify API endpoints and token format
3. **Role checks failing**: Ensure user has required role and is approved
4. **Redirect loops**: Check route protection configuration

### Debug Tools

- Use React DevTools to inspect Zustand store
- Check Network tab for API calls
- Use TanStack Query DevTools for query debugging
- Check browser console for authentication errors