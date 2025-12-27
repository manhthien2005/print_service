'use client';

import { useDashboardPrinterStats } from '@/lib/api/services/dashboard';
import {
  useDashboardOverview,
  useWeeklyActivity,
  usePaperUsage,
} from '@/lib/api/services/staffReports';
// import { Card } from '@/components/ui/Card'; // Not used currently
import { Button } from '@/components/ui/Button';
import StaffDashboardSkeleton from './StaffDashboardSkeleton';
import { DashboardStats } from './DashboardStats';
import { DashboardCharts } from './DashboardCharts';
import { PrinterStatusCard } from './PrinterStatusCard';
import { AlertsCard } from './AlertsCard';
import type { StaffDashboardProps } from '../types';
import type { AlertItem } from './AlertsCard';

export default function StaffDashboard({ locale, t }: StaffDashboardProps) {
  const staff = t.staff ?? {};
  const {
    data: printerStatsData,
    isLoading: isLoadingPrinters,
    error: printerError,
    refetch: refetchPrinters,
  } = useDashboardPrinterStats();
  const {
    data: dashboardOverviewData,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useDashboardOverview();
  const { data: weeklyActivityData } = useWeeklyActivity();
  const { data: paperUsageData } = usePaperUsage();

  const isLoading = isLoadingPrinters || isLoadingOverview;
  const error = printerError || overviewError;

  // Handle loading state
  if (isLoading) {
    return <StaffDashboardSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-8 pb-24">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">
            {staff.sectionLabel ?? 'Staff dashboard'}
          </p>
          <h1 className="text-4xl font-bold text-white">{t.title}</h1>
        </div>
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-red-300">
            Không thể tải thống kê
          </h3>
          <p className="mb-4 text-red-200">
            {error instanceof Error
              ? error.message
              : 'Đã xảy ra lỗi khi tải dữ liệu dashboard'}
          </p>
          <Button
            onClick={() => {
              refetchPrinters();
              // Note: useDashboardOverview doesn't expose refetch directly, but it will auto-refetch
            }}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Extract data from API responses
  const statsData = printerStatsData?.data?.data;
  const overviewData = dashboardOverviewData?.data?.data;
  const weeklyActivity =
    weeklyActivityData?.data?.data || overviewData?.weeklyActivity || [];
  const paperUsage =
    paperUsageData?.data?.data || overviewData?.paperSizeUsage || [];

  if (!statsData || !overviewData) {
    return <StaffDashboardSkeleton />;
  }

  // Map API response to component props
  const printerStats = {
    totalPrinters: statsData.totalPrinters,
    activePrinters: statsData.activePrinters,
    maintenancePrinters: statsData.maintenancePrinters || 0,
    offlinePrinters:
      statsData.totalPrinters -
      statsData.activePrinters -
      (statsData.maintenancePrinters || 0),
  };

  // Calculate utilization (active / total * 100)
  const utilization =
    statsData.totalPrinters > 0
      ? Math.round((statsData.activePrinters / statsData.totalPrinters) * 100)
      : 0;

  // Prepare stats for DashboardStats component
  const dashboardStats = {
    totalPrinters: statsData.totalPrinters,
    activePrinters: statsData.activePrinters,
    maintenancePrinters: statsData.maintenancePrinters || 0,
    totalBrands: statsData.totalBrands || 0,
    totalModels: statsData.totalModels || 0,
    maintenanceWarning: statsData.maintenanceWarning || 0,
    jobsToday: overviewData.jobsToday,
    totalPagesThisMonth: overviewData.totalPagesThisMonth,
  };

  // Map weekly activity from API to chart format
  const mappedWeeklyActivity = weeklyActivity.map(item => ({
    day: item.dayName,
    jobs: item.jobCount,
    pages: item.pageCount,
  }));

  // Map paper usage from API to chart format with colors
  const paperSizeColors: Record<string, string> = {
    A4: '#6366f1',
    A3: '#22c55e',
    A5: '#f59e0b',
    Letter: '#8b5cf6',
    Legal: '#ec4899',
  };
  const mappedPaperUsage = paperUsage.map(item => ({
    name: item.sizeName,
    value: item.percentage, // Use percentage as value for pie chart
    color: paperSizeColors[item.sizeName] || '#64748b',
  }));

  // Map recent activities to alerts format
  const mappedAlerts: AlertItem[] = (overviewData.recentActivities || [])
    .slice(0, 2)
    .map((activity, index) => {
      // Determine severity based on activity type and status
      let severity: 'info' | 'warning' | 'critical' = 'info';
      if (activity.status === 'failed' || activity.type === 'ERROR') {
        severity = 'critical';
      } else if (
        activity.status === 'queued' ||
        activity.status === 'printing'
      ) {
        severity = 'warning';
      }

      // Format timestamp
      const timestamp = new Date(activity.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let timeLabel = 'Vừa xong';
      if (diffMins < 1) {
        timeLabel = 'Vừa xong';
      } else if (diffMins < 60) {
        timeLabel = `${diffMins} phút trước`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        timeLabel = `${hours} giờ trước`;
      } else {
        const days = Math.floor(diffMins / 1440);
        timeLabel = `${days} ngày trước`;
      }

      return {
        id: activity.id || `activity-${index}`,
        title: activity.description || activity.type,
        time: timeLabel,
        severity,
        actionLabel:
          activity.status === 'completed' ? 'Xem chi tiết' : undefined,
      };
    });

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">
          {staff.sectionLabel ?? 'Staff dashboard'}
        </p>
        <h1 className="text-4xl font-bold text-white">{t.title}</h1>
        <p className="text-white/70">{t.welcome}</p>
      </div>

      {/* Stats Widgets */}
      <DashboardStats
        stats={dashboardStats}
        translations={{
          printersOnline: staff.stats?.printersOnline ?? 'Máy in trực tuyến',
          jobsToday: staff.stats?.jobsToday ?? 'Công việc hôm nay',
          pagesMonth: staff.stats?.pagesMonth ?? 'Trang tháng này',
          totalCaption: staff.stats?.caption?.total ?? 'Tổng {total} máy',
          lastJobCaption: staff.stats?.caption?.lastJob ?? 'Công việc gần nhất',
        }}
      />

      {/* Charts */}
      <DashboardCharts
        weeklyActivity={mappedWeeklyActivity}
        paperSizeUsage={mappedPaperUsage}
        translations={{
          weekly: {
            title: staff.weekly?.title ?? 'Hoạt động in theo tuần',
            description:
              staff.weekly?.description ?? 'Thống kê công việc và trang in',
            jobs: staff.weekly?.jobs ?? 'Công việc',
            pages: staff.weekly?.pages ?? 'Trang',
          },
          paper: {
            title: staff.paper?.title ?? 'Sử dụng khổ giấy',
            description: staff.paper?.description ?? 'Phân bố các khổ giấy',
          },
        }}
      />

      {/* Printer Status & Alerts */}
      <div className="grid items-stretch gap-6 lg:grid-cols-[2fr,1fr]">
        <PrinterStatusCard
          stats={printerStats}
          utilization={utilization}
          locale={locale}
          translations={{
            title: staff.printer?.title ?? 'Trạng thái máy in',
            description: staff.printer?.description ?? 'Tổng quan hệ thống',
            online: staff.printer?.online ?? 'Online',
            offline: staff.printer?.offline ?? 'Offline',
            maintenance: staff.printer?.maintenance ?? 'Maintenance',
            utilization: staff.printer?.utilization ?? 'Utilization',
            utilizationLabel:
              staff.printer?.utilizationLabel ?? 'System utilization',
            cta: staff.printer?.cta ?? 'Go to printers',
          }}
        />

        <AlertsCard
          alerts={mappedAlerts}
          translations={{
            title: staff.alerts?.title ?? 'Cảnh báo',
            description: staff.alerts?.description ?? 'Thông báo hệ thống',
            severity: {
              critical: staff.alerts?.severity?.critical ?? 'Critical',
              warning: staff.alerts?.severity?.warning ?? 'Warning',
              info: staff.alerts?.severity?.info ?? 'Info',
            },
          }}
        />
      </div>
    </div>
  );
}
