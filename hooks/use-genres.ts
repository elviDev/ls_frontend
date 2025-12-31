import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface GenresResponse {
  genres: Genre[];
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