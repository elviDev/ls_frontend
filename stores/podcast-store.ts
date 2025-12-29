import { create } from 'zustand';

export interface Podcast {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  genre?: {
    id: string;
    name: string;
  };
  episodes: Episode[];
  _count: {
    favorites: number;
    episodes: number;
  };
  status: string;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number;
  episodeNumber?: number;
  seasonNumber?: number;
  status: string;
  publishedAt?: string;
  createdAt: string;
}

export interface PodcastFilters {
  search: string;
  genre: string;
  status: 'all' | 'PUBLISHED' | 'DRAFT';
  sortBy: 'recent' | 'popular' | 'alphabetical';
  page: number;
  perPage: number;
}

interface PodcastStore {
  // State
  podcasts: Podcast[];
  currentPodcast: Podcast | null;
  currentEpisode: Episode | null;
  filters: PodcastFilters;
  favorites: string[];
  
  // Actions
  setPodcasts: (podcasts: Podcast[]) => void;
  setCurrentPodcast: (podcast: Podcast | null) => void;
  setCurrentEpisode: (episode: Episode | null) => void;
  setFilters: (filters: Partial<PodcastFilters>) => void;
  addToFavorites: (podcastId: string) => void;
  removeFromFavorites: (podcastId: string) => void;
  toggleFavorite: (podcastId: string) => void;
  resetFilters: () => void;
}

const defaultFilters: PodcastFilters = {
  search: '',
  genre: 'all',
  status: 'all',
  sortBy: 'recent',
  page: 1,
  perPage: 20,
};

export const usePodcastStore = create<PodcastStore>((set, get) => ({
  // Initial state
  podcasts: [],
  currentPodcast: null,
  currentEpisode: null,
  filters: defaultFilters,
  favorites: [],

  // Actions
  setPodcasts: (podcasts) => set({ podcasts }),
  
  setCurrentPodcast: (podcast) => set({ currentPodcast: podcast }),
  
  setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  
  addToFavorites: (podcastId) => set((state) => ({
    favorites: [...state.favorites.filter(id => id !== podcastId), podcastId],
  })),
  
  removeFromFavorites: (podcastId) => set((state) => ({
    favorites: state.favorites.filter(id => id !== podcastId),
  })),
  
  toggleFavorite: (podcastId) => {
    const { favorites } = get();
    if (favorites.includes(podcastId)) {
      get().removeFromFavorites(podcastId);
    } else {
      get().addToFavorites(podcastId);
    }
  },
  
  resetFilters: () => set({ filters: defaultFilters }),
}));