import { create } from "zustand";

interface BaseFilters {
  search: string;
  isActive: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  perPage: number;
}

interface UserFilters extends BaseFilters {
  isSuspended: string;
  emailVerified: string;
}

interface StaffFilters extends BaseFilters {
  role: string;
  department: string;
}

type FilterStore<T extends BaseFilters> = {
  filters: T;
  setFilter: (key: keyof T, value: string | number) => void;
  setFilters: (filters: Partial<T>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
};

function createFilterStore<T extends BaseFilters>(defaultFilters: T) {
  return create<FilterStore<T>>((set) => ({
    filters: defaultFilters,
    setFilter: (key, value) =>
      set((state) => ({
        filters: { ...state.filters, [key]: value, page: key !== "page" ? 1 : Number(value) },
      })),
    setFilters: (newFilters) =>
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      })),
    resetFilters: () => set({ filters: defaultFilters }),
    setPage: (page) =>
      set((state) => ({
        filters: { ...state.filters, page },
      })),
  }));
}

const defaultUserFilters: UserFilters = {
  search: "",
  isActive: "all",
  isSuspended: "all",
  emailVerified: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  perPage: 10,
};

const defaultStaffFilters: StaffFilters = {
  search: "",
  isActive: "all",
  role: "all",
  department: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  perPage: 10,
};

export const useUserStore = createFilterStore(defaultUserFilters);
export const useStaffStore = createFilterStore(defaultStaffFilters);

export type { UserFilters, StaffFilters };