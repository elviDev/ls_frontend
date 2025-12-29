import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  profileImage?: string | null;
  userType: 'user' | 'staff';
  role?: string;
  isApproved?: boolean;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
  hasRole: (roles: string | string[]) => boolean;
  isStaff: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),

      logout: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      hasRole: (roles) => {
        const { user } = get();
        if (!user || user.userType !== 'staff' || !user.role) return false;

        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },

      isStaff: () => {
        const { user } = get();
        return user?.userType === 'staff' && !!user.isApproved;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.userType === 'staff' && user.role === 'ADMIN';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);