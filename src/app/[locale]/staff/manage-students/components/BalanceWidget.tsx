'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  useGetBalance,
  type UserBalanceResponse,
} from '@/lib/api/services/adminUsers';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

interface BalanceWidgetProps {
  userId: string | null;
  onCreditClick: () => void;
  onDebitClick: () => void;
}

export const BalanceWidget: React.FC<BalanceWidgetProps> = ({
  userId,
  onCreditClick,
  onDebitClick,
}) => {
  const t = useTranslations('staff.manageStudents.modal.balance');
  const tWidget = useTranslations('staff.manageStudents.balanceWidget');
  const { data: balanceResponse, isLoading, isError } = useGetBalance(userId);
  const balance: UserBalanceResponse | undefined = balanceResponse?.data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500 dark:text-slate-400">
          {tWidget('loading')}
        </div>
      </div>
    );
  }

  if (isError || !balance) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {tWidget('loadFailed')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Balance - Large Display */}
      <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {t('currentBalance')}
        </div>
        <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
          {formatCurrency(balance.currentBalance)}
        </div>
        {balance.lastUpdatedAt && (
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {tWidget('lastUpdated')}:{' '}
            {new Date(balance.lastUpdatedAt).toLocaleString('vi-VN')}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onCreditClick}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md transition-transform hover:scale-[1.02] hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg active:scale-[0.98]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t('creditButton')}
        </Button>
        <Button
          onClick={onDebitClick}
          variant="outline"
          className="flex items-center justify-center gap-2 border-red-300 bg-white text-red-600 shadow-sm transition-transform hover:scale-[1.02] hover:border-red-400 hover:bg-red-50 hover:shadow-md active:scale-[0.98] dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
          {t('debitButton')}
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title={t('totalDeposited')}
          value={formatCurrency(balance.totalDeposited)}
          icon="deposit"
          color="emerald"
        />
        <StatCard
          title={t('totalSpent')}
          value={formatCurrency(balance.totalSpent)}
          icon="spent"
          color="rose"
        />
        <StatCard
          title={t('totalBonus')}
          value={formatCurrency(balance.totalBonus)}
          icon="bonus"
          color="amber"
        />
        <StatCard
          title={t('totalRefunded')}
          value={formatCurrency(balance.totalRefunded)}
          icon="refund"
          color="blue"
        />
        <StatCard
          title={t('totalAdjustment')}
          value={formatCurrency(balance.totalAdjustment)}
          icon="adjustment"
          color="purple"
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: 'deposit' | 'spent' | 'bonus' | 'refund' | 'adjustment';
  color: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    emerald:
      'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300',
    rose: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300',
    amber:
      'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    purple:
      'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
  };

  const iconPaths = {
    deposit: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    ),
    spent: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 12H4"
      />
    ),
    bonus: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    ),
    refund: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    ),
    adjustment: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    ),
  };

  return (
    <div className={cn('rounded-lg border p-3', colorClasses[color])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs font-medium opacity-80">{title}</div>
          <div className="mt-1 text-sm font-bold">{value}</div>
        </div>
        <div className="ml-2">
          <svg
            className="h-5 w-5 opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {iconPaths[icon]}
          </svg>
        </div>
      </div>
    </div>
  );
};
