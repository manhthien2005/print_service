'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { TransactionTableSkeleton } from './TransactionSkeleton';
import type { SortColumn, SortDirection } from '../types';
import type { AdminTransactionHistoryItem } from '@/lib/api/services/adminTransactionHistory';

interface TransactionTableProps {
  items: AdminTransactionHistoryItem[];
  isLoading?: boolean;
  onItemClick: (item: AdminTransactionHistoryItem) => void;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: Exclude<SortColumn, null>) => void;
}

const sourceTypeBadgeClass: Record<
  AdminTransactionHistoryItem['sourceType'],
  string
> = {
  DEPOSIT:
    'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30',
  SEMESTER_BONUS:
    'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/30',
  PAYMENT:
    'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40',
  REFUND:
    'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-500/10 dark:text-purple-200 dark:ring-purple-500/30',
};

const directionBadgeClass: Record<
  AdminTransactionHistoryItem['direction'],
  string
> = {
  IN: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-500/10 dark:text-green-200 dark:ring-green-500/30',
  OUT: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30',
};

function SourceTypeBadge({
  sourceType,
  t,
}: {
  sourceType: AdminTransactionHistoryItem['sourceType'];
  t: any;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        sourceTypeBadgeClass[sourceType]
      )}
    >
      {t(`sourceTypes.${sourceType}`)}
    </span>
  );
}

function DirectionBadge({
  direction,
  t,
}: {
  direction: AdminTransactionHistoryItem['direction'];
  t: any;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        directionBadgeClass[direction]
      )}
    >
      {t(`directions.${direction}`)}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: Exclude<SortColumn, null>;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}) {
  if (sortColumn !== column || !sortDirection)
    return (
      <svg
        className="ml-1 h-4 w-4 text-slate-400"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M7 7l3-3 3 3M7 13l3 3 3-3"
        />
      </svg>
    );
  return sortDirection === 'asc' ? (
    <svg
      className="ml-1 h-4 w-4 text-blue-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M7 11l3-3 3 3"
      />
    </svg>
  ) : (
    <svg
      className="ml-1 h-4 w-4 text-blue-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M7 9l3 3 3-3"
      />
    </svg>
  );
}

export function TransactionTable({
  items,
  isLoading,
  onItemClick,
  sortColumn,
  sortDirection,
  onSort,
}: TransactionTableProps) {
  const t = useTranslations('staff.manageTransactions');

  if (isLoading) {
    return <TransactionTableSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-slate-500 dark:text-white/50">
        {t('table.noData')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
              onClick={() => onSort('createdAt')}
            >
              <div className="flex items-center">
                {t('table.createdAt')}
                <SortIcon
                  column="createdAt"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
              onClick={() => onSort('studentCode')}
            >
              <div className="flex items-center">
                {t('table.student')}
                <SortIcon
                  column="studentCode"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.sourceType')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.direction')}
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
              onClick={() => onSort('amount')}
            >
              <div className="flex items-center">
                {t('table.amount')}
                <SortIcon
                  column="amount"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.description')}
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.ledgerId}
              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
              onClick={() => onItemClick(item)}
            >
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900 dark:text-white">
                  {item.studentCode}
                </div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  {item.studentName}
                </div>
              </td>
              <td className="px-4 py-3">
                <SourceTypeBadge sourceType={item.sourceType} t={t} />
              </td>
              <td className="px-4 py-3">
                <DirectionBadge direction={item.direction} t={t} />
              </td>
              <td className="px-4 py-3">
                <div
                  className={cn(
                    'font-medium',
                    item.direction === 'IN'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  {item.direction === 'IN' ? '+' : '-'}
                  {formatCurrency(Math.abs(item.amount))}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                {item.description}
              </td>
              <td className="px-4 py-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={e => {
                    e.stopPropagation();
                    onItemClick(item);
                  }}
                  title={t('table.viewDetail')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
