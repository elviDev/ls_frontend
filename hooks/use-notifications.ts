import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  userId: string | null;
  staffId: string | null;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  notifications: Notification[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const useNotifications = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: async (): Promise<NotificationListResponse> => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      const qs = query.toString();
      return apiClient.request<NotificationListResponse>(`/notifications${qs ? `?${qs}` : ""}`);
    },
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => apiClient.request<{ count: number }>("/notifications/unread-count"),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) =>
      apiClient.request(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => apiClient.request(`/notifications/read-all`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) =>
      apiClient.request(`/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};
