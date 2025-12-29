'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import CountUp from '@/components/ui/CountUp';
import { Skeleton } from '@/components/common/Skeleton';
import type { AdminTransactionHistoryStats } from '@/lib/api/services/adminTransactionHistory';

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

  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="text-sm font-semibold text-slate-500 dark:text-white/60">
        {title}
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-9 w-24" variant="shimmer" />
      ) : (
        <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
          {useCountUp && countUpValue !== undefined ? (
            <CountUp to={countUpValue} separator="." duration={2} />
          ) : (
            displayValue
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

interface TransactionStatsProps {
  stats?: AdminTransactionHistoryStats;
  isLoading?: boolean;
}

export function TransactionStats({ stats, isLoading }: TransactionStatsProps) {
  const t = useTranslations('staff.manageTransactions.stats');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title={t('totalTransactions')}
        useCountUp={!isLoading}
        countUpValue={stats?.totalTransactions}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('incomingTransactions')}
        useCountUp={!isLoading}
        countUpValue={stats?.incomingTransactions}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('outgoingTransactions')}
        useCountUp={!isLoading}
        countUpValue={stats?.outgoingTransactions}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('totalInflow')}
        value={stats ? formatCurrency(stats.totalInflow) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('totalOutflow')}
        value={stats ? formatCurrency(stats.totalOutflow) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('netFlow')}
        value={stats ? formatCurrency(stats.netFlow) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('depositTransactions')}
        useCountUp={!isLoading}
        countUpValue={stats?.depositTransactions}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('semesterBonusTransactions')}
        useCountUp={!isLoading}
        countUpValue={stats?.semesterBonusTransactions}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('paymentTransactions')}
        useCountUp={!isLoading}
        countUpValue={stats?.paymentTransactions}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('refundTransactions')}
        useCountUp={!isLoading}
        countUpValue={stats?.refundTransactions}
        isLoading={isLoading}
      />
      <SummaryCard
        title={t('totalDeposits')}
        value={stats ? formatCurrency(stats.totalDeposits) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('totalSemesterBonus')}
        value={stats ? formatCurrency(stats.totalSemesterBonus) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('totalPayments')}
        value={stats ? formatCurrency(stats.totalPayments) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('totalRefunds')}
        value={stats ? formatCurrency(stats.totalRefunds) : undefined}
        isLoading={isLoading}
        formatCurrency={true}
      />
      <SummaryCard
        title={t('uniqueStudents')}
        useCountUp={!isLoading}
        countUpValue={stats?.uniqueStudents}
        isLoading={isLoading}
      />
    </div>
  );
}
