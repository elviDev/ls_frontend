import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Audiobook, Chapter, AudiobookStats, AudiobookQuery, Comment, Review } from '@/stores/audiobook-store';

// Query keys
export const audiobookKeys = {
  all: ['audiobooks'] as const,
  lists: () => [...audiobookKeys.all, 'list'] as const,
  list: (filters: string) => [...audiobookKeys.lists(), { filters }] as const,
  details: () => [...audiobookKeys.all, 'detail'] as const,
  detail: (id: string) => [...audiobookKeys.details(), id] as const,
  chapters: (id: string) => [...audiobookKeys.detail(id), 'chapters'] as const,
  chapter: (audiobookId: string, chapterId: string) => [...audiobookKeys.chapters(audiobookId), chapterId] as const,
  comments: (id: string) => [...audiobookKeys.detail(id), 'comments'] as const,
  reviews: (id: string) => [...audiobookKeys.detail(id), 'reviews'] as const,
  stats: () => [...audiobookKeys.all, 'stats'] as const,
};

// Get audiobooks
export function useAudiobooks(params?: AudiobookQuery) {
  return useQuery<Audiobook[]>({
    queryKey: audiobookKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      if (!params) {
        const response = await apiClient.request('/audiobooks') as { audiobooks?: Audiobook[] } | Audiobook[];
        return Array.isArray(response) ? response : response.audiobooks || [];
      }
      
      const cleanParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      const queryString = Object.keys(cleanParams).length > 0 
        ? '?' + new URLSearchParams(cleanParams as any).toString() 
        : '';
      
      const response = await apiClient.request(`/audiobooks${queryString}`) as { audiobooks?: Audiobook[] } | Audiobook[];
      return Array.isArray(response) ? response : response.audiobooks || [];
    },
  });
}

// Get featured audiobooks
export function useFeaturedAudiobooks() {
  return useQuery<Audiobook[]>({
    queryKey: audiobookKeys.list('featured=true&limit=8'),
    queryFn: async () => {
      const response = await apiClient.request('/audiobooks?featured=true&limit=8') as { audiobooks?: Audiobook[] };
      return response.audiobooks || [];
    },
  });
}

// Get audiobook by ID
export function useAudiobook(id: string) {
  return useQuery<Audiobook>({
    queryKey: audiobookKeys.detail(id),
    queryFn: () => apiClient.request(`/audiobooks/${id}`),
    enabled: !!id,
  });
}

// Get audiobook chapters
export function useAudiobookChapters(id: string) {
  return useQuery({
    queryKey: audiobookKeys.chapters(id),
    queryFn: async () => {
      const response = await apiClient.request(`/audiobooks/${id}/chapters`) as any;
      return response.chapters || [];
    },
    enabled: !!id,
  });
}

// Get individual chapter
export function useChapter(audiobookId: string, chapterId: string) {
  return useQuery({
    queryKey: audiobookKeys.chapter(audiobookId, chapterId),
    queryFn: async () => {
      const response = await apiClient.request(`/audiobooks/${audiobookId}/chapters/${chapterId}`);
      return response;
    },
    enabled: !!audiobookId && !!chapterId,
  });
}

// Get audiobook comments
export function useAudiobookComments(id: string) {
  return useQuery({
    queryKey: audiobookKeys.comments(id),
    queryFn: async () => {
      const response = await apiClient.request(`/audiobooks/${id}/comments`) as any;
      return response.comments || [];
    },
    enabled: !!id,
  });
}

// Get audiobook reviews
export function useAudiobookReviews(id: string) {
  return useQuery({
    queryKey: audiobookKeys.reviews(id),
    queryFn: async () => {
      const response = await apiClient.request(`/audiobooks/${id}/reviews`) as any;
      return response.reviews || [];
    },
    enabled: !!id,
  });
}

// Get audiobook stats
export function useAudiobookStats() {
  return useQuery<AudiobookStats>({
    queryKey: audiobookKeys.stats(),
    queryFn: () => apiClient.request('/audiobooks/stats'),
  });
}

// Create audiobook
export function useCreateAudiobook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData | any) => 
      apiClient.request('/audiobooks', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.all });
      toast.success('Audiobook created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create audiobook');
    },
  });
}

// Update audiobook
export function useUpdateAudiobook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | any }) =>
      apiClient.request(`/audiobooks/${id}`, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: audiobookKeys.lists() });
      toast.success('Audiobook updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update audiobook');
    },
  });
}

// Delete audiobook
export function useDeleteAudiobook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.request(`/audiobooks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.all });
      toast.success('Audiobook deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete audiobook');
    },
  });
}

// Create chapter
export function useCreateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audiobookId, data }: { audiobookId: string; data: FormData | any }) =>
      apiClient.request(`/audiobooks/${audiobookId}/chapters`, {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { audiobookId }) => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.chapters(audiobookId) });
      queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(audiobookId) });
      toast.success('Chapter created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create chapter');
    },
  });
}

// Update chapter
export function useUpdateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audiobookId, chapterId, data }: { audiobookId: string; chapterId: string; data: FormData | any }) =>
      apiClient.request(`/audiobooks/${audiobookId}/chapters/${chapterId}`, {
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { audiobookId }) => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.chapters(audiobookId) });
      queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(audiobookId) });
      toast.success('Chapter updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update chapter');
    },
  });
}

// Delete chapter
export function useDeleteChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audiobookId, chapterId }: { audiobookId: string; chapterId: string }) =>
      apiClient.request(`/audiobooks/${audiobookId}/chapters/${chapterId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, { audiobookId }) => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.chapters(audiobookId) });
      queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(audiobookId) });
      toast.success('Chapter deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete chapter');
    },
  });
}

// Create comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audiobookId, data }: { audiobookId: string; data: { content: string } }) =>
      apiClient.request(`/audiobooks/${audiobookId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { audiobookId }) => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.comments(audiobookId) });
      toast.success('Comment added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

// Create review
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audiobookId, data }: { audiobookId: string; data: { rating: number; content?: string } }) =>
      apiClient.request(`/audiobooks/${audiobookId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { audiobookId }) => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.reviews(audiobookId) });
      queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(audiobookId) });
      toast.success('Review added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add review');
    },
  });
}

// Toggle favorite
export function useToggleAudiobookFavorite() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; isFavorited: boolean }, Error, string>({
    mutationFn: (id: string) =>
      apiClient.request(`/audiobooks/${id}/favorite`, { method: 'POST' }) as Promise<{ message: string; isFavorited: boolean }>,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: audiobookKeys.detail(id) });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(audiobookKeys.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(audiobookKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFavorited: !old.isFavorited,
          _count: {
            ...old._count,
            favorites: old.isFavorited 
              ? Math.max(0, old._count.favorites - 1)
              : old._count.favorites + 1
          }
        };
      });
      
      return { previousData };
    },
    onSuccess: (result, id) => {
      toast.success(result.message);
    },
    onError: (error: any, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(audiobookKeys.detail(id), context.previousData);
      }
      toast.error(error.message || 'Failed to update favorite');
    },
  });
}