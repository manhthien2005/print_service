'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useTranslations } from 'next-intl';
import type { TopActivePrinter } from '@/types/api';

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
    payload?: TopActivePrinter;
  }>;
  label?: string | number;
};

const CustomTooltip = ({
  active,
  payload,
  t,
}: ChartTooltipProps & { t: any }) => {
  if (!active || !payload || payload.length === 0) return null;

  const printer = payload[0]?.payload as TopActivePrinter | undefined;

  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
      {printer && (
        <>
          <p className="mb-2 font-semibold text-slate-900 dark:text-white">
            {printer.modelName}
          </p>
          <p className="mb-1 text-xs text-slate-600 dark:text-white/70">
            {t('charts.topActivePrinters.tooltip.location')}: {printer.location}
          </p>
          <p className="mb-1 text-xs text-slate-600 dark:text-white/70">
            {t('charts.topActivePrinters.tooltip.serial')}:{' '}
            {printer.serialNumber}
          </p>
        </>
      )}
      {payload.map((item, index) => (
        <p
          key={index}
          className="flex items-center gap-2 text-slate-700 dark:text-white/80"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.name}: <span className="font-semibold">{item.value}</span>
        </p>
      ))}
    </div>
  );
};

interface TopActivePrintersChartProps {
  data: TopActivePrinter[];
}

export function TopActivePrintersChart({ data }: TopActivePrintersChartProps) {
  const t = useTranslations('staff.reports');

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
        {t('charts.noData')}
      </div>
    );
  }

  // Format data for chart - use location as label
  const chartData = data.map(printer => ({
    ...printer,
    label: `${printer.location} - ${printer.serialNumber}`,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fill: '#64748b' }} />
        <YAxis
          dataKey="label"
          type="category"
          width={200}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <RechartsTooltip content={<CustomTooltip t={t} />} />
        <Legend />
        <Bar
          dataKey="jobCount"
          fill="#10b981"
          name={t('charts.topActivePrinters.legend.jobCount')}
          radius={[0, 8, 8, 0]}
        />
        <Bar
          dataKey="pageCount"
          fill="#3b82f6"
          name={t('charts.topActivePrinters.legend.pageCount')}
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
