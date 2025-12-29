import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type {
  StaffDashboardOverviewResponse,
  WeeklyActivityItem,
  PrinterStatusResponse,
  PaperSizeUsageItem,
  CustomReportResponse,
  SystemReportResponse,
} from '@/types/api';

/**
 * Query key factory for staff reports
 */
export const staffReportsKeys = {
  all: ['staffReports'] as const,
  dashboard: () => [...staffReportsKeys.all, 'dashboard'] as const,
  weeklyActivity: () => [...staffReportsKeys.all, 'weeklyActivity'] as const,
  printerStatus: () => [...staffReportsKeys.all, 'printerStatus'] as const,
  paperUsage: (from?: string, to?: string) =>
    [...staffReportsKeys.all, 'paperUsage', from, to] as const,
  custom: (from: string, to: string) =>
    [...staffReportsKeys.all, 'custom', from, to] as const,
  reports: (reportType?: string, page?: number, size?: number) =>
    [...staffReportsKeys.all, 'reports', reportType, page, size] as const,
  report: (reportId: string) =>
    [...staffReportsKeys.all, 'report', reportId] as const,
  period: (type: string, period: string) =>
    [...staffReportsKeys.all, 'period', type, period] as const,
};

/**
 * Hook to fetch dashboard overview
 */
export function useDashboardOverview() {
  return useApiQuery<ApiResponse<StaffDashboardOverviewResponse>>(
    staffReportsKeys.dashboard(),
    '/admin/reports/dashboard',
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    }
  );
}

/**
 * Hook to fetch weekly activity data
 */
export function useWeeklyActivity() {
  return useApiQuery<ApiResponse<WeeklyActivityItem[]>>(
    staffReportsKeys.weeklyActivity(),
    '/admin/reports/dashboard/weekly-activity',
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch printer status
 */
export function usePrinterStatus() {
  return useApiQuery<ApiResponse<PrinterStatusResponse>>(
    staffReportsKeys.printerStatus(),
    '/admin/reports/dashboard/printer-status',
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch paper usage statistics
 */
export function usePaperUsage(from?: string, to?: string) {
  const queryParams = new URLSearchParams();
  if (from) queryParams.append('from', from);
  if (to) queryParams.append('to', to);

  const url = `/admin/reports/dashboard/paper-usage${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return useApiQuery<ApiResponse<PaperSizeUsageItem[]>>(
    staffReportsKeys.paperUsage(from, to),
    url,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: true, // Always enabled, even without params
    }
  );
}

/**
 * Hook to fetch custom report for date range
 */
export function useCustomReport(from: string, to: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('from', from);
  queryParams.append('to', to);

  const url = `/admin/reports/custom?${queryParams.toString()}`;

  return useApiQuery<ApiResponse<CustomReportResponse>>(
    staffReportsKeys.custom(from, to),
    url,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: Boolean(from && to), // Only fetch when both dates are provided
    }
  );
}

/**
 * Hook to fetch list of system reports
 */
export function useReportsList(
  reportType?: 'MONTHLY' | 'YEARLY',
  page?: number,
  size?: number
) {
  const queryParams = new URLSearchParams();
  if (reportType) queryParams.append('reportType', reportType);
  if (page !== undefined) queryParams.append('page', page.toString());
  if (size !== undefined) queryParams.append('size', size.toString());

  const url = `/admin/reports${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return useApiQuery<ApiResponse<SystemReportResponse[]>>(
    staffReportsKeys.reports(reportType, page, size),
    url,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

/**
 * Hook to fetch report detail by ID
 */
export function useReportDetail(reportId: string) {
  return useApiQuery<ApiResponse<SystemReportResponse>>(
    staffReportsKeys.report(reportId),
    `/admin/reports/${reportId}`,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: Boolean(reportId),
    }
  );
}

/**
 * Hook to fetch report by period
 */
export function useReportByPeriod(type: 'MONTHLY' | 'YEARLY', period: string) {
  return useApiQuery<ApiResponse<SystemReportResponse>>(
    staffReportsKeys.period(type, period),
    `/admin/reports/period/${type}/${period}`,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: Boolean(type && period),
    }
  );
}

/**
 * Hook to generate monthly report
 */
export function useGenerateMonthlyReport() {
  const queryClient = useQueryClient();

  return useApiMutation<
    ApiResponse<SystemReportResponse>,
    { year: number; month: number }
  >('/admin/reports/generate/monthly', 'post', {
    mutationFn: ({ year, month }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('year', year.toString());
      queryParams.append('month', month.toString());
      return apiClient.post<ApiResponse<SystemReportResponse>>(
        `/admin/reports/generate/monthly?${queryParams.toString()}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: staffReportsKeys.all,
      });
    },
  });
}

/**
 * Hook to generate yearly report
 */
export function useGenerateYearlyReport() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiResponse<SystemReportResponse>, { year: number }>(
    '/admin/reports/generate/yearly',
    'post',
    {
      mutationFn: ({ year }) => {
        const queryParams = new URLSearchParams();
        queryParams.append('year', year.toString());
        return apiClient.post<ApiResponse<SystemReportResponse>>(
          `/admin/reports/generate/yearly?${queryParams.toString()}`
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: staffReportsKeys.all,
        });
      },
    }
  );
}
