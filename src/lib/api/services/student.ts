import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type {
  StudentProfileResponse,
  UpdateStudentProfileRequest,
  ApiResponse,
  PaginatedApiResponse,
  StudentPrintHistoryItemResponse,
  StudentPrintJobDetailResponse,
  PrintHistoryStatsResponse,
} from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Query key factory for student profile
 */
export const studentKeys = {
  all: ['student'] as const,
  profile: () => [...studentKeys.all, 'profile'] as const,
};

/**
 * Query key factory for print history
 */
export const printHistoryKeys = {
  all: ['student', 'print-history'] as const,
  stats: () => [...printHistoryKeys.all, 'stats'] as const,
  list: (filters: PrintHistoryFilters) =>
    [...printHistoryKeys.all, 'list', filters] as const,
  detail: (jobId: string) =>
    [...printHistoryKeys.all, 'detail', jobId] as const,
};

/**
 * Filters for print history query
 */
export interface PrintHistoryFilters {
  status?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  supportsColor?: boolean;
  supportsDuplex?: boolean;
  fileType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Hook to fetch student profile
 */
export function useStudentProfile() {
  return useApiQuery<ApiResponse<StudentProfileResponse>>(
    studentKeys.profile(),
    '/student/profile',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

/**
 * Hook to update student profile
 */
export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<StudentProfileResponse>,
    UpdateStudentProfileRequest
  >('/student/profile', 'put', {
    onSuccess: () => {
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
    },
  });
}

/**
 * Hook to fetch print history stats
 */
export function usePrintHistoryStats(fromDate?: string, toDate?: string) {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);

  const url = `/student/print/history/stats${params.toString() ? `?${params.toString()}` : ''}`;

  return useApiQuery<ApiResponse<PrintHistoryStatsResponse>>(
    printHistoryKeys.stats(),
    url,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch print history list with filters
 */
export function usePrintHistory(filters: PrintHistoryFilters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  if (filters.supportsColor !== undefined)
    params.append('supportsColor', String(filters.supportsColor));
  if (filters.supportsDuplex !== undefined)
    params.append('supportsDuplex', String(filters.supportsDuplex));
  if (filters.fileType) params.append('fileType', filters.fileType);

  const page = filters.page ?? 0;
  const limit = filters.limit ?? 10;
  params.append('page', String(page));
  params.append('limit', String(limit));

  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortDirection)
    params.append('sortDirection', filters.sortDirection);

  const url = `/student/print/history${params.toString() ? `?${params.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<StudentPrintHistoryItemResponse>>(
    printHistoryKeys.list(filters),
    url,
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch print job detail
 */
export function usePrintJobDetail(jobId: string | null) {
  return useApiQuery<ApiResponse<StudentPrintJobDetailResponse>>(
    printHistoryKeys.detail(jobId || ''),
    jobId ? `/student/print/history/${jobId}` : '',
    {
      enabled: !!jobId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
