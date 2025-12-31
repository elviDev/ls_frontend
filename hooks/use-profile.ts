import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  bio?: string;
  profileImage?: string;
  createdAt: string;
  _count: {
    favorites: number;
    reviews: number;
  };
}

export interface StaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  profileImage?: string;
  isActive: boolean;
  isApproved: boolean;
  approvedAt?: string;
  startDate?: string;
  endDate?: string;
  salary?: number;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    podcasts: number;
    audiobooks: number;
    hostedBroadcasts: number;
  };
}

export interface ProfileData {
  userType: 'user' | 'staff';
  profile: UserProfile | StaffProfile;
  stats?: {
    favoritesCount?: number;
    playlistsCount?: number;
    totalListened?: number;
    contentCreated?: number;
    broadcastsHosted?: number;
  };
}

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  favorites: () => [...profileKeys.all, 'favorites'] as const,
  public: (userId: string) => [...profileKeys.all, 'public', userId] as const,
};

export function useProfile() {
  const { user } = useAuthStore();
  
  return useQuery<ProfileData>({
    queryKey: profileKeys.me(),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      if (user.userType === 'staff') {
        // Get staff profile
        const profile = await apiClient.request(`/staff/${user.id}`) as StaffProfile;
        return {
          userType: 'staff',
          profile,
          stats: {
            contentCreated: profile._count.podcasts + profile._count.audiobooks,
            broadcastsHosted: profile._count.hostedBroadcasts,
          }
        };
      } else {
        // Get user profile
        const profile = await apiClient.request('/users/me') as UserProfile;
        return {
          userType: 'user',
          profile,
          stats: {
            favoritesCount: profile._count.favorites,
            totalListened: profile._count.reviews, // Using reviews as proxy for listened content
          }
        };
      }
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (data: Partial<UserProfile | StaffProfile>) => {
      if (!user) throw new Error('Not authenticated');
      
      if (user.userType === 'staff') {
        return apiClient.request(`/staff/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        return apiClient.request('/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

export function useFavorites() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: profileKeys.favorites(),
    queryFn: () => apiClient.request('/users/me/favorites'),
    enabled: !!user && user.userType === 'user',
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      apiClient.request('/users/me/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.public(userId),
    queryFn: () => apiClient.request(`/users/public/${userId}`),
    enabled: !!userId,
  });
}