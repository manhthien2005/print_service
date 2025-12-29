'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useTranslations } from 'next-intl';
import type { DailyJobTrend } from '@/types/api';

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
      <p className="mb-2 font-semibold text-slate-900 dark:text-white">
        {typeof label === 'string'
          ? label
          : label
            ? new Date(label).toLocaleDateString('vi-VN')
            : ''}
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
          {item.name}: <span className="font-semibold">{item.value}</span>
        </p>
      ))}
    </div>
  );
};

interface DailyJobTrendsChartProps {
  data: DailyJobTrend[];
}

export function DailyJobTrendsChart({ data }: DailyJobTrendsChartProps) {
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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b' }}
          tickFormatter={value => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }}
        />
        <YAxis tick={{ fill: '#64748b' }} />
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="completedJobs"
          stroke="#10b981"
          strokeWidth={2}
          name={t('charts.dailyJobTrends.legend.completed')}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="failedJobs"
          stroke="#ef4444"
          strokeWidth={2}
          name={t('charts.dailyJobTrends.legend.failed')}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="cancelledJobs"
          stroke="#64748b"
          strokeWidth={2}
          name={t('charts.dailyJobTrends.legend.cancelled')}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
