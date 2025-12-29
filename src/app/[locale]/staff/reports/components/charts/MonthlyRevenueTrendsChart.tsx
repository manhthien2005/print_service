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
import type { MonthlyRevenueTrend } from '@/types/api';

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
    payload?: MonthlyRevenueTrend;
  }>;
  label?: string | number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

const CustomTooltip = ({
  active,
  payload,
  label,
  t,
}: ChartTooltipProps & { t: any }) => {
  if (!active || !payload || payload.length === 0) return null;

  const monthData = payload[0]?.payload as MonthlyRevenueTrend | undefined;

  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
      <p className="mb-2 font-semibold text-slate-900 dark:text-white">
        {monthData?.monthName || label}
      </p>
      {payload.map((item, index) => (
        <p
          key={index}
          className="flex items-center gap-2 text-slate-700 dark:text-white/80"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.name}:{' '}
          <span className="font-semibold">
            {typeof item.value === 'number'
              ? formatCurrency(item.value)
              : item.value}
          </span>
        </p>
      ))}
      {monthData && (
        <div className="mt-2 border-t border-slate-200/50 pt-2 dark:border-white/10">
          <p className="text-xs text-slate-600 dark:text-white/70">
            {t('charts.monthlyRevenueTrends.tooltip.totalJobs')}:{' '}
            {monthData.totalJobs}
          </p>
          <p className="text-xs text-slate-600 dark:text-white/70">
            {t('charts.monthlyRevenueTrends.tooltip.totalPages')}:{' '}
            {monthData.totalPages.toLocaleString('vi-VN')}
          </p>
        </div>
      )}
    </div>
  );
};

interface MonthlyRevenueTrendsChartProps {
  data: MonthlyRevenueTrend[];
}

export function MonthlyRevenueTrendsChart({
  data,
}: MonthlyRevenueTrendsChartProps) {
  const t = useTranslations('staff.reports');

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
        {t('charts.noData')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="monthName"
          tick={{ fill: '#64748b' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fill: '#64748b' }}
          tickFormatter={value => `${(value / 1000000).toFixed(0)}M`}
        />
        <RechartsTooltip content={<CustomTooltip t={t} />} />
        <Legend />
        <Bar
          dataKey="printRevenue"
          fill="#3b82f6"
          name={t('charts.monthlyRevenueTrends.legend.printRevenue')}
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="depositAmount"
          fill="#10b981"
          name={t('charts.monthlyRevenueTrends.legend.depositAmount')}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
