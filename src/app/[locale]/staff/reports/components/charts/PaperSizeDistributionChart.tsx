'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import { useTranslations } from 'next-intl';

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
    payload?: {
      percentage?: number;
      [key: string]: unknown;
    };
  }>;
  label?: string | number;
};

const CustomTooltip = ({
  active,
  payload,
  t,
}: ChartTooltipProps & { t: any }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];

  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
      <p className="mb-1 font-semibold text-slate-900 dark:text-white">
        {item.name}
      </p>
      <p className="text-slate-700 dark:text-white/80">
        {t('charts.paperFormatDistribution.tooltip.pages')}:{' '}
        <span className="font-semibold">
          {typeof item.value === 'number'
            ? item.value.toLocaleString('vi-VN')
            : item.value}
        </span>
      </p>
      {item.payload && (
        <p className="mt-1 text-xs text-slate-600 dark:text-white/70">
          {t('charts.paperFormatDistribution.tooltip.percentage')}:{' '}
          {((item.payload as any).percentage || 0).toFixed(1)}%
        </p>
      )}
    </div>
  );
};

interface PaperSizeDistributionChartProps {
  a4Pages?: number;
  a3Pages?: number;
  duplexPages?: number;
  totalPages?: number;
}

export function PaperSizeDistributionChart({
  a4Pages = 0,
  a3Pages = 0,
  duplexPages = 0,
  totalPages = 0,
}: PaperSizeDistributionChartProps) {
  const t = useTranslations('staff.reports');

  const data = [
    {
      name: t('charts.paperFormatDistribution.labels.a4'),
      value: a4Pages,
      color: '#3b82f6',
    },
    {
      name: t('charts.paperFormatDistribution.labels.a3'),
      value: a3Pages,
      color: '#8b5cf6',
    },
    {
      name: t('charts.paperFormatDistribution.labels.duplex'),
      value: duplexPages,
      color: '#10b981',
    },
    {
      name: t('charts.paperFormatDistribution.labels.simplex'),
      value: Math.max(0, totalPages - duplexPages),
      color: '#f59e0b',
    },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
        {t('charts.noData')}
      </div>
    );
  }

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dataWithPercentage}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {dataWithPercentage.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip t={t} />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
