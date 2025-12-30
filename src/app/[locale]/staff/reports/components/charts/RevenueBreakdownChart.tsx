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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

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
        {t('charts.revenueBreakdown.tooltip.amount')}:{' '}
        <span className="font-semibold">
          {typeof item.value === 'number'
            ? formatCurrency(item.value)
            : item.value}
        </span>
      </p>
      {item.payload && (
        <p className="mt-1 text-xs text-slate-600 dark:text-white/70">
          {t('charts.revenueBreakdown.tooltip.percentage')}:{' '}
          {((item.payload as any).percentage || 0).toFixed(1)}%
        </p>
      )}
    </div>
  );
};

interface RevenueBreakdownChartProps {
  printRevenue?: number;
  depositAmount?: number;
  bonusGiven?: number;
  refundAmount?: number;
}

export function RevenueBreakdownChart({
  printRevenue = 0,
  depositAmount = 0,
  bonusGiven = 0,
  refundAmount = 0,
}: RevenueBreakdownChartProps) {
  const t = useTranslations('staff.reports');

  const data = [
    {
      name: t('charts.revenueBreakdown.labels.printRevenue'),
      value: printRevenue,
      color: '#3b82f6',
    },
    {
      name: t('charts.revenueBreakdown.labels.depositAmount'),
      value: depositAmount,
      color: '#10b981',
    },
    {
      name: t('charts.revenueBreakdown.labels.bonusGiven'),
      value: bonusGiven,
      color: '#f59e0b',
    },
    {
      name: t('charts.revenueBreakdown.labels.refundAmount'),
      value: refundAmount,
      color: '#ef4444',
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
