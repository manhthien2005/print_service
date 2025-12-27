'use client';

import { StatWidget } from './StatWidget';

export interface DashboardStatsProps {
  stats: {
    totalPrinters: number;
    activePrinters: number;
    maintenancePrinters: number;
    totalBrands: number;
    totalModels: number;
    maintenanceWarning: number;
    jobsToday?: number;
    totalPagesThisMonth?: number;
  };
  translations: {
    printersOnline: string;
    jobsToday: string;
    pagesMonth: string;
    totalCaption: string;
    lastJobCaption: string;
  };
}

export function DashboardStats({ stats, translations }: DashboardStatsProps) {
  // Calculate derived stats
  // const offlinePrinters = stats.totalPrinters - stats.activePrinters - stats.maintenancePrinters; // Not used currently

  // Calculate trends (simplified - in real app, compare with previous period)
  const jobsToday = stats.jobsToday ?? 0;
  const pagesThisMonth = stats.totalPagesThisMonth ?? 0;

  // Format change strings (simplified - would need previous period data for real trends)
  const jobsChange = jobsToday > 0 ? `+${jobsToday} jobs` : '';
  const pagesChange =
    pagesThisMonth > 0 ? `${Math.round(pagesThisMonth / 1000)}K pages` : '';

  // Map API data to widget format
  const widgets = [
    {
      label: translations.printersOnline,
      value: stats.activePrinters,
      change: '',
      trend: 'flat' as const,
      caption: translations.totalCaption.replace(
        '{total}',
        stats.totalPrinters.toString()
      ),
    },
    {
      label: translations.jobsToday,
      value: jobsToday,
      change: jobsChange,
      trend: jobsToday > 0 ? ('up' as const) : ('flat' as const),
      caption: translations.lastJobCaption,
    },
    {
      label: translations.pagesMonth,
      value: pagesThisMonth,
      change: pagesChange,
      trend: pagesThisMonth > 0 ? ('up' as const) : ('flat' as const),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
      {widgets.map((widget, index) => (
        <StatWidget key={index} {...widget} />
      ))}
    </div>
  );
}
