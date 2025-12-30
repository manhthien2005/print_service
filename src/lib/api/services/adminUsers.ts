import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

/**
 * Types for Admin User Management
 */
export interface AdminUserListItem {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  userType: 'student' | 'staff';
  accountStatus: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
  // Student specific fields
  studentId?: string;
  studentCode?: string;
  className?: string;
  majorName?: string;
  studentStatus?: 'active' | 'graduated' | 'suspended' | 'withdrawn';
  balance?: number; // Account balance
  createdAt: string; // ISO LocalDateTime string
  lastLoginAt?: string; // ISO LocalDateTime string
  // Additional fields for compatibility
  facultyName?: string;
  departmentName?: string;
  yearLevel?: number;
  enrollmentDate?: string;
}

export interface AdminUserListFilters {
  search?: string;
  userType?: 'student' | 'staff';
  accountStatus?: 'active' | 'inactive' | 'suspended' | 'all';
  studentStatus?: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'all';
  classId?: string; // UUID as string
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  // Note: faculty, yearLevel, enrollmentDateFrom/To are not supported by BE
  // These filters should be handled client-side if needed
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
 * Request/Response types for User Management
 */
export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  userType: 'student' | 'staff';
  studentCode?: string;
  classId?: string;
  enrollmentDate?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female'; // BE only accepts 'male' or 'female'
  citizenId?: string;
  address?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  citizenId?: string;
  address?: string;
  studentCode?: string;
  classId?: string;
  enrollmentDate?: string;
  studentStatus?: 'active' | 'graduated' | 'suspended' | 'withdrawn';
}

export interface AdminUserDetailResponse {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  citizenId?: string;
  address?: string;
  profilePicture?: string;
  emailVerified?: boolean;
  userType: 'student' | 'staff';
  accountStatus: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  // Student specific
  studentId?: string;
  studentCode?: string;
  enrollmentDate?: string;
  graduationDate?: string;
  studentStatus?: 'active' | 'graduated' | 'suspended' | 'withdrawn';
  // Class info
  classId?: string;
  classCode?: string;
  className?: string;
  yearLevel?: number;
  // Major info
  majorName?: string;
  majorCode?: string;
  // Department info
  departmentName?: string;
  // Faculty info
  facultyName?: string;
  // Balance info
  currentBalance?: number;
  totalDeposited?: number;
  totalSpent?: number;
}

export interface BalanceHistoryFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  direction?: 'IN' | 'OUT';
  sourceType?:
    | 'DEPOSIT'
    | 'PAYMENT'
    | 'REFUND'
    | 'ADJUSTMENT'
    | 'SEMESTER_BONUS';
}

export interface AdminBalanceHistoryResponse {
  ledgerId: string;
  amount: number;
  direction: 'IN' | 'OUT';
  sourceType: string;
  sourceTable: string;
  sourceId: string;
  description: string;
  createdAt: string;
  balanceAfter?: number;
}

export interface UserPrintStatsResponse {
  userId: string;
  studentId?: string;
  studentCode?: string;
  studentName: string;
  totalPrintJobs: number;
  totalPagesPrinted: number;
  totalAmountSpent: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  pendingJobs: number;
  colorPrintJobs: number;
  blackWhitePrintJobs: number;
  duplexPrintJobs: number;
  printJobsThisMonth: number;
  pagesThisMonth: number;
  amountThisMonth: number;
  lastPrintAt?: string;
  mostUsedPrinterId?: string;
  mostUsedPrinterName?: string;
}

/**
 * Balance Management Types
 */
export interface UserBalanceResponse {
  userId: string;
  studentId?: string;
  studentCode?: string;
  fullName: string;
  email: string;
  currentBalance: number;
  totalDeposited: number;
  totalSpent: number;
  totalBonus: number;
  totalRefunded: number;
  totalAdjustment: number;
  lastUpdatedAt?: string;
}

export interface BalanceTransactionRequest {
  amount: number;
  reason: string;
  referenceCode?: string;
}

export interface BalanceTransactionResponse {
  transactionId: string;
  studentId?: string;
  studentCode?: string;
  fullName: string;
  direction: 'IN' | 'OUT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  referenceCode?: string;
  transactionAt: string;
  performedBy: string;
  performedByName?: string;
}

/**
 * Reset Password Types
 */
export interface AdminResetPasswordRequest {
  newPassword?: string;
  sendEmail?: boolean;
}

export interface AdminResetPasswordResponse {
  userId: string;
  email: string;
  fullName: string;
  temporaryPassword?: string;
  emailSent: boolean;
  resetAt: string;
  resetBy: string;
}

/**
 * Response types for User List with Global Stats
 */
export interface UserGlobalStatsResponse {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  activeStudents: number;
  graduatedStudents: number;
  withdrawnStudents: number;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UserListWithStatsResponse {
  globalStats: UserGlobalStatsResponse;
  users: AdminUserListItem[];
  pagination: PaginationMetadata;
}

/**
 * Update Account Status Request/Response
 */
export interface UpdateAccountStatusRequest {
  accountStatus: 'active' | 'inactive' | 'suspended';
  reason?: string;
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
 * Returns UserListWithStatsResponse which includes global stats and paginated users
 */
export function useAdminUsers(filters?: AdminUserListFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.userType) queryParams.append('userType', filters.userType);
  if (filters?.accountStatus && filters.accountStatus !== 'all')
    queryParams.append('accountStatus', filters.accountStatus);
  if (filters?.studentStatus && filters.studentStatus !== 'all')
    queryParams.append('studentStatus', filters.studentStatus);
  if (filters?.classId) queryParams.append('classId', filters.classId);
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters?.sortDirection)
    queryParams.append('sortDirection', filters.sortDirection);
  if (filters?.page !== undefined)
    queryParams.append('page', filters.page.toString());
  if (filters?.limit !== undefined)
    queryParams.append('limit', filters.limit.toString());

  // Note: faculty, yearLevel, enrollmentDateFrom/To are not supported by BE
  // These should be filtered client-side if needed

  const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<ApiResponse<UserListWithStatsResponse>>(
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

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<AdminUserDetailResponse>,
    CreateUserRequest
  >('/admin/users', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

/**
 * Hook to update user information
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<AdminUserDetailResponse>,
    { userId: string; data: UpdateUserRequest }
  >('/admin/users', 'put', {
    mutationFn: ({ userId, data }) => {
      return apiClient.put<ApiResponse<AdminUserDetailResponse>>(
        `/admin/users/${userId}`,
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.detail(variables.userId),
      });
    },
  });
}

/**
 * Hook to delete a user (soft delete)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, string>('/admin/users', 'delete', {
    mutationFn: (userId: string) => {
      return apiClient.delete<ApiResponse<void>>(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

/**
 * Hook to get user detail by ID
 */
export function useGetUserDetail(userId: string | null) {
  return useApiQuery<ApiResponse<AdminUserDetailResponse>>(
    adminUserKeys.detail(userId || ''),
    userId ? `/admin/users/${userId}` : '',
    {
      enabled: !!userId,
    }
  );
}

/**
 * Hook to get balance history for a user
 */
export function useBalanceHistory(
  userId: string | null,
  filters?: BalanceHistoryFilters
) {
  const queryParams = new URLSearchParams();
  if (filters?.page !== undefined)
    queryParams.append('page', filters.page.toString());
  if (filters?.limit !== undefined)
    queryParams.append('limit', filters.limit.toString());
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.direction) queryParams.append('direction', filters.direction);
  if (filters?.sourceType) queryParams.append('sourceType', filters.sourceType);

  const url = userId
    ? `/admin/users/${userId}/balance/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    : '';

  return useApiQuery<PaginatedApiResponse<AdminBalanceHistoryResponse>>(
    adminUserKeys.balanceHistory(
      userId || '',
      (filters || {}) as Record<string, unknown>
    ),
    url,
    {
      enabled: !!userId,
    }
  );
}

/**
 * Hook to get print statistics for a user
 */
export function usePrintStats(userId: string | null) {
  return useApiQuery<ApiResponse<UserPrintStatsResponse>>(
    adminUserKeys.printStats(userId || ''),
    userId ? `/admin/users/${userId}/print-stats` : '',
    {
      enabled: !!userId,
    }
  );
}

/**
 * Hook to get user balance
 */
export function useGetBalance(userId: string | null) {
  return useApiQuery<ApiResponse<UserBalanceResponse>>(
    adminUserKeys.balance(userId || ''),
    userId ? `/admin/users/${userId}/balance` : '',
    {
      enabled: !!userId,
    }
  );
}

/**
 * Hook to credit balance (add money)
 */
export function useCreditBalance() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<BalanceTransactionResponse>,
    { userId: string; data: BalanceTransactionRequest }
  >('/admin/users', 'post', {
    mutationFn: ({ userId, data }) => {
      return apiClient.post<ApiResponse<BalanceTransactionResponse>>(
        `/admin/users/${userId}/balance/in`,
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.balance(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.balanceHistory(variables.userId, {}),
      });
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.detail(variables.userId),
      });
    },
  });
}

/**
 * Hook to debit balance (subtract money)
 */
export function useDebitBalance() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<BalanceTransactionResponse>,
    { userId: string; data: BalanceTransactionRequest }
  >('/admin/users', 'post', {
    mutationFn: ({ userId, data }) => {
      return apiClient.post<ApiResponse<BalanceTransactionResponse>>(
        `/admin/users/${userId}/balance/out`,
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.balance(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.balanceHistory(variables.userId, {}),
      });
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.detail(variables.userId),
      });
    },
  });
}

/**
 * Hook to reset user password
 */
export function useResetPassword() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<AdminResetPasswordResponse>,
    { userId: string; data: AdminResetPasswordRequest }
  >('/admin/users', 'post', {
    mutationFn: ({ userId, data }) => {
      return apiClient.post<ApiResponse<AdminResetPasswordResponse>>(
        `/admin/users/${userId}/reset-password`,
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.detail(variables.userId),
      });
    },
  });
}

/**
 * Hook to update account status for a single user
 */
export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<AdminUserDetailResponse>,
    { userId: string; data: UpdateAccountStatusRequest }
  >('/admin/users', 'put', {
    mutationFn: ({ userId, data }) => {
      return apiClient.put<ApiResponse<AdminUserDetailResponse>>(
        `/admin/users/${userId}/account-status`,
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.detail(variables.userId),
      });
    },
  });
}
