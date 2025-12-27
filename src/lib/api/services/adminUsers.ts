import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Types for Admin User Management
 */
export interface AdminUserListItem {
  userId: string;
  studentCode?: string;
  fullName: string;
  email: string;
  facultyName?: string;
  departmentName?: string;
  majorName?: string;
  className?: string;
  yearLevel?: number;
  accountStatus: 'active' | 'inactive' | 'suspended';
  studentStatus?: 'active' | 'graduated' | 'suspended' | 'withdrawn';
  enrollmentDate?: string;
  userType: 'student' | 'staff';
}

export interface AdminUserListFilters {
  search?: string;
  accountStatus?: 'active' | 'inactive' | 'suspended' | 'all';
  studentStatus?: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'all';
  faculty?: string;
  yearLevel?: string;
  enrollmentDateFrom?: string;
  enrollmentDateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BulkAccountStatusRequest {
  userIds: string[];
  accountStatus: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

export interface BulkAccountStatusResult {
  userId: string;
  email: string;
  fullName: string;
  oldStatus: string;
  newStatus: string;
  success: boolean;
  errorMessage: string | null;
}

export interface BulkAccountStatusResponse {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  newStatus: string;
  results: BulkAccountStatusResult[];
  updatedAt: string;
  updatedBy: string;
}

/**
 * Query key factory for admin users
 */
export const adminUserKeys = {
  all: ['adminUsers'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params: AdminUserListFilters) =>
    [...adminUserKeys.lists(), params] as const,
  detail: (id: string) => [...adminUserKeys.all, 'detail', id] as const,
  balance: (id: string) => [...adminUserKeys.all, 'balance', id] as const,
  balanceHistory: (id: string, params?: Record<string, unknown>) =>
    [...adminUserKeys.all, 'balanceHistory', id, params] as const,
  printStats: (id: string) => [...adminUserKeys.all, 'printStats', id] as const,
};

/**
 * Hook to fetch users with filters
 */
export function useAdminUsers(filters?: AdminUserListFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.accountStatus && filters.accountStatus !== 'all')
    queryParams.append('accountStatus', filters.accountStatus);
  if (filters?.studentStatus && filters.studentStatus !== 'all')
    queryParams.append('studentStatus', filters.studentStatus);
  if (filters?.faculty) queryParams.append('faculty', filters.faculty);
  if (filters?.yearLevel) queryParams.append('yearLevel', filters.yearLevel);
  if (filters?.enrollmentDateFrom)
    queryParams.append('enrollmentDateFrom', filters.enrollmentDateFrom);
  if (filters?.enrollmentDateTo)
    queryParams.append('enrollmentDateTo', filters.enrollmentDateTo);
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters?.sortDirection)
    queryParams.append('sortDirection', filters.sortDirection);
  if (filters?.page !== undefined)
    queryParams.append('page', filters.page.toString());
  if (filters?.limit !== undefined)
    queryParams.append('limit', filters.limit.toString());

  const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<AdminUserListItem>>(
    adminUserKeys.list(filters || {}),
    url
  );
}

/**
 * Hook to bulk update account status
 */
export function useBulkUpdateAccountStatus() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<BulkAccountStatusResponse>,
    BulkAccountStatusRequest
  >('/admin/users/bulk-account-status', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}
