import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  UploadedFileResponse,
  UploadedFileDetailResponse,
  UploadedFilesListParams,
  AvailablePrinterResponse,
  AvailablePrintersParams,
  PrinterDetailResponse,
  PrinterQueueResponse,
  PageSizeResponse,
  ColorModeResponse,
  PermittedFileTypeResponse,
  PricingConfigResponse,
  CalculateCostRequest,
  CalculateCostResponse,
  CreatePrintJobRequest,
  CreatePrintJobResponse,
  PrintJobStatusResponse,
  PrintJobProgressResponse,
  CancelPrintJobResponse,
  StudentBalanceResponse,
  BalanceHistoryParams,
  BalanceHistoryItem,
} from '@/types/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '@/lib/api/client';

/**
 * Query key factory for student print
 */
const baseKeys = ['student', 'print'] as const;
const filesBase = [...baseKeys, 'files'] as const;
const printersBase = [...baseKeys, 'printers'] as const;
const configBase = [...baseKeys, 'config'] as const;
const printJobsBase = [...baseKeys, 'print-jobs'] as const;
const balanceBase = [...baseKeys, 'balance'] as const;

export const studentPrintKeys = {
  all: baseKeys,
  files: {
    all: filesBase,
    list: (params: UploadedFilesListParams) =>
      [...filesBase, 'list', params] as const,
    detail: (fileId: string) => [...filesBase, 'detail', fileId] as const,
  },
  printers: {
    all: printersBase,
    available: (params: AvailablePrintersParams) =>
      [...printersBase, 'available', params] as const,
    detail: (printerId: string) =>
      [...printersBase, 'detail', printerId] as const,
    queue: (printerId: string) =>
      [...printersBase, 'queue', printerId] as const,
  },
  config: {
    all: configBase,
    pageSizes: (printerId?: string) =>
      [...configBase, 'page-sizes', printerId] as const,
    colorModes: () => [...configBase, 'color-modes'] as const,
    permittedFileTypes: () => [...configBase, 'permitted-file-types'] as const,
    pricing: () => [...configBase, 'pricing'] as const,
  },
  printJobs: {
    all: printJobsBase,
    status: (jobId: string) => [...printJobsBase, 'status', jobId] as const,
    progress: (jobId: string) => [...printJobsBase, 'progress', jobId] as const,
  },
  balance: {
    all: balanceBase,
    current: (checkForAmount?: number) =>
      [...balanceBase, 'current', checkForAmount] as const,
    history: (params: BalanceHistoryParams) =>
      [...balanceBase, 'history', params] as const,
  },
} as const;

// ============================================================================
// File Upload & Management
// ============================================================================

/**
 * Hook to upload a file
 */
export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<UploadedFileResponse>>,
    Error,
    File
  >({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // Log file info in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Preparing to upload file:', {
          fileName: file.name,
          fileSize: file.size,
          fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
          fileType: file.type,
        });
      }

      return apiClient.post<ApiResponse<UploadedFileResponse>>(
        '/students/files/upload',
        formData,
        {
          // Don't set Content-Type manually - axios will automatically detect FormData
          // and set 'Content-Type: multipart/form-data' with proper boundary
          // The interceptor will remove the default Content-Type header for FormData
          // Set max file size to 50MB (50 * 1024 * 1024 bytes)
          maxContentLength: 50 * 1024 * 1024,
          maxBodyLength: 50 * 1024 * 1024,
          // Increase timeout for large file uploads (60 seconds)
          timeout: 60000,
        } as any
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentPrintKeys.files.all,
      });
    },
  });
}

/**
 * Hook to fetch uploaded files list
 */
export function useUploadedFiles(params: UploadedFilesListParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.file_type) queryParams.append('file_type', params.file_type);
  if (params.date_range) queryParams.append('date_range', params.date_range);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_direction)
    queryParams.append('sort_direction', params.sort_direction);

  const url = `/students/files${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<UploadedFileResponse>>(
    studentPrintKeys.files.list(params),
    url,
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch uploaded file detail
 */
export function useUploadedFileDetail(fileId: string | null) {
  return useApiQuery<ApiResponse<UploadedFileDetailResponse>>(
    studentPrintKeys.files.detail(fileId || ''),
    fileId ? `/students/files/${fileId}` : '',
    {
      enabled: !!fileId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to delete uploaded file
 */
export function useDeleteUploadedFile() {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<ApiResponse<void>>, Error, string>({
    mutationFn: (fileId: string) => {
      return apiClient.delete<ApiResponse<void>>(`/students/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentPrintKeys.files.all,
      });
    },
  });
}

// ============================================================================
// Printer Management
// ============================================================================

/**
 * Hook to fetch available printers
 */
export function useAvailablePrinters(params: AvailablePrintersParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.buildingId) queryParams.append('buildingId', params.buildingId);
  if (params.roomId) queryParams.append('roomId', params.roomId);
  if (params.status) queryParams.append('status', params.status);
  if (params.supportsColor !== undefined)
    queryParams.append('supportsColor', String(params.supportsColor));
  if (params.supportsDuplex !== undefined)
    queryParams.append('supportsDuplex', String(params.supportsDuplex));
  if (params.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection)
    queryParams.append('sortDirection', params.sortDirection);

  const url = `/printers/available${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<AvailablePrinterResponse>>(
    studentPrintKeys.printers.available(params),
    url,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch printer detail
 */
export function usePrinterDetail(printerId: string | null) {
  return useApiQuery<ApiResponse<PrinterDetailResponse>>(
    studentPrintKeys.printers.detail(printerId || ''),
    printerId ? `/printers/${printerId}` : '',
    {
      enabled: !!printerId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch printer queue information
 */
export function usePrinterQueue(printerId: string | null) {
  return useApiQuery<ApiResponse<PrinterQueueResponse>>(
    studentPrintKeys.printers.queue(printerId || ''),
    printerId ? `/printers/${printerId}/queue` : '',
    {
      enabled: !!printerId,
      staleTime: 30 * 1000, // 30 seconds (frequently updated)
      gcTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 10 * 1000, // Auto-refetch every 10 seconds
    }
  );
}

// ============================================================================
// Print Configuration
// ============================================================================

/**
 * Hook to fetch page sizes for student print (with optional printer filter)
 */
export function useStudentPageSizes(printerId?: string) {
  const queryParams = new URLSearchParams();
  if (printerId) queryParams.append('printer_id', printerId);

  const url = `/config/page-sizes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<ApiResponse<PageSizeResponse[]>>(
    studentPrintKeys.config.pageSizes(printerId),
    url,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
      gcTime: 30 * 60 * 1000, // 30 minutes
    }
  );
}

/**
 * Hook to fetch color modes
 */
export function useColorModes() {
  return useApiQuery<ApiResponse<ColorModeResponse[]>>(
    studentPrintKeys.config.colorModes(),
    '/config/color-modes',
    {
      staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
      gcTime: 30 * 60 * 1000, // 30 minutes
    }
  );
}

/**
 * Hook to fetch permitted file types
 */
export function usePermittedFileTypes() {
  return useApiQuery<ApiResponse<PermittedFileTypeResponse[]>>(
    studentPrintKeys.config.permittedFileTypes(),
    '/config/permitted-file-types',
    {
      staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
      gcTime: 30 * 60 * 1000, // 30 minutes
    }
  );
}

/**
 * Hook to fetch pricing configuration
 */
export function usePricingConfig() {
  return useApiQuery<ApiResponse<PricingConfigResponse>>(
    studentPrintKeys.config.pricing(),
    '/config/pricing',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    }
  );
}

// ============================================================================
// Cost Calculation
// ============================================================================

/**
 * Hook to calculate print cost
 */
export function useCalculateCost() {
  return useApiMutation<
    ApiResponse<CalculateCostResponse>,
    CalculateCostRequest
  >('/students/print-jobs/calculate-cost', 'post', {
    // Don't invalidate queries on success (this is just a calculation)
  });
}

// ============================================================================
// Print Job Management
// ============================================================================

/**
 * Hook to create print job
 */
export function useCreatePrintJob() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<CreatePrintJobResponse>,
    CreatePrintJobRequest
  >('/students/print-jobs', 'post', {
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: studentPrintKeys.printJobs.all,
      });
      queryClient.invalidateQueries({
        queryKey: studentPrintKeys.balance.all,
      });
      queryClient.invalidateQueries({
        queryKey: studentPrintKeys.files.all,
      });
    },
  });
}

/**
 * Hook to fetch print job status
 */
export function usePrintJobStatus(jobId: string | null) {
  return useApiQuery<ApiResponse<PrintJobStatusResponse>>(
    studentPrintKeys.printJobs.status(jobId || ''),
    jobId ? `/students/print-jobs/${jobId}` : '',
    {
      enabled: !!jobId,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

/**
 * Hook to fetch print job progress (for polling)
 */
export function usePrintJobProgress(jobId: string | null, enabled = true) {
  return useApiQuery<ApiResponse<PrintJobProgressResponse>>(
    studentPrintKeys.printJobs.progress(jobId || ''),
    jobId ? `/students/print-jobs/${jobId}/progress` : '',
    {
      enabled: !!jobId && enabled,
      staleTime: 0, // Always consider stale for polling
      gcTime: 1 * 60 * 1000, // 1 minute
      refetchInterval: query => {
        // Stop polling if job is completed, failed, or cancelled
        const response = query.state.data as
          | AxiosResponse<ApiResponse<PrintJobProgressResponse>>
          | undefined;
        const status = response?.data?.data?.printStatus || 'unknown';
        if (
          status === 'completed' ||
          status === 'failed' ||
          status === 'cancelled'
        ) {
          return false;
        }
        // Poll every 3 seconds for active jobs
        return 3000;
      },
    }
  );
}

/**
 * Hook to cancel print job
 */
export function useCancelPrintJob() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<CancelPrintJobResponse>>,
    Error,
    string
  >({
    mutationFn: (jobId: string) => {
      return apiClient.post<ApiResponse<CancelPrintJobResponse>>(
        `/students/print-jobs/${jobId}/cancel`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentPrintKeys.printJobs.all,
      });
      queryClient.invalidateQueries({
        queryKey: studentPrintKeys.balance.all,
      });
    },
  });
}

// ============================================================================
// Student Balance
// ============================================================================

/**
 * Hook to fetch student balance
 */
export function useStudentBalance(checkForAmount?: number) {
  const queryParams = new URLSearchParams();
  if (checkForAmount !== undefined)
    queryParams.append('checkForAmount', checkForAmount.toString());

  const url = `/students/balance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<ApiResponse<StudentBalanceResponse>>(
    studentPrintKeys.balance.current(checkForAmount),
    url,
    {
      staleTime: 30 * 1000, // 30 seconds (balance changes frequently)
      gcTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

/**
 * Hook to fetch balance history
 */
export function useBalanceHistory(params: BalanceHistoryParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_direction)
    queryParams.append('sort_direction', params.sort_direction);

  const url = `/students/balance/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<BalanceHistoryItem>>(
    studentPrintKeys.balance.history(params),
    url,
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
