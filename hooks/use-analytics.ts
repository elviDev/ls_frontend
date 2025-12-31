import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalStaff: number;
    totalPodcasts: number;
    totalAudiobooks: number;
    totalBroadcasts: number;
  };
  recentActivity: {
    recentComments: Array<{
      id: string;
      content: string;
      createdAt: string;
      user: { name: string };
    }>;
    recentReviews: Array<{
      id: string;
      rating: number;
      comment?: string;
      createdAt: string;
      user: { name: string };
    }>;
    recentFavorites: Array<{
      id: string;
      createdAt: string;
      user: { name: string };
    }>;
  };
}

export interface ContentAnalytics {
  totalPodcasts: number;
  totalAudiobooks: number;
  totalArchives: number;
  totalPlays: number;
  topContent: Array<{
    id: string;
    title: string;
    playCount?: number;
    createdAt: string;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: Array<{
    createdAt: string;
    _count: { id: number };
  }>;
}

export interface LiveAnalytics {
  totalBroadcasts: number;
  averageListeners: number;
  peakListeners: number;
  broadcastStats: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime?: string;
    status: string;
  }>;
}

export interface PodcastAnalytics {
  totalPodcasts: number;
  publishedPodcasts: number;
  topPodcasts: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  podcastsByGenre: Array<{
    genreId: string;
    _count: { id: number };
  }>;
}

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  content: (params?: any) => [...analyticsKeys.all, 'content', params] as const,
  users: (params?: any) => [...analyticsKeys.all, 'users', params] as const,
  live: (params?: any) => [...analyticsKeys.all, 'live', params] as const,
  podcasts: (params?: any) => [...analyticsKeys.all, 'podcasts', params] as const,
};

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => apiClient.request('/analytics/dashboard'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useContentAnalytics(params?: { startDate?: string; endDate?: string }) {
  return useQuery<ContentAnalytics>({
    queryKey: analyticsKeys.content(params),
    queryFn: () => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiClient.request(`/analytics/content${queryString}`);
    },
  });
}

export function useUserAnalytics(params?: { startDate?: string; endDate?: string }) {
  return useQuery<UserAnalytics>({
    queryKey: analyticsKeys.users(params),
    queryFn: () => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiClient.request(`/analytics/users${queryString}`);
    },
  });
}

export function useLiveAnalytics(params?: { startDate?: string; endDate?: string }) {
  return useQuery<LiveAnalytics>({
    queryKey: analyticsKeys.live(params),
    queryFn: () => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiClient.request(`/analytics/live${queryString}`);
    },
  });
}

export function usePodcastAnalytics(params?: { startDate?: string; endDate?: string }) {
  return useQuery<PodcastAnalytics>({
    queryKey: analyticsKeys.podcasts(params),
    queryFn: () => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiClient.request(`/analytics/podcasts${queryString}`);
    },
  });
}