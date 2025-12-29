import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Podcast, Episode, PodcastFilters } from '@/stores/podcast-store';

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface GenresResponse {
  genres: Genre[];
}

export interface PodcastsResponse {
  podcasts: Podcast[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface EpisodesResponse {
  episodes: Episode[];
}

export interface CommentsResponse {
  comments: any[];
}

export interface ReviewsResponse {
  reviews: any[];
}

export interface FavoriteResponse {
  isFavorited: boolean;
  message: string;
}

export interface PodcastResponse {
  podcasts: Podcast[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Get genres
export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async (): Promise<Genre[]> => {
      const data = await apiClient.request('/genres') as GenresResponse;
      return data.genres || [];
    },
  });
};

// Get podcasts with filters
export const usePodcasts = (filters: PodcastFilters) => {
  return useQuery({
    queryKey: ['podcasts', filters],
    queryFn: async (): Promise<PodcastResponse> => {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        perPage: filters.perPage.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
      });
      
      if (filters.genre !== 'all') {
        params.append('genre', filters.genre);
      }
      
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      const data = await apiClient.request(`/podcasts?${params.toString()}`) as PodcastsResponse;
      return {
        podcasts: data.podcasts || [],
        pagination: data.pagination || {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      };
    },
  });
};

// Get single podcast by ID
export const usePodcast = (id: string) => {
  return useQuery({
    queryKey: ['podcasts', id],
    queryFn: async (): Promise<Podcast> => {
      return await apiClient.request(`/podcasts/${id}`) as Podcast;
    },
    enabled: !!id,
  });
};

// Get podcast episodes
export const usePodcastEpisodes = (podcastId: string) => {
  return useQuery({
    queryKey: ['podcasts', podcastId, 'episodes'],
    queryFn: async (): Promise<Episode[]> => {
      const data = await apiClient.request(`/podcasts/${podcastId}/episodes`) as EpisodesResponse;
      return data.episodes || [];
    },
    enabled: !!podcastId,
  });
};

// Get featured podcasts
export const useFeaturedPodcasts = () => {
  return useQuery({
    queryKey: ['podcasts', 'featured'],
    queryFn: async (): Promise<Podcast[]> => {
      const data = await apiClient.request('/podcasts?featured=true&limit=8') as PodcastsResponse;
      return data.podcasts || [];
    },
  });
};

// Get popular podcasts
export const usePopularPodcasts = () => {
  return useQuery({
    queryKey: ['podcasts', 'popular'],
    queryFn: async (): Promise<Podcast[]> => {
      const data = await apiClient.request('/podcasts?sortBy=popular&limit=8') as PodcastsResponse;
      return data.podcasts || [];
    },
  });
};

// Get recent podcasts
export const useRecentPodcasts = () => {
  return useQuery({
    queryKey: ['podcasts', 'recent'],
    queryFn: async (): Promise<Podcast[]> => {
      const data = await apiClient.request('/podcasts?sortBy=recent&limit=8') as PodcastsResponse;
      return data.podcasts || [];
    },
  });
};

// Get user's favorite podcasts
export const useFavoritePodcasts = () => {
  return useQuery({
    queryKey: ['podcasts', 'favorites'],
    queryFn: async (): Promise<Podcast[]> => {
      const data = await apiClient.request('/podcasts/favorites') as PodcastsResponse;
      return data.podcasts || [];
    },
  });
};

// Toggle podcast favorite
export const useTogglePodcastFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (podcastId: string) => {
      return await apiClient.request(`/podcasts/${podcastId}/favorite`, {
        method: 'POST',
      });
    },
    onSuccess: (result, podcastId) => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      queryClient.invalidateQueries({ queryKey: ['podcasts', 'favorites'] });
      
      const response = result as FavoriteResponse;
      toast({
        title: response.isFavorited ? 'Added to favorites' : 'Removed from favorites',
        description: response.isFavorited 
          ? 'Podcast added to your favorites' 
          : 'Podcast removed from your favorites',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update favorites',
        variant: 'destructive',
      });
    },
  });
};

// Add comment to podcast
export const useAddPodcastComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ podcastId, content }: { podcastId: string; content: string }) => {
      return await apiClient.request(`/podcasts/${podcastId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: (_, { podcastId }) => {
      queryClient.invalidateQueries({ queryKey: ['podcasts', podcastId, 'comments'] });
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    },
  });
};

// Get podcast comments
export const usePodcastComments = (podcastId: string) => {
  return useQuery({
    queryKey: ['podcasts', podcastId, 'comments'],
    queryFn: async () => {
      const data = await apiClient.request(`/podcasts/${podcastId}/comments`) as CommentsResponse;
      return data.comments || [];
    },
    enabled: !!podcastId,
  });
};

// Get podcast reviews
export const usePodcastReviews = (podcastId: string) => {
  return useQuery({
    queryKey: ['podcasts', podcastId, 'reviews'],
    queryFn: async () => {
      const data = await apiClient.request(`/podcasts/${podcastId}/reviews`) as ReviewsResponse;
      return data.reviews || [];
    },
    enabled: !!podcastId,
  });
};

// Create podcast
export const useCreatePodcast = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiClient.request('/podcasts', {
        method: 'POST',
        body: formData
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] })
      toast({
        title: 'Success',
        description: 'Podcast created successfully'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create podcast',
        variant: 'destructive'
      })
    }
  })
}

// Create episode
export const useCreateEpisode = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ podcastId, formData }: { podcastId: string, formData: FormData }) => {
      return await apiClient.request(`/podcasts/${podcastId}/episodes`, {
        method: 'POST',
        body: formData
      })
    },
    onSuccess: (_, { podcastId }) => {
      queryClient.invalidateQueries({ queryKey: ['podcasts', podcastId, 'episodes'] })
      queryClient.invalidateQueries({ queryKey: ['podcasts'] })
      toast({
        title: 'Success',
        description: 'Episode created successfully'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create episode',
        variant: 'destructive'
      })
    }
  })
}