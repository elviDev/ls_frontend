import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Audiobook {
  id: string;
  title: string;
  slug: string;
  narrator: string;
  description: string;
  coverImage: string;
  duration: number;
  releaseDate: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  playCount: number;
  likeCount: number;
  isbn?: string;
  publisher?: string;
  language: string;
  tags?: string;
  price?: number;
  currency: string;
  isExclusive: boolean;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  genreId: string;
  averageRating?: number;
  isFavorited?: boolean;
  isBookmarked?: boolean;
  userBookmarks?: Array<{
    id: string;
    position: number;
    createdAt: string;
  }>;
  playbackProgress?: Array<{
    position: number;
    updatedAt: string;
    chapterId?: string;
  }>;
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
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    bio?: string;
  };
  genre: {
    id: string;
    name: string;
  };
  _count: {
    chapters: number;
    comments: number;
    reviews: number;
    favorites: number;
    bookmarks: number;
    playbackProgress?: number;
  };
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  audioFile: string;
  duration: number;
  trackNumber: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  playCount: number;
  description?: string;
  transcript?: string;
  audiobookId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudiobookStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalChapters: number;
  totalDuration: number;
  totalPlays: number;
  averageRating: number;
  topGenres: Array<{ name: string; count: number }>;
}

export interface AudiobookQuery {
  featured?: boolean;
  limit?: number;
  genreId?: string;
  author?: string;
  language?: string;
  status?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export interface Review {
  id: string;
  rating: number;
  content?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface AudiobookState {
  // Player state
  currentAudiobook: Audiobook | null;
  currentChapter: Chapter | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  playbackSpeed: number;
  
  // Data state
  audiobooks: Audiobook[];
  stats: AudiobookStats | null;
  comments: Comment[];
  reviews: Review[];
  loading: boolean;
  error: string | null;
  
  // Player actions
  setCurrentAudiobook: (audiobook: Audiobook | null) => void;
  setCurrentChapter: (chapter: Chapter | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  
  // Data actions
  setAudiobooks: (audiobooks: Audiobook[]) => void;
  addAudiobook: (audiobook: Audiobook) => void;
  updateAudiobook: (id: string, audiobook: Partial<Audiobook>) => void;
  removeAudiobook: (id: string) => void;
  setStats: (stats: AudiobookStats) => void;
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Chapter actions
  addChapter: (audiobookId: string, chapter: Chapter) => void;
  updateChapter: (audiobookId: string, chapterId: string, chapter: Partial<Chapter>) => void;
  removeChapter: (audiobookId: string, chapterId: string) => void;
  
  // Utility actions
  toggleFavorite: (audiobookId: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useAudiobookStore = create<AudiobookState>()(
  persist(
    (set, get) => ({
      // Player state
      currentAudiobook: null,
      currentChapter: null,
      isPlaying: false,
      currentTime: 0,
      volume: 1,
      playbackSpeed: 1,
      
      // Data state
      audiobooks: [],
      stats: null,
      comments: [],
      reviews: [],
      loading: false,
      error: null,
      
      // Player actions
      setCurrentAudiobook: (audiobook) => set({ currentAudiobook: audiobook }),
      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setVolume: (volume) => set({ volume }),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      
      // Data actions
      setAudiobooks: (audiobooks) => set({ audiobooks }),
      addAudiobook: (audiobook) => set((state) => ({ 
        audiobooks: [...state.audiobooks, audiobook] 
      })),
      updateAudiobook: (id, updatedAudiobook) => set((state) => ({
        audiobooks: state.audiobooks.map(book => 
          book.id === id ? { ...book, ...updatedAudiobook } : book
        ),
        currentAudiobook: state.currentAudiobook?.id === id 
          ? { ...state.currentAudiobook, ...updatedAudiobook } 
          : state.currentAudiobook
      })),
      removeAudiobook: (id) => set((state) => ({
        audiobooks: state.audiobooks.filter(book => book.id !== id),
        currentAudiobook: state.currentAudiobook?.id === id ? null : state.currentAudiobook
      })),
      setStats: (stats) => set({ stats }),
      setComments: (comments) => set({ comments }),
      addComment: (comment) => set((state) => ({ 
        comments: [...state.comments, comment] 
      })),
      setReviews: (reviews) => set({ reviews }),
      addReview: (review) => set((state) => ({ 
        reviews: [...state.reviews, review] 
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // Chapter actions
      addChapter: (audiobookId, chapter) => set((state) => ({
        audiobooks: state.audiobooks.map(book => 
          book.id === audiobookId 
            ? { ...book, chapters: [...(book.chapters || []), chapter] }
            : book
        ),
        currentAudiobook: state.currentAudiobook?.id === audiobookId
          ? { ...state.currentAudiobook, chapters: [...(state.currentAudiobook.chapters || []), chapter] }
          : state.currentAudiobook
      })),
      updateChapter: (audiobookId, chapterId, updatedChapter) => set((state) => ({
        audiobooks: state.audiobooks.map(book => 
          book.id === audiobookId 
            ? { 
                ...book, 
                chapters: book.chapters?.map(ch => 
                  ch.id === chapterId ? { ...ch, ...updatedChapter } : ch
                ) 
              }
            : book
        ),
        currentAudiobook: state.currentAudiobook?.id === audiobookId
          ? {
              ...state.currentAudiobook,
              chapters: state.currentAudiobook.chapters?.map(ch => 
                ch.id === chapterId ? { ...ch, ...updatedChapter } : ch
              )
            }
          : state.currentAudiobook,
        currentChapter: state.currentChapter?.id === chapterId
          ? { ...state.currentChapter, ...updatedChapter }
          : state.currentChapter
      })),
      removeChapter: (audiobookId, chapterId) => set((state) => ({
        audiobooks: state.audiobooks.map(book => 
          book.id === audiobookId 
            ? { ...book, chapters: book.chapters?.filter(ch => ch.id !== chapterId) }
            : book
        ),
        currentAudiobook: state.currentAudiobook?.id === audiobookId
          ? { ...state.currentAudiobook, chapters: state.currentAudiobook.chapters?.filter(ch => ch.id !== chapterId) }
          : state.currentAudiobook,
        currentChapter: state.currentChapter?.id === chapterId ? null : state.currentChapter
      })),
      
      // Utility actions
      toggleFavorite: (audiobookId) => set((state) => ({
        audiobooks: state.audiobooks.map(book => 
          book.id === audiobookId 
            ? { 
                ...book, 
                _count: { 
                  ...book._count, 
                  favorites: book._count.favorites + (Math.random() > 0.5 ? 1 : -1) 
                } 
              }
            : book
        )
      })),
      clearError: () => set({ error: null }),
      reset: () => set({
        audiobooks: [],
        stats: null,
        comments: [],
        reviews: [],
        loading: false,
        error: null
      })
    }),
    {
      name: 'audiobook-storage',
      partialize: (state) => ({
        volume: state.volume,
        playbackSpeed: state.playbackSpeed,
      }),
    }
  )
);