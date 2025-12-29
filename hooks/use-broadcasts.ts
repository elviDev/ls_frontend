import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export interface Broadcast {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'LIVE' | 'SCHEDULED' | 'READY' | 'ENDED';
  hostId: string;
  programId?: string;
  bannerId?: string;
  staff: { userId: string; role: string }[];
  guests: { name: string; title: string; role: string }[];
  hostUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  program?: {
    id: string;
    title: string;
  };
  banner?: {
    id: string;
    url: string;
  };
  slug: string;
}

export interface BroadcastFormData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  hostId: string;
  programId?: string;
  bannerId?: string;
  staff: { userId: string; role: string }[];
  guests: { name: string; title: string; role: string }[];
}

export interface BroadcastFilters {
  status: 'all' | 'LIVE' | 'SCHEDULED' | 'READY' | 'ENDED';
  program: string;
  search: string;
}

export const useBroadcasts = (params?: any) => {
  const [filters, setFilters] = useState<BroadcastFilters>({
    status: 'all',
    program: 'all',
    search: ''
  });

  const query = useQuery({
    queryKey: ["broadcasts", params, filters],
    queryFn: async (): Promise<Broadcast[]> => {
      const queryParams = new URLSearchParams();
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.program !== 'all') queryParams.append('programId', filters.program);
      if (filters.search) queryParams.append('search', filters.search);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, String(value));
        });
      }
      
      const response = await apiClient.broadcasts.getAll(queryParams.toString() ? `?${queryParams.toString()}` : '');
      
      // Handle different response structures
      const data = response as any;
      if (Array.isArray(data)) {
        return data;
      } else if (data.broadcasts && Array.isArray(data.broadcasts)) {
        return data.broadcasts;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      return [];
    },
  });

  return {
    ...query,
    filters,
    setFilters
  };
};

export const useCurrentBroadcast = () => {
  return useQuery({
    queryKey: ["broadcasts", "current"],
    queryFn: async () => {
      return await apiClient.broadcasts.getCurrent();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUploadAsset = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, type, description }: { file: File; type: string; description?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (description) {
        formData.append('description', description);
      }

      return await apiClient.request('/assets', {
        method: 'POST',
        body: formData
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BroadcastFormData) => {
      return await apiClient.broadcasts.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      toast({
        title: "Success",
        description: "Broadcast created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useBroadcastById = (id: string) => {
  return useQuery({
    queryKey: ["broadcasts", id],
    queryFn: async (): Promise<Broadcast> => {
      return await apiClient.broadcasts.getById(id) as Broadcast;
    },
    enabled: !!id,
  });
};

export const useUpdateBroadcast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BroadcastFormData> }) => {
      return await apiClient.broadcasts.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      queryClient.invalidateQueries({ queryKey: ["broadcasts", id] });
      toast({
        title: "Success",
        description: "Broadcast updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBroadcast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.request(`/broadcasts/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      toast({
        title: "Success",
        description: "Broadcast deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useStartBroadcast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.request(`/broadcasts/${id}/start`, { method: 'POST' });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      queryClient.invalidateQueries({ queryKey: ["broadcasts", id] });
      toast({
        title: "Success",
        description: "Broadcast started successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useEndBroadcast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.request(`/broadcasts/${id}/end`, { method: 'POST' });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      queryClient.invalidateQueries({ queryKey: ["broadcasts", id] });
      toast({
        title: "Success",
        description: "Broadcast ended successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useBroadcastSettings = (id: string) => {
  return useQuery({
    queryKey: ["broadcasts", id, "settings"],
    queryFn: async () => {
      return await apiClient.request(`/broadcasts/${id}/settings`);
    },
    enabled: false, // Disable until backend implements this endpoint
  });
};

export const useUpdateBroadcastSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, settings }: { id: string; settings: any }) => {
      // Use the existing broadcast update endpoint instead of separate settings endpoint
      return await apiClient.broadcasts.update(id, settings);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts", id] });
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAddGuest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ broadcastId, guest }: { broadcastId: string; guest: { name: string; title?: string; role: string } }) => {
      return await apiClient.request(`/broadcasts/${broadcastId}/guests`, {
        method: 'POST',
        body: JSON.stringify(guest),
      });
    },
    onSuccess: (_, { broadcastId }) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts", broadcastId] });
      toast({
        title: "Success",
        description: "Guest added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRemoveGuest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ broadcastId, guestId }: { broadcastId: string; guestId: string }) => {
      return await apiClient.request(`/broadcasts/${broadcastId}/guests/${guestId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, { broadcastId }) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts", broadcastId] });
      toast({
        title: "Success",
        description: "Guest removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useStaff = () => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: () => apiClient.admin.staff(),
    select: (data: any) => data.staff || [],
  });
};

export const usePrograms = () => {
  return useQuery({
    queryKey: ["programs"],
    queryFn: () => apiClient.programs.getAll(),
    select: (data: any) => data.programs || [],
  });
};