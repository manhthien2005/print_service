import { useApiQuery } from '@/lib/hooks';
import type { DashboardPrinterStatsResponse, ApiResponse } from '@/types/api';

/**
 * Query key factory for dashboard
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  printerStats: () => [...dashboardKeys.all, 'printer-stats'] as const,
};

/**
 * Hook to fetch dashboard printer stats
 */
export function useDashboardPrinterStats() {
  return useApiQuery<ApiResponse<DashboardPrinterStatsResponse>>(
    dashboardKeys.printerStats(),
    '/dashboard/printer-stats',
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    }
  );
}

