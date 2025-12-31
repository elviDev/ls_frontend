import { create } from "zustand";

export interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  image?: string;
  coverImage?: string;
  hostId?: string; // Host ID field for consistency
  host?: { // Full host data from relation
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    role: string;
  };
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  genreId: string;
  tags?: string;
  isFavorited?: boolean;
  isBookmarked?: boolean;
  userBookmarks?: Array<{
    id: string;
    position: number;
    createdAt: string;
  }>;
  playbackProgress?: {
    position: number;
    updatedAt: string;
  };
  userReview?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  };
  recentReviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: { name: string };
  }>;
  recentComments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string };
  }>;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    bio?: string;
  };
  genre?: {
    id: string;
    name: string;
  };
  episodes?: PodcastEpisode[]; // Episodes array for detailed view
  stats?: {
    episodes: number;
    favorites: number;
  };
  latestEpisode?: {
    id: string;
    title: string;
    duration?: number;
    publishedAt?: string;
  };
  _count?: {
    episodes: number;
    favorites: number;
    comments: number;
    reviews: number;
    bookmarks: number;
  };
}

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  title: string;
  description?: string;
  episodeNumber: number;
  audioFile: string;
  duration?: number;
  publishedAt?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  transcript?: string;
  transcriptFile?: string;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
  playbackProgress?: {
    position: number;
    updatedAt: string;
  };
  podcast?: {
    id: string;
    title: string;
    host?: string;
    author?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  _count?: {
    comments: number;
    favorites: number;
    playbackProgress: number;
  };
}

export interface PodcastQuery {
  featured?: boolean;
  limit?: number;
  category?: string;
  genreId?: string;
  search?: string;
  status?: string;
  dashboard?: boolean;
}

interface PodcastStore {
  // State
  podcasts: Podcast[];
  currentPodcast: Podcast | null;
  currentEpisode: PodcastEpisode | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPodcasts: (podcasts: Podcast[]) => void;
  setCurrentPodcast: (podcast: Podcast | null) => void;
  setCurrentEpisode: (episode: PodcastEpisode | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD operations using hooks
  createPodcast: (data: FormData | any) => Promise<void>;
  updatePodcast: (id: string, data: FormData | any) => Promise<void>;
  deletePodcast: (id: string) => Promise<void>;
  createEpisode: (podcastId: string, data: FormData | any) => Promise<void>;
  updateEpisode: (episodeId: string, data: FormData | any) => Promise<void>;
  deleteEpisode: (episodeId: string) => Promise<void>;
  toggleFavorite: (podcastId: string) => Promise<void>;
}

export const usePodcastStore = create<PodcastStore>((set, get) => ({
  // Initial state
  podcasts: [],
  currentPodcast: null,
  currentEpisode: null,
  isLoading: false,
  error: null,

  // Basic setters
  setPodcasts: (podcasts) => set({ podcasts }),
  setCurrentPodcast: (podcast) => set({ currentPodcast: podcast }),
  setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // CRUD operations - these should be called from components using the hooks
  createPodcast: async (data) => {
    // This should be handled by components using useCreatePodcast hook
    throw new Error("Use useCreatePodcast hook in components instead");
  },

  updatePodcast: async (id, data) => {
    // This should be handled by components using useUpdatePodcast hook
    throw new Error("Use useUpdatePodcast hook in components instead");
  },

  deletePodcast: async (id) => {
    // This should be handled by components using useDeletePodcast hook
    throw new Error("Use useDeletePodcast hook in components instead");
  },

  createEpisode: async (podcastId, data) => {
    // This should be handled by components using useCreateEpisode hook
    throw new Error("Use useCreateEpisode hook in components instead");
  },

  updateEpisode: async (episodeId, data) => {
    // This should be handled by components using useUpdateEpisode hook
    throw new Error("Use useUpdateEpisode hook in components instead");
  },

  deleteEpisode: async (episodeId) => {
    // This should be handled by components using useDeleteEpisode hook
    throw new Error("Use useDeleteEpisode hook in components instead");
  },

  toggleFavorite: async (podcastId) => {
    // This should be handled by components using useTogglePodcastFavorite hook
    throw new Error("Use useTogglePodcastFavorite hook in components instead");
  },
}));
