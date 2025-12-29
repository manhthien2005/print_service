'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useTranslations } from 'next-intl';
import type { DailyPageAnalytics } from '@/types/api';

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string | number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
  t,
}: ChartTooltipProps & { t: any }) => {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0] as any;
  const data = item?.payload as DailyPageAnalytics | undefined;

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
      {data && (
        <div className="mt-2 border-t border-slate-200/50 pt-2 dark:border-white/10">
          <p className="text-xs text-slate-600 dark:text-white/70">
            {t('charts.dailyPageAnalytics.tooltip.total')}: {data.totalPages}{' '}
            {t('charts.dailyPageAnalytics.tooltip.pages')}
          </p>
          <p className="text-xs text-slate-600 dark:text-white/70">
            {t('charts.dailyPageAnalytics.tooltip.color')}:{' '}
            {data.colorPagePercentage.toFixed(1)}% |{' '}
            {t('charts.dailyPageAnalytics.tooltip.bw')}:{' '}
            {data.bwPagePercentage.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
};

interface DailyPageAnalyticsChartProps {
  data: DailyPageAnalytics[];
}

export function DailyPageAnalyticsChart({
  data,
}: DailyPageAnalyticsChartProps) {
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
      <AreaChart data={data}>
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
        <RechartsTooltip content={<CustomTooltip t={t} />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="colorPages"
          stackId="1"
          stroke="#3b82f6"
          fill="#3b82f6"
          name={t('charts.dailyPageAnalytics.legend.colorPages')}
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="bwPages"
          stackId="1"
          stroke="#1e293b"
          fill="#1e293b"
          name={t('charts.dailyPageAnalytics.legend.bwPages')}
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
