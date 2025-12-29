'use client';

import { useDashboardOverview } from '@/lib/api/services/staffReports';
import { Button } from '@/components/ui/Button';
import StaffDashboardSkeleton from '@/app/[locale]/staff/dashboard/components/StaffDashboardSkeleton';
import { DashboardStats } from '@/app/[locale]/staff/dashboard/components/DashboardStats';
import { DashboardCharts } from '@/app/[locale]/staff/dashboard/components/DashboardCharts';
import { PrinterStatusCard } from '@/app/[locale]/staff/dashboard/components/PrinterStatusCard';
import { AlertsCard } from '@/app/[locale]/staff/dashboard/components/AlertsCard';
import type { StaffDashboardProps } from '@/app/[locale]/staff/dashboard/types';
import type { AlertItem } from '@/app/[locale]/staff/dashboard/components/AlertsCard';

export default function StaffDashboard({ locale, t }: StaffDashboardProps) {
  const staff = t.staff ?? {};
  const {
    data: dashboardOverviewData,
    isLoading: isLoadingOverview,
    error: overviewError,
    refetch: refetchDashboard,
  } = useDashboardOverview();

  const isLoading = isLoadingOverview;
  const error = overviewError;

  // Handle loading state
  if (isLoading) {
    return <StaffDashboardSkeleton t={t} />;
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
        <div className="border-destructive/20 bg-destructive/10 rounded-xl border p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            {staff.errors?.loadStatsFailed || 'Failed to load statistics'}
          </h3>
          <p className="text-destructive/80 mb-4">
            {error instanceof Error
              ? error.message
              : staff.errors?.loadDataFailed ||
                'An error occurred while loading dashboard data'}
          </p>
          <Button
            onClick={() => {
              refetchDashboard();
            }}
            className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
          >
            {staff.errors?.tryAgain || 'Try again'}
          </Button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const overviewData = dashboardOverviewData?.data?.data;

  if (!overviewData) {
    return <StaffDashboardSkeleton t={t} />;
  }

  // Map printer status from API
  const printerStatus = overviewData.printerStatus;
  const totalPrinters = overviewData.totalPrinters;

  // Calculate offline printers (total - idle - printing - maintained - unplugged - error)
  const offlinePrinters =
    totalPrinters -
    printerStatus.idle -
    printerStatus.printing -
    printerStatus.maintained -
    printerStatus.unplugged -
    printerStatus.error;

  // Map API response to component props
  const printerStats = {
    totalPrinters,
    activePrinters: printerStatus.idle + printerStatus.printing, // For compatibility
    maintenancePrinters: printerStatus.maintained,
    offlinePrinters: Math.max(0, offlinePrinters), // Ensure non-negative
    idle: printerStatus.idle,
    printing: printerStatus.printing,
    unplugged: printerStatus.unplugged,
    error: printerStatus.error,
  };

  // Prepare stats for DashboardStats component (removed printersOnline)
  const dashboardStats = {
    jobsToday: overviewData.jobsToday,
    jobsThisMonth: overviewData.jobsThisMonth,
    totalPagesThisMonth: overviewData.totalPagesThisMonth,
    revenueToday: overviewData.revenueToday,
    revenueThisMonth: overviewData.revenueThisMonth,
    activeStudents: overviewData.activeStudents,
    newStudentsThisMonth: overviewData.newStudentsThisMonth,
    queuedJobs: overviewData.queuedJobs,
    printingJobs: overviewData.printingJobs,
  };

  // Map weekly activity from API to chart format
  const mappedWeeklyActivity = (overviewData.weeklyActivity || []).map(
    item => ({
      day: item.dayName,
      jobs: item.jobCount,
      pages: item.pageCount,
    })
  );

  // Map paper usage from API to chart format with colors
  const paperSizeColors: Record<string, string> = {
    A4: '#6366f1',
    A3: '#22c55e',
    A5: '#f59e0b',
    Letter: '#8b5cf6',
    Legal: '#ec4899',
  };
  const mappedPaperUsage = (overviewData.paperSizeUsage || []).map(item => ({
    name: item.sizeName,
    value: item.percentage, // Use percentage as value for pie chart
    count: item.count, // Include count for tooltip
    color: paperSizeColors[item.sizeName] || '#64748b',
  }));

  // Map recent activities to alerts format
  const mappedAlerts: AlertItem[] = (overviewData.recentActivities || [])
    .slice(0, 4) // Show up to 4 recent activities (no scroll)
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
      let timeLabel = staff.time?.justNow || 'Just now';
      if (diffMins < 1) {
        timeLabel = staff.time?.justNow || 'Just now';
      } else if (diffMins < 60) {
        timeLabel = (staff.time?.minutesAgo || '{minutes} minutes ago').replace(
          '{minutes}',
          diffMins.toString()
        );
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        timeLabel = (staff.time?.hoursAgo || '{hours} hours ago').replace(
          '{hours}',
          hours.toString()
        );
      } else {
        const days = Math.floor(diffMins / 1440);
        timeLabel = (staff.time?.daysAgo || '{days} days ago').replace(
          '{days}',
          days.toString()
        );
      }

      // Build title with student info
      const title = activity.description || activity.type;
      const studentInfo = activity.studentName
        ? `${activity.studentName} (${activity.studentCode})`
        : activity.studentCode || '';

      return {
        id: activity.id || `activity-${index}`,
        title: studentInfo ? `${title} - ${studentInfo}` : title,
        time: timeLabel,
        severity,
        actionLabel:
          activity.status === 'completed'
            ? staff.actions?.viewDetails || 'View details'
            : undefined,
      };
    });

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">{t.title}</h1>
        {t.welcome && <p className="text-white/70">{t.welcome}</p>}
      </div>

      {/* Stats Widgets */}
      <DashboardStats
        stats={dashboardStats}
        translations={{
          jobsToday: staff.stats?.jobsToday ?? 'Jobs today',
          pagesMonth: staff.stats?.pagesMonth ?? 'Pages this month',
          revenueToday: staff.stats?.revenueToday ?? 'Revenue today',
          revenueMonth: staff.stats?.revenueMonth ?? 'Revenue this month',
          activeStudents: staff.stats?.activeStudents ?? 'Active students',
          jobsLabel: staff.stats?.jobs || 'jobs',
          pagesLabel: staff.stats?.pages || 'pages',
          kPagesLabel: staff.stats?.kPages || '{k}K pages',
          currencyLabel: staff.stats?.currency || 'VND',
          thisMonth: staff.stats?.thisMonth || 'this month',
          now: staff.stats?.now || 'Now',
          printing: staff.stats?.printing || 'printing',
          queued: staff.stats?.queued || 'queued',
          new: staff.stats?.new || 'new',
        }}
      />

      {/* Charts */}
      <DashboardCharts
        weeklyActivity={mappedWeeklyActivity}
        paperSizeUsage={mappedPaperUsage}
        translations={{
          weekly: {
            title: staff.weekly?.title ?? 'Weekly activity',
            description:
              staff.weekly?.description ?? 'Completed jobs and pages',
            jobs: staff.weekly?.jobs ?? 'Jobs',
            pages: staff.weekly?.pages ?? 'Pages',
          },
          paper: {
            title: staff.paper?.title ?? 'Paper size usage',
            description: staff.paper?.description ?? 'Share of paper sizes',
          },
          ratioLabel: staff.charts?.ratio || 'Ratio',
          countLabel: staff.charts?.count || 'Count',
        }}
      />

      {/* Printer Status & Alerts */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr,1fr]">
        <PrinterStatusCard
          stats={printerStats}
          locale={locale}
          translations={{
            title: staff.printer?.title ?? 'Printer Status',
            description:
              staff.printer?.description ?? 'Health and utilization overview',
            online: staff.printer?.online ?? 'Online',
            offline: staff.printer?.offline ?? 'Offline',
            maintenance: staff.printer?.maintenance ?? 'Maintenance',
            idle: staff.printer?.idle ?? 'Idle',
            printing: staff.printer?.printing ?? 'Printing',
            unplugged: staff.printer?.unplugged ?? 'Unplugged',
            error: staff.printer?.error ?? 'Error',
            total: staff.printer?.total || 'Total',
            utilization: staff.printer?.utilization ?? 'Utilization',
            utilizationLabel:
              staff.printer?.utilizationLabel ?? 'System utilization',
            cta: staff.printer?.cta ?? 'Manage printers',
          }}
        />

        <AlertsCard
          alerts={mappedAlerts}
          translations={{
            title: staff.alerts?.title ?? 'Alerts',
            description: staff.alerts?.description ?? 'Items to resolve soon',
            noActivities: staff.alerts?.noActivities || 'No recent activities',
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
