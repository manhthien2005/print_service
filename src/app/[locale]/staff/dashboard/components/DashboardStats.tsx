'use client';

import { StatWidget } from './StatWidget';

export interface DashboardStatsProps {
  stats: {
    jobsToday: number;
    jobsThisMonth: number;
    totalPagesThisMonth: number;
    revenueToday: number;
    revenueThisMonth: number;
    activeStudents: number;
    newStudentsThisMonth: number;
    queuedJobs?: number;
    printingJobs?: number;
  };
  translations: {
    jobsToday: string;
    pagesMonth: string;
    revenueToday: string;
    revenueMonth: string;
    activeStudents: string;
    jobsLabel?: string;
    pagesLabel?: string;
    kPagesLabel?: string;
    currencyLabel?: string;
    thisMonth?: string;
    now?: string;
    printing?: string;
    queued?: string;
    new?: string;
  };
}

export function DashboardStats({ stats, translations }: DashboardStatsProps) {
  const currencyLabel = translations.currencyLabel || 'VND';
  const kPagesLabel = translations.kPagesLabel || '{k}K pages';
  const thisMonth = translations.thisMonth || 'this month';
  const now = translations.now || 'Now';
  const printing = translations.printing || 'printing';
  const queued = translations.queued || 'queued';
  const newLabel = translations.new || 'new';

  // Format values and changes
  const pagesChange =
    stats.totalPagesThisMonth > 0
      ? kPagesLabel.replace(
          '{k}',
          Math.round(stats.totalPagesThisMonth / 1000).toString()
        )
      : '';

  // Format revenue this month with full number (e.g., 2,100,100)
  const revenueThisMonthFormatted =
    stats.revenueThisMonth.toLocaleString('en-US');

  // Map API data to widget format - Key metrics for management dashboard
  // Removed printersOnline as it's shown in PrinterStatusCard
  const widgets = [
    {
      label: translations.jobsToday,
      value: stats.jobsToday,
      change:
        stats.jobsThisMonth > 0 ? `${stats.jobsThisMonth} ${thisMonth}` : '',
      trend: stats.jobsToday > 0 ? ('up' as const) : ('flat' as const),
      caption: stats.printingJobs
        ? `${stats.printingJobs} ${printing}`
        : stats.queuedJobs
          ? `${stats.queuedJobs} ${queued}`
          : '',
    },
    {
      label: translations.pagesMonth,
      value: stats.totalPagesThisMonth,
      change: pagesChange,
      trend:
        stats.totalPagesThisMonth > 0 ? ('up' as const) : ('flat' as const),
      caption: '',
    },
    {
      label: translations.revenueToday,
      value: stats.revenueToday,
      suffix: currencyLabel,
      change: '',
      trend: stats.revenueToday > 0 ? ('up' as const) : ('flat' as const),
      caption: `${revenueThisMonthFormatted} ${thisMonth}`,
    },
    {
      label: translations.activeStudents,
      value: stats.activeStudents,
      change:
        stats.newStudentsThisMonth > 0
          ? `+${stats.newStudentsThisMonth} ${newLabel}`
          : '',
      trend:
        stats.newStudentsThisMonth > 0 ? ('up' as const) : ('flat' as const),
      caption: now,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {widgets.map((widget, index) => (
        <StatWidget key={index} {...widget} />
      ))}
    </div>
  );
}
