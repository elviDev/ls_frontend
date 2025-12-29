import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { StaffFilters } from "@/stores/user-store";

export interface Staff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffResponse {
  staff: Staff[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export const useStaff = (filters: StaffFilters = {
  search: '',
  isActive: 'all',
  role: 'all',
  department: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  perPage: 50
}) => {
  return useQuery({
    queryKey: ["staff", filters],
    queryFn: async (): Promise<StaffResponse> => {
      const params = {
        page: filters.page.toString(),
        perPage: filters.perPage.toString(),
        search: filters.search,
        isActive: filters.isActive,
        role: filters.role,
        department: filters.department,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      return await apiClient.admin.staff(params) as StaffResponse;
    },
  });
};