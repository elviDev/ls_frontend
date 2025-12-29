import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Asset, AssetFilters } from '@/stores/asset-store';

export interface AssetResponse {
  assets: Asset[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadAssetData {
  files: File[];
  description?: string;
  tags?: string;
}

// Get assets with filters
export const useAssets = (filters: AssetFilters = {
  page: 1,
  perPage: 20,
  search: '',
  type: 'all'
}) => {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: async (): Promise<AssetResponse> => {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        perPage: filters.perPage.toString(),
        search: filters.search,
      });
      
      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }
      
      const data = await apiClient.admin.assets(Object.fromEntries(params)) as any;
      return {
        assets: data.assets || [],
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

// Get single asset by ID
export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: async (): Promise<Asset> => {
      return await apiClient.request(`/assets/${id}`);
    },
    enabled: !!id,
  });
};

// Upload assets
export const useUploadAssets = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UploadAssetData) => {
      const formData = new FormData();
      
      data.files.forEach((file) => {
        formData.append('files', file);
      });
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.tags) {
        formData.append('tags', data.tags);
      }

      return await apiClient.request('/assets/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      
      if (variables.files.length === 1) {
        toast({
          title: 'Success',
          description: 'Asset uploaded successfully',
        });
      } else {
        const { successful, failed, total } = (result as any).summary || {};
        if (failed === 0) {
          toast({
            title: 'Success',
            description: `All ${total} files uploaded successfully`,
          });
        } else if (successful === 0) {
          toast({
            title: 'Error',
            description: `All ${total} file uploads failed`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Partial Success',
            description: `${successful} of ${total} files uploaded successfully`,
          });
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload assets',
        variant: 'destructive',
      });
    },
  });
};

// Update asset
export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Asset> }) => {
      return await apiClient.request(`/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', id] });
      toast({
        title: 'Success',
        description: 'Asset updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update asset',
        variant: 'destructive',
      });
    },
  });
};

// Delete asset
export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.request(`/assets/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Success',
        description: 'Asset deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete asset',
        variant: 'destructive',
      });
    },
  });
};

// Delete multiple assets
export const useDeleteAssets = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return await apiClient.request('/assets/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      const { successful, failed, total } = (result as any).summary || {};
      
      if (failed === 0) {
        toast({
          title: 'Success',
          description: `All ${total} assets deleted successfully`,
        });
      } else if (successful === 0) {
        toast({
          title: 'Error',
          description: `Failed to delete ${total} assets`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `${successful} of ${total} assets deleted successfully`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete assets',
        variant: 'destructive',
      });
    },
  });
};