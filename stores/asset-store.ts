import { create } from 'zustand';

export interface Asset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
  url: string;
  description?: string;
  tags?: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    broadcasts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AssetFilters {
  type: 'all' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
  search: string;
  page: number;
  perPage: number;
}

export interface AssetPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface AssetStore {
  // State
  assets: Asset[];
  filters: AssetFilters;
  pagination: AssetPagination;
  selectedAssets: string[];
  
  // Actions
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  setFilters: (filters: Partial<AssetFilters>) => void;
  setPagination: (pagination: AssetPagination) => void;
  toggleAssetSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  resetFilters: () => void;
}

const defaultFilters: AssetFilters = {
  type: 'all',
  search: '',
  page: 1,
  perPage: 20,
};

const defaultPagination: AssetPagination = {
  page: 1,
  perPage: 20,
  total: 0,
  totalPages: 0,
};

export const useAssetStore = create<AssetStore>((set, get) => ({
  // Initial state
  assets: [],
  filters: defaultFilters,
  pagination: defaultPagination,
  selectedAssets: [],

  // Actions
  setAssets: (assets) => set({ assets }),
  
  addAsset: (asset) => set((state) => ({
    assets: [asset, ...state.assets],
  })),
  
  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map((asset) =>
      asset.id === id ? { ...asset, ...updates } : asset
    ),
  })),
  
  removeAsset: (id) => set((state) => ({
    assets: state.assets.filter((asset) => asset.id !== id),
    selectedAssets: state.selectedAssets.filter((assetId) => assetId !== id),
  })),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  
  setPagination: (pagination) => set({ pagination }),
  
  toggleAssetSelection: (id) => set((state) => ({
    selectedAssets: state.selectedAssets.includes(id)
      ? state.selectedAssets.filter((assetId) => assetId !== id)
      : [...state.selectedAssets, id],
  })),
  
  clearSelection: () => set({ selectedAssets: [] }),
  
  selectAll: () => set((state) => ({
    selectedAssets: state.assets.map((asset) => asset.id),
  })),
  
  resetFilters: () => set({
    filters: defaultFilters,
    pagination: defaultPagination,
  }),
}));