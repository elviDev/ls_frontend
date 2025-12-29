import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  profileImage?: string;
  isActive: boolean;
  isSuspended: boolean;
  suspendedAt?: string;
  suspendedReason?: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  activityCount: number;
  joinedAt: string;
  lastActive: string;
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  verified: number;
  newUsers: number;
  activeLastMonth: number;
  unverified: number;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  users: User[];
  stats: UserStats;
  pagination: Pagination;
}

export interface UserFilters {
  search: string;
  isActive: string;
  isSuspended: string;
  emailVerified: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  perPage: number;
}

export interface UserUpdateResponse {
  user: User;
  message?: string;
}

export interface UserDeleteResponse {
  message: string;
}

export const useUsers = (filters: UserFilters = {
  search: '',
  isActive: '',
  isSuspended: '',
  emailVerified: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  perPage: 50
}) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async (): Promise<UsersResponse> => {
      const params = {
        page: filters.page.toString(),
        perPage: filters.perPage.toString(),
        search: filters.search,
        isActive: filters.isActive,
        isSuspended: filters.isSuspended,
        emailVerified: filters.emailVerified,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      return await apiClient.admin.users(params) as UsersResponse;
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserUpdateResponse, Error, { userId: string; suspend: boolean; reason?: string }>({
    mutationFn: async ({ userId, suspend, reason }: { userId: string; suspend: boolean; reason?: string }) => {
      return await apiClient.request<UserUpdateResponse>(`/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isSuspended: suspend,
          suspendedReason: reason,
        }),
      });
    },
    onSuccess: (response, { suspend }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: `User ${suspend ? "suspended" : "unsuspended"} successfully`,
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserDeleteResponse, Error, string>({
    mutationFn: async (userId: string) => {
      return await apiClient.request<UserDeleteResponse>(`/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
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

export const useSearchUser = () => {
  return useMutation<User | null, Error, string>({
    mutationFn: async (email: string) => {
      const response = await apiClient.request<{ user?: User }>(`/users/search?email=${encodeURIComponent(email)}`);
      return response.user || null;
    },
  });
};