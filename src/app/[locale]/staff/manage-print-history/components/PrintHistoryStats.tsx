'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import CountUp from '@/components/ui/CountUp';
import { Skeleton } from '@/components/common/Skeleton';
import type { AdminPrintHistoryStats } from '@/lib/api/services/adminPrintHistory';

interface SummaryCardProps {
  title: string;
  value?: string;
  caption?: string;
  useCountUp?: boolean;
  countUpValue?: number;
  isLoading?: boolean;
  formatCurrency?: boolean;
}

function SummaryCard({
  title,
  value,
  caption,
  useCountUp,
  countUpValue,
  isLoading,
  formatCurrency = false,
}: SummaryCardProps) {
  const displayValue = formatCurrency
    ? value
    : useCountUp && countUpValue !== undefined
      ? undefined
      : value;

  // Show 0 if countUpValue is 0, undefined means no data yet
  const shouldShowCountUp = useCountUp && countUpValue !== undefined;
  const shouldShowValue =
    !isLoading && !shouldShowCountUp && value !== undefined;

  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="text-sm font-semibold text-slate-500 dark:text-white/60">
        {title}
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-9 w-24" variant="shimmer" />
      ) : (
        <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
          {shouldShowCountUp ? (
            <CountUp to={countUpValue} separator="." duration={2} />
          ) : shouldShowValue ? (
            displayValue
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      )}
      {caption && (
        <div className="mt-1 text-sm text-slate-500 dark:text-white/60">
          {caption}
        </div>
      )}
    </div>
  );
}

interface PrintHistoryStatsProps {
  stats?: AdminPrintHistoryStats;
  isLoading?: boolean;
}

export function PrintHistoryStats({
  stats,
  isLoading,
}: PrintHistoryStatsProps) {
  const t = useTranslations('staff.managePrintHistory.stats');

  const successRate =
    stats && stats.totalJobs > 0
      ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1)
      : '0.0';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title={t('totalJobs')}
        useCountUp={!isLoading}
        countUpValue={stats?.totalJobs}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('completedJobs')}
        useCountUp={!isLoading}
        countUpValue={stats?.completedJobs}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('failedJobs')}
        useCountUp={!isLoading}
        countUpValue={stats?.failedJobs}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('totalPages')}
        useCountUp={!isLoading}
        countUpValue={stats?.totalPages}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('totalRevenue')}
        value={stats ? formatCurrency(stats.totalRevenue) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('netRevenue')}
        value={stats ? formatCurrency(stats.netRevenue) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('uniqueStudents')}
        useCountUp={!isLoading}
        countUpValue={stats?.uniqueStudents}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('successRate')}
        value={stats ? `${successRate}%` : undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
