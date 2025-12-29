import { useApiQuery } from '@/lib/hooks';
import type { PaginatedApiResponse } from '@/types/api';

/**
 * Types for Admin Transaction History Management
 */

export type TransactionDirection = 'IN' | 'OUT';

export type TransactionSourceType =
  | 'DEPOSIT'
  | 'SEMESTER_BONUS'
  | 'PAYMENT'
  | 'REFUND';

export interface AdminTransactionHistoryItem {
  ledgerId: string; // UUID
  createdAt: string; // ISO LocalDateTime
  amount: number; // Positive for IN, negative for OUT
  direction: TransactionDirection;
  sourceType: TransactionSourceType;
  description: string;

  // Student Info
  studentId: string; // UUID
  studentCode: string;
  studentName: string;
  studentEmail: string;

  // Source Info
  sourceId: string; // UUID
  sourceTable: string;

  // Additional Details (based on sourceType)
  paymentMethod?: string | null; // for DEPOSIT/PAYMENT
  paymentReference?: string | null; // for DEPOSIT
  depositCode?: string | null; // for DEPOSIT
  printJobId?: string | null; // UUID for PAYMENT/REFUND
}

export interface AdminTransactionHistoryFilters {
  studentId?: string; // UUID
  from?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
  to?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
  direction?: TransactionDirection;
  sourceType?: TransactionSourceType;
  page?: number; // 0-indexed
  limit?: number; // max: 100
  sortBy?: string; // createdAt, amount, studentCode, etc.
  sortDirection?: 'asc' | 'desc';
}

export interface AdminTransactionHistoryStats {
  totalTransactions: number;
  incomingTransactions: number;
  outgoingTransactions: number;

  totalInflow: number;
  totalOutflow: number;
  netFlow: number;

  depositTransactions: number;
  semesterBonusTransactions: number;
  paymentTransactions: number;
  refundTransactions: number;

  totalDeposits: number;
  totalSemesterBonus: number;
  totalPayments: number;
  totalRefunds: number;

  uniqueStudents: number;
}

export interface AdminTransactionHistoryStatsFilters {
  studentId?: string; // UUID
  from?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
  to?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
}

/**
 * Query key factory for admin transaction history
 */
export const adminTransactionHistoryKeys = {
  all: ['adminTransactionHistory'] as const,
  lists: () => [...adminTransactionHistoryKeys.all, 'list'] as const,
  list: (params: AdminTransactionHistoryFilters) =>
    [...adminTransactionHistoryKeys.lists(), params] as const,
  stats: (params?: AdminTransactionHistoryStatsFilters) =>
    [...adminTransactionHistoryKeys.all, 'stats', params] as const,
};

/**
 * Hook to fetch transaction history with filters
 */
export function useAdminTransactionHistory(
  filters?: AdminTransactionHistoryFilters
) {
  const queryParams = new URLSearchParams();

  if (filters?.studentId) queryParams.append('studentId', filters.studentId);
  if (filters?.from) queryParams.append('from', filters.from);
  if (filters?.to) queryParams.append('to', filters.to);
  if (filters?.direction) queryParams.append('direction', filters.direction);
  if (filters?.sourceType) queryParams.append('sourceType', filters.sourceType);
  if (filters?.page !== undefined)
    queryParams.append('page', filters.page.toString());
  if (filters?.limit !== undefined)
    queryParams.append('limit', filters.limit.toString());
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters?.sortDirection)
    queryParams.append('sortDirection', filters.sortDirection);

  const url = `/admin/transaction-history${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return useApiQuery<PaginatedApiResponse<AdminTransactionHistoryItem>>(
    adminTransactionHistoryKeys.list(filters || {}),
    url
  );
}

/**
 * Hook to fetch transaction history statistics
 */
export function useAdminTransactionHistoryStats(
  filters?: AdminTransactionHistoryStatsFilters
) {
  const queryParams = new URLSearchParams();

  if (filters?.studentId) queryParams.append('studentId', filters.studentId);
  if (filters?.from) queryParams.append('from', filters.from);
  if (filters?.to) queryParams.append('to', filters.to);

  const url = `/admin/transaction-history/stats${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return useApiQuery<AdminTransactionHistoryStats>(
    adminTransactionHistoryKeys.stats(filters),
    url
  );
}
