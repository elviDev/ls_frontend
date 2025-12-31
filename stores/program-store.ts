import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ProgramCategory;
  schedule: string;
  image?: string;
  status: ProgramStatus;
  hostId: string;
  genreId?: string;
  createdAt: string;
  updatedAt: string;
  host: {
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
  _count: {
    episodes: number;
    broadcasts: number;
  };
  episodes?: ProgramEpisode[];
}

export interface CreateEpisodeData {
  title: string;
  description?: string;
  airDate: string;
  broadcastId?: string;
}

export interface ProgramEpisode {
  id: string;
  title: string;
  description?: string;
  audioFile?: string;
  duration?: number;
  airDate: string;
  programId: string;
  broadcastId?: string;
  createdAt: string;
  updatedAt: string;
  broadcast?: {
    id: string;
    status: string;
    startTime: string;
    endTime?: string;
  };
}

export enum ProgramCategory {
  TALK_SHOW = 'TALK_SHOW',
  MUSIC = 'MUSIC',
  TECHNOLOGY = 'TECHNOLOGY',
  BUSINESS = 'BUSINESS',
  INTERVIEW = 'INTERVIEW',
  SPORTS = 'SPORTS',
  NEWS = 'NEWS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  EDUCATION = 'EDUCATION'
}

export enum ProgramStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface ProgramQuery {
  category?: ProgramCategory;
  status?: ProgramStatus;
  hostId?: string;
  genreId?: string;
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export interface ProgramAnalytics {
  episodes: {
    total: number;
    totalDuration: number;
    averageDuration: number;
  };
  broadcasts: {
    total: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    airDate: string;
    duration?: number;
    broadcast?: {
      status: string;
    };
  }>;
}

interface ProgramState {
  // Data state
  programs: Program[];
  currentProgram: Program | null;
  currentEpisode: ProgramEpisode | null;
  analytics: ProgramAnalytics | null;
  loading: boolean;
  error: string | null;
  
  // Hook instances (for internal use)
  _createEpisodeMutation: any;
  _updateEpisodeMutation: any;
  _deleteEpisodeMutation: any;
  _linkBroadcastMutation: any;
  
  // Data actions
  setPrograms: (programs: Program[]) => void;
  addProgram: (program: Program) => void;
  updateProgram: (id: string, program: Partial<Program>) => void;
  removeProgram: (id: string) => void;
  setCurrentProgram: (program: Program | null) => void;
  setCurrentEpisode: (episode: ProgramEpisode | null) => void;
  setAnalytics: (analytics: ProgramAnalytics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Hook setters (called from components)
  setMutations: (mutations: {
    createEpisode: any;
    updateEpisode: any;
    deleteEpisode: any;
    linkBroadcast: any;
  }) => void;
  
  // Episode actions using hooks
  addEpisode: (programId: string, episode: ProgramEpisode) => void;
  createEpisode: (programId: string, episodeData: CreateEpisodeData) => void;
  updateEpisode: (programId: string, episodeId: string, episode: Partial<ProgramEpisode>) => void;
  removeEpisode: (programId: string, episodeId: string) => void;
  linkEpisodeToBroadcast: (programId: string, episodeId: string, broadcastId: string) => void;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      // Data state
      programs: [],
      currentProgram: null,
      currentEpisode: null,
      analytics: null,
      loading: false,
      error: null,
      
      // Hook instances
      _createEpisodeMutation: null,
      _updateEpisodeMutation: null,
      _deleteEpisodeMutation: null,
      _linkBroadcastMutation: null,
      
      // Data actions
      setPrograms: (programs) => set({ programs }),
      addProgram: (program) => set((state) => ({ 
        programs: [...state.programs, program] 
      })),
      updateProgram: (id, updatedProgram) => set((state) => ({
        programs: state.programs.map(program => 
          program.id === id ? { ...program, ...updatedProgram } : program
        ),
        currentProgram: state.currentProgram?.id === id 
          ? { ...state.currentProgram, ...updatedProgram } 
          : state.currentProgram
      })),
      removeProgram: (id) => set((state) => ({
        programs: state.programs.filter(program => program.id !== id),
        currentProgram: state.currentProgram?.id === id ? null : state.currentProgram
      })),
      setCurrentProgram: (program) => set({ currentProgram: program }),
      setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
      setAnalytics: (analytics) => set({ analytics }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // Hook setters
      setMutations: (mutations) => {
        const currentState = get();
        // Only update if mutations actually changed
        if (currentState._createEpisodeMutation !== mutations.createEpisode ||
            currentState._updateEpisodeMutation !== mutations.updateEpisode ||
            currentState._deleteEpisodeMutation !== mutations.deleteEpisode ||
            currentState._linkBroadcastMutation !== mutations.linkBroadcast) {
          set({
            _createEpisodeMutation: mutations.createEpisode,
            _updateEpisodeMutation: mutations.updateEpisode,
            _deleteEpisodeMutation: mutations.deleteEpisode,
            _linkBroadcastMutation: mutations.linkBroadcast,
          });
        }
      },
      
      // Episode actions using hooks
      addEpisode: (programId, episode) => set((state) => ({
        programs: state.programs.map(program => 
          program.id === programId 
            ? { ...program, episodes: [...(program.episodes || []), episode] }
            : program
        ),
        currentProgram: state.currentProgram?.id === programId
          ? { ...state.currentProgram, episodes: [...(state.currentProgram.episodes || []), episode] }
          : state.currentProgram
      })),
      
      createEpisode: (programId, episodeData) => {
        const state = get();
        if (state._createEpisodeMutation) {
          state._createEpisodeMutation.mutate({ programId, data: episodeData });
        }
      },
      
      updateEpisode: (programId, episodeId, updatedEpisode) => {
        const state = get();
        if (state._updateEpisodeMutation) {
          state._updateEpisodeMutation.mutate({ programId, episodeId, data: updatedEpisode });
        }
      },
      
      removeEpisode: (programId, episodeId) => {
        const state = get();
        if (state._deleteEpisodeMutation) {
          state._deleteEpisodeMutation.mutate({ programId, episodeId });
        }
      },
      
      linkEpisodeToBroadcast: (programId, episodeId, broadcastId) => {
        const state = get();
        if (state._linkBroadcastMutation) {
          state._linkBroadcastMutation.mutate({ programId, episodeId, broadcastId });
        }
      },
      
      // Utility actions
      clearError: () => set({ error: null }),
      reset: () => set({
        programs: [],
        currentProgram: null,
        currentEpisode: null,
        analytics: null,
        loading: false,
        error: null
      })
    }),
    {
      name: 'program-storage',
      partialize: (state) => ({
        // Only persist minimal data
      }),
    }
  )
);