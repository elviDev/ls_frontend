import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface MeResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    userType: 'user' | 'staff';
    isApproved?: boolean;
    firstName?: string;
    lastName?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    userType: 'user' | 'staff';
    isApproved?: boolean;
    firstName?: string;
    lastName?: string;
  };
}

export interface RegisterData {
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
}

export interface StaffRegisterData extends RegisterData {
  role: string;
}

// Auth query keys
export const authKeys = {
  me: ['auth', 'me'] as const,
};

// Get current user
export function useMe() {
  const { setUser, setLoading, _hasHydrated } = useAuthStore();
  const hasToken = !!apiClient.getToken();

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<MeResponse['user']> => {
      try {
        const data = await apiClient.auth.me() as MeResponse;
        setUser(data.user);
        return data.user;
      } catch (error) {
        // Clear auth state on error
        setUser(null);
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: _hasHydrated && hasToken, // Only run after hydration and if token exists
  });

  // Handle loading state and errors
  React.useEffect(() => {
    if (_hasHydrated) {
      if (!hasToken) {
        // No token, clear auth state immediately
        setUser(null);
        setLoading(false);
      } else if (!query.isLoading) {
        setLoading(false);
        // If query failed and we have no user, clear auth state
        if (query.isError && !query.data) {
          setUser(null);
        }
      }
    }
  }, [_hasHydrated, hasToken, query.isLoading, query.isError, query.data, setLoading, setUser]);

  return query;
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      return await apiClient.auth.login(credentials) as LoginResponse;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(authKeys.me, data.user);
      toast.success('Welcome back!');
      
      // Redirect based on user type
      const redirectUrl = new URLSearchParams(window.location.search).get('callbackUrl');
      if (redirectUrl) {
        // Only redirect to callback if user has permission
        if (redirectUrl.includes('/dashboard') && data.user.userType !== 'staff') {
          router.push('/');
        } else {
          router.push(redirectUrl);
        }
      } else if (data.user.userType === 'staff') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterData) => apiClient.auth.register(data),
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify your account.');
      router.push('/signin');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

// Staff register mutation
export function useStaffRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: StaffRegisterData) => apiClient.auth.registerStaff(data),
    onSuccess: () => {
      toast.success('Staff account created! Pending approval from admin.');
      router.push('/signin');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Staff registration failed');
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiClient.auth.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/');
    },
    onError: () => {
      // Even if API call fails, clear local state
      logout();
      queryClient.clear();
      router.push('/');
    },
  });
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => apiClient.auth.forgotPassword({ email }),
    onSuccess: () => {
      toast.success('Password reset link sent to your email');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send reset email');
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      apiClient.auth.resetPassword({ token, password }),
    onSuccess: () => {
      toast.success('Password reset successfully');
      router.push('/signin');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Password reset failed');
    },
  });
}

// Verify email mutation
export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => apiClient.auth.verifyEmail({ token }),
    onSuccess: () => {
      toast.success('Email verified successfully');
      router.push('/signin');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Email verification failed');
    },
  });
}