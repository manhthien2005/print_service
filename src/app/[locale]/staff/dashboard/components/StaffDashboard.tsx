'use client';

import { useDashboardPrinterStats } from '@/lib/api/services/dashboard';
// import { Card } from '@/components/ui/Card'; // Not used currently
import { Button } from '@/components/ui/Button';
import StaffDashboardSkeleton from './StaffDashboardSkeleton';
import { DashboardStats } from './DashboardStats';
import { DashboardCharts } from './DashboardCharts';
import { PrinterStatusCard } from './PrinterStatusCard';
import { AlertsCard } from './AlertsCard';
import type { StaffDashboardProps } from '../types';
import {
  weeklyPrintingActivity,
  paperSizeUsage,
  alerts,
} from '@/data/staffDashboardMock';

export default function StaffDashboard({ locale, t }: StaffDashboardProps) {
  const staff = t.staff ?? {};
  const { data, isLoading, error, refetch } = useDashboardPrinterStats();

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
            onClick={() => refetch()}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const statsData = data?.data?.data;
  if (!statsData) {
    return <StaffDashboardSkeleton />;
  }

  // Map API response to component props
  const printerStats = {
    totalPrinters: statsData.totalPrinters,
    activePrinters: statsData.activePrinters,
    maintenancePrinters: statsData.maintenancePrinters,
    offlinePrinters:
      statsData.totalPrinters -
      statsData.activePrinters -
      statsData.maintenancePrinters,
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
    maintenancePrinters: statsData.maintenancePrinters,
    totalBrands: statsData.totalBrands,
    totalModels: statsData.totalModels,
    maintenanceWarning: statsData.maintenanceWarning,
  };

  // Map alerts (still using mock for now, can be replaced with API later)
  const mappedAlerts = alerts.slice(0, 2).map(alert => ({
    id: alert.id,
    title: staff.alerts?.items?.[alert.id]?.title || alert.id,
    time: staff.alerts?.items?.[alert.id]?.time || 'Vừa xong',
    severity: alert.severity,
    actionLabel: staff.alerts?.items?.[alert.id]?.action,
  }));

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
        weeklyActivity={weeklyPrintingActivity}
        paperSizeUsage={paperSizeUsage}
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
