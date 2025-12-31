import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Program, ProgramEpisode, ProgramQuery, ProgramAnalytics } from '@/stores/program-store';

export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters: string) => [...programKeys.lists(), { filters }] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
  episodes: (id: string) => [...programKeys.detail(id), 'episodes'] as const,
  episode: (programId: string, episodeId: string) => [...programKeys.episodes(programId), episodeId] as const,
  analytics: (id: string) => [...programKeys.detail(id), 'analytics'] as const,
};

export function usePrograms(params?: ProgramQuery) {
  return useQuery<Program[]>({
    queryKey: programKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      if (!params) {
        const response = await apiClient.request('/programs') as { programs?: Program[] } | Program[];
        return Array.isArray(response) ? response : response.programs || [];
      }
      
      const cleanParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      const queryString = Object.keys(cleanParams).length > 0 
        ? '?' + new URLSearchParams(cleanParams as any).toString() 
        : '';
      
      const response = await apiClient.request(`/programs${queryString}`) as { programs?: Program[] } | Program[];
      return Array.isArray(response) ? response : response.programs || [];
    },
  });
}

export function useProgramBySlug(slug: string) {
  return useQuery<Program>({
    queryKey: ['programs', 'slug', slug],
    queryFn: () => apiClient.request(`/programs/slug/${slug}`),
    enabled: !!slug,
  });
}

export function useProgram(id: string) {
  return useQuery<Program>({
    queryKey: programKeys.detail(id),
    queryFn: () => apiClient.request(`/programs/${id}`),
    enabled: !!id,
  });
}

export function useProgramEpisodes(id: string, page = 1, limit = 10) {
  return useQuery<{ episodes: ProgramEpisode[]; pagination: any }>({
    queryKey: programKeys.episodes(id),
    queryFn: () => apiClient.request(`/programs/${id}/episodes?page=${page}&limit=${limit}`),
    enabled: !!id,
  });
}

export function useProgramEpisode(programId: string, episodeId: string) {
  return useQuery<ProgramEpisode>({
    queryKey: programKeys.episode(programId, episodeId),
    queryFn: () => apiClient.request(`/programs/${programId}/episodes/${episodeId}`),
    enabled: !!programId && !!episodeId,
  });
}

export function useProgramAnalytics(id: string) {
  return useQuery<ProgramAnalytics>({
    queryKey: programKeys.analytics(id),
    queryFn: () => apiClient.request(`/programs/${id}/analytics`),
    enabled: !!id,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | any) => 
      apiClient.request('/programs', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      toast.success('Program created successfully');
    },
    onError: (error: any) => {
      console.error('Program creation error:', error);
      if (error.details && Array.isArray(error.details)) {
        const fieldErrors = error.details.map((detail: any) => `${detail.field}: ${detail.message}`).join(', ');
        toast.error(`Validation failed: ${fieldErrors}`);
      } else {
        toast.error(error.message || 'Failed to create program');
      }
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | any }) =>
      apiClient.request(`/programs/${id}`, {
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      toast.success('Program updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update program');
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.request(`/programs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      toast.success('Program deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete program');
    },
  });
}

export function useArchiveProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.request(`/programs/${id}/archive`, { method: 'PATCH' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      toast.success('Program archived successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to archive program');
    },
  });
}

export function useActivateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.request(`/programs/${id}/activate`, { method: 'PATCH' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      toast.success('Program activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate program');
    },
  });
}

export function useCreateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, data }: { programId: string; data: FormData | any }) =>
      apiClient.request(`/programs/${programId}/episodes`, {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.episodes(programId) });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId) });
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
    mutationFn: ({ programId, episodeId, data }: { programId: string; episodeId: string; data: FormData | any }) =>
      apiClient.request(`/programs/${programId}/episodes/${episodeId}`, {
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.episodes(programId) });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId) });
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
    mutationFn: ({ programId, episodeId }: { programId: string; episodeId: string }) =>
      apiClient.request(`/programs/${programId}/episodes/${episodeId}`, { method: 'DELETE' }),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.episodes(programId) });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId) });
      toast.success('Episode deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete episode');
    },
  });
}

export function useLinkEpisodeToBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, episodeId, broadcastId }: { programId: string; episodeId: string; broadcastId: string }) =>
      apiClient.request(`/programs/${programId}/episodes/${episodeId}/link-broadcast`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastId }),
      }),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.episodes(programId) });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId) });
      toast.success('Episode linked to broadcast successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to link episode to broadcast');
    },
  });
}

export function useCreateProgramSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, data }: { programId: string; data: any }) =>
      apiClient.request(`/programs/${programId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId) });
      toast.success('Schedule created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create schedule');
    },
  });
}