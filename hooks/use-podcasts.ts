import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Podcast, PodcastEpisode, PodcastQuery } from '@/stores/podcast-store';

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PodcastsResponse {
  podcasts: Podcast[];
  count: number;
}

export interface EpisodesResponse {
  episodes: PodcastEpisode[];
}

export interface FavoriteResponse {
  isFavorited: boolean;
  message: string;
}

export const podcastKeys = {
  all: ['podcasts'] as const,
  lists: () => [...podcastKeys.all, 'list'] as const,
  list: (filters: string) => [...podcastKeys.lists(), { filters }] as const,
  details: () => [...podcastKeys.all, 'detail'] as const,
  detail: (id: string) => [...podcastKeys.details(), id] as const,
  episodes: (id: string) => [...podcastKeys.detail(id), 'episodes'] as const,
  episode: (podcastId: string, episodeId: string) => [...podcastKeys.episodes(podcastId), episodeId] as const,
  comments: (id: string) => [...podcastKeys.detail(id), 'comments'] as const,
  reviews: (id: string) => [...podcastKeys.detail(id), 'reviews'] as const,
};

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: async () => {
      const data = await apiClient.request('/genres') as { genres: Genre[] };
      return data.genres || [];
    },
  });
}

export function usePodcasts(params?: PodcastQuery) {
  return useQuery<Podcast[]>({
    queryKey: podcastKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      if (!params) {
        const response = await apiClient.request('/podcasts?status=PUBLISHED') as PodcastsResponse;
        return response.podcasts || [];
      }
      
      const cleanParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      const queryString = Object.keys(cleanParams).length > 0 
        ? '?' + new URLSearchParams(cleanParams as any).toString() 
        : '?status=PUBLISHED';
      
      const response = await apiClient.request(`/podcasts${queryString}`) as PodcastsResponse;
      return response.podcasts || [];
    },
  });
}

export function usePodcast(id: string) {
  return useQuery<Podcast>({
    queryKey: podcastKeys.detail(id),
    queryFn: () => apiClient.request(`/podcasts/${id}`),
    enabled: !!id,
  });
}

export function usePodcastEpisodes(id: string) {
  return useQuery<{ episodes: PodcastEpisode[] }>({
    queryKey: podcastKeys.episodes(id),
    queryFn: () => apiClient.request(`/podcasts/${id}/episodes`),
    enabled: !!id,
  });
}

export function usePodcastEpisode(podcastId: string, episodeId: string) {
  return useQuery<PodcastEpisode>({
    queryKey: podcastKeys.episode(podcastId, episodeId),
    queryFn: () => apiClient.request(`/podcasts/${podcastId}/episodes/${episodeId}`),
    enabled: !!podcastId && !!episodeId,
  });
}

export function useFeaturedPodcasts() {
  return useQuery<Podcast[]>({
    queryKey: podcastKeys.list('featured=true&status=PUBLISHED&limit=8'),
    queryFn: async () => {
      const data = await apiClient.request('/podcasts?featured=true&status=PUBLISHED&limit=8') as PodcastsResponse;
      return data.podcasts || [];
    },
  });
}

export function usePopularPodcasts() {
  return useQuery<Podcast[]>({
    queryKey: podcastKeys.list('popular=true&status=PUBLISHED&limit=8'),
    queryFn: async () => {
      const data = await apiClient.request('/podcasts?popular=true&status=PUBLISHED&limit=8') as PodcastsResponse;
      return data.podcasts || [];
    },
  });
}

export function useRecentPodcasts() {
  return useQuery<Podcast[]>({
    queryKey: podcastKeys.list('recent=true&status=PUBLISHED&limit=8'),
    queryFn: async () => {
      const data = await apiClient.request('/podcasts?recent=true&status=PUBLISHED&limit=8') as PodcastsResponse;
      return data.podcasts || [];
    },
  });
}

export function useFavoritePodcasts() {
  return useQuery<Podcast[]>({
    queryKey: podcastKeys.list('favorites=true&status=PUBLISHED'),
    queryFn: async () => {
      const data = await apiClient.request('/podcasts?favorites=true&status=PUBLISHED') as PodcastsResponse;
      return data.podcasts || [];
    },
  });
}

export function useCreatePodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | any) => 
      apiClient.request('/podcasts', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.all });
      toast.success('Podcast created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create podcast');
    },
  });
}

export function useUpdatePodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | any }) =>
      apiClient.request(`/podcasts/${id}`, {
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
      toast.success('Podcast updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update podcast');
    },
  });
}

export function useDeletePodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.request(`/podcasts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.all });
      toast.success('Podcast deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete podcast');
    },
  });
}

export function useCreateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ podcastId, data }: { podcastId: string; data: FormData | any }) =>
      apiClient.request(`/podcasts/${podcastId}/episodes`, {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { podcastId }) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.episodes(podcastId) });
      queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
      toast.success('Episode created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create episode');
    },
  });
}

export function useUpdateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ podcastId, episodeId, data }: { podcastId: string; episodeId: string; data: FormData | any }) =>
      apiClient.request(`/podcasts/${podcastId}/episodes/${episodeId}`, {
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { podcastId, episodeId }) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.episode(podcastId, episodeId) });
      queryClient.invalidateQueries({ queryKey: podcastKeys.episodes(podcastId) });
      toast.success('Episode updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update episode');
    },
  });
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ podcastId, episodeId }: { podcastId: string; episodeId: string }) => 
      apiClient.request(`/podcasts/${podcastId}/episodes/${episodeId}`, { method: 'DELETE' }),
    onSuccess: (_, { podcastId }) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.episodes(podcastId) });
      queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
      toast.success('Episode deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete episode');
    },
  });
}

export function useTogglePodcastFavorite() {
  const queryClient = useQueryClient();
  return useMutation<FavoriteResponse, Error, string>({
    mutationFn: (podcastId: string): Promise<FavoriteResponse> => 
      apiClient.request(`/podcasts/${podcastId}/favorite`, { method: 'POST' }) as Promise<FavoriteResponse>,
    onSuccess: (result: FavoriteResponse, podcastId: string) => {
      // Invalidate specific podcast detail to refetch with updated favorite status
      queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
      // Also invalidate all podcast lists to update favorite status everywhere
      queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
      toast.success(result.message);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update favorites');
    },
  });
}

export function usePodcastComments(podcastId: string) {
  return useQuery<any[]>({
    queryKey: podcastKeys.comments(podcastId),
    queryFn: () => apiClient.request(`/podcasts/${podcastId}/comments`),
    enabled: !!podcastId,
  });
}

export function useCreatePodcastComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ podcastId, content }: { podcastId: string; content: string }) =>
      apiClient.request(`/podcasts/${podcastId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_, { podcastId }) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.comments(podcastId) });
      toast.success('Comment added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

export function usePodcastReviews(podcastId: string) {
  return useQuery<any[]>({
    queryKey: podcastKeys.reviews(podcastId),
    queryFn: () => apiClient.request(`/podcasts/${podcastId}/reviews`),
    enabled: !!podcastId,
  });
}

export function useCreatePodcastReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ podcastId, rating, comment }: { podcastId: string; rating: number; comment?: string }) =>
      apiClient.request(`/podcasts/${podcastId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      }),
    onSuccess: (_, { podcastId }) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.reviews(podcastId) });
      toast.success('Review added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add review');
    },
  });
}

export function useEpisodeComments(podcastId: string, episodeId: string) {
  return useQuery<{ comments: any[] }>({
    queryKey: [...podcastKeys.episode(podcastId, episodeId), 'comments'],
    queryFn: () => apiClient.request(`/podcasts/${podcastId}/episodes/${episodeId}/comments`),
    enabled: !!podcastId && !!episodeId,
  });
}

export function useCreateEpisodeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ podcastId, episodeId, content }: { podcastId: string; episodeId: string; content: string }) =>
      apiClient.request(`/podcasts/${podcastId}/episodes/${episodeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_, { podcastId, episodeId }) => {
      queryClient.invalidateQueries({ queryKey: [...podcastKeys.episode(podcastId, episodeId), 'comments'] });
      toast.success('Comment added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

export function useCreateEpisodeReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ podcastId, episodeId, rating, comment }: { podcastId: string; episodeId: string; rating: number; comment?: string }) =>
      apiClient.request(`/podcasts/${podcastId}/episodes/${episodeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      }),
    onSuccess: (_, { podcastId, episodeId }) => {
      queryClient.invalidateQueries({ queryKey: [...podcastKeys.episode(podcastId, episodeId), 'reviews'] });
      toast.success('Review added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add review');
    },
  });
}