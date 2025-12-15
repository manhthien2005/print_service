import { useApiQuery } from '@/lib/hooks';
import type { PrinterLogResponse, PaginatedApiResponse } from '@/types/api';
import { mapLogsResponse } from '@/lib/utils/mappers';
import { AxiosResponse } from 'axios';

/**
 * Query key factory for printer logs
 */
export const logKeys = {
  all: ['printer-logs'] as const,
  lists: () => [...logKeys.all, 'list'] as const,
  list: (params: {
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
    actionType?: string; // For backward compatibility, maps to logType
    logType?: string; // New parameter: 'print_job', 'error', 'maintenance', 'status_change', 'configuration', 'admin_action'
    severity?: string; // 'info', 'warning', 'error', 'critical'
    userId?: string;
  }) => [...logKeys.lists(), params] as const,
};

/**
 * Hook to fetch printer activity logs with filters
 * Supports both old actionType (for backward compatibility) and new logType/severity parameters
 */
export function usePrinterLogs(params?: {
  page?: number;
  limit?: number;
  fromDate?: string; // ISO LocalDateTime string
  toDate?: string; // ISO LocalDateTime string
  actionType?: string; // For backward compatibility, maps to logType
  logType?: string; // New parameter: 'print_job', 'error', 'maintenance', 'status_change', 'configuration', 'admin_action'
  severity?: string; // 'info', 'warning', 'error', 'critical'
  userId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);

  // Backend accepts both actionType (for backward compatibility) and logType
  // If logType is provided, use it; otherwise fall back to actionType
  if (params?.logType) {
    queryParams.append('logType', params.logType);
  } else if (params?.actionType) {
    queryParams.append('actionType', params.actionType);
  }

  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.userId) queryParams.append('userId', params.userId);

  const url = `/printer-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<PrinterLogResponse>>(
    logKeys.list(params || {}),
    url,
    {
      select: (
        response: AxiosResponse<PaginatedApiResponse<PrinterLogResponse>>
      ) => {
        const mappedData = mapLogsResponse(response.data.data);
        return {
          ...response,
          data: {
            ...response.data,
            data: mappedData,
          },
        } as unknown as AxiosResponse<PaginatedApiResponse<PrinterLogResponse>>;
      },
    }
  );
}
