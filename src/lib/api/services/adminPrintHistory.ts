import { useApiQuery } from '@/lib/hooks';
import type { ApiResponse } from '@/types/api';

/**
 * Types for Admin Print History Management
 */

export type PrintStatus =
  | 'queued'
  | 'printing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'pending_payment';

export type PaymentMethod = 'balance' | 'qr';

export interface AdminPrintHistoryItem {
  jobId: string;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  printStatus: PrintStatus;

  studentId: string;
  studentCode: string;
  studentName: string;
  studentEmail: string;

  printerId: string;
  printerCode: string;
  printerName: string;
  roomName: string;
  floorName: string;
  buildingName: string;

  fileId: string;
  fileName: string;
  fileType: string;

  pageSizeName: string;
  colorModeName: string;
  pageOrientation: string;
  printSide: string;
  numberOfCopy: number;
  totalPages: number;
  printedPages: number;

  subtotalBeforeDiscount: number;
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  discountPackageName?: string;

  paymentMethod: PaymentMethod;
}

export interface AdminPrintHistoryFilters {
  studentId?: string;
  printerId?: string;
  from?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
  to?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
  status?: PrintStatus;
  fileType?: string;
  paymentMethod?: PaymentMethod;
  page?: number; // 0-indexed
  limit?: number; // max: 100
  sortBy?: string; // createdAt, totalPrice, totalPages, etc.
  sortDirection?: 'asc' | 'desc';
}

export interface AdminPrintHistoryStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  pendingPaymentJobs: number;
  queuedJobs: number;
  printingJobs: number;

  totalPages: number;
  completedPages: number;
  colorPages: number;
  blackWhitePages: number;

  totalRevenue: number;
  totalDiscount: number;
  netRevenue: number;

  uniqueStudents: number;
}

export interface AdminPrintHistoryStatsFilters {
  studentId?: string;
  from?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
  to?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
}

/**
 * Response wrapper for print history list
 */
export interface AdminPrintHistoryListResponse {
  success: boolean;
  message: string;
  data: AdminPrintHistoryItem[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

/**
 * Query key factory for admin print history
 */
export const adminPrintHistoryKeys = {
  all: ['adminPrintHistory'] as const,
  lists: () => [...adminPrintHistoryKeys.all, 'list'] as const,
  list: (params: AdminPrintHistoryFilters) =>
    [...adminPrintHistoryKeys.lists(), params] as const,
  stats: (params?: AdminPrintHistoryStatsFilters) =>
    [...adminPrintHistoryKeys.all, 'stats', params] as const,
};

/**
 * Hook to fetch print history with filters
 */
export function useAdminPrintHistory(filters?: AdminPrintHistoryFilters) {
  const queryParams = new URLSearchParams();

  if (filters?.studentId) queryParams.append('studentId', filters.studentId);
  if (filters?.printerId) queryParams.append('printerId', filters.printerId);
  if (filters?.from) queryParams.append('from', filters.from);
  if (filters?.to) queryParams.append('to', filters.to);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.fileType) queryParams.append('fileType', filters.fileType);
  if (filters?.paymentMethod)
    queryParams.append('paymentMethod', filters.paymentMethod);
  if (filters?.page !== undefined)
    queryParams.append('page', filters.page.toString());
  if (filters?.limit !== undefined)
    queryParams.append('limit', filters.limit.toString());
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters?.sortDirection)
    queryParams.append('sortDirection', filters.sortDirection);

  const url = `/admin/print-history${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return useApiQuery<AdminPrintHistoryListResponse>(
    adminPrintHistoryKeys.list(filters || {}),
    url
  );
}

/**
 * Hook to fetch print history statistics
 */
export function useAdminPrintHistoryStats(
  filters?: AdminPrintHistoryStatsFilters
) {
  const queryParams = new URLSearchParams();

  if (filters?.studentId) queryParams.append('studentId', filters.studentId);
  if (filters?.from) queryParams.append('from', filters.from);
  if (filters?.to) queryParams.append('to', filters.to);

  const url = `/admin/print-history/stats${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return useApiQuery<ApiResponse<AdminPrintHistoryStats>>(
    adminPrintHistoryKeys.stats(filters),
    url
  );
}
