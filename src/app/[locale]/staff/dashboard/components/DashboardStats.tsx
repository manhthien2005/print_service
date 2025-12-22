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
      value: 0, // TODO: This needs separate API or mock for now
      change: '+12 jobs',
      trend: 'up' as const,
      caption: translations.lastJobCaption,
    },
    {
      label: translations.pagesMonth,
      value: 0, // TODO: This needs separate API or mock for now
      change: '-2.3%',
      trend: 'down' as const,
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
