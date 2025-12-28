'use client';

import React, { useState, useEffect } from 'react';
import { useBalanceHistory } from '@/app/[locale]/student/print/api';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { TransactionHistoryTableSkeleton } from './TransactionHistoryTableSkeleton';
import type { BalanceHistoryItem } from '@/types/api';
import { cn } from '@/lib/utils/cn';

interface TransactionHistoryTableProps {
  t: Record<string, any>;
}

const ITEMS_PER_PAGE = 10;

export function TransactionHistoryTable({ t }: TransactionHistoryTableProps) {
  const [page, setPage] = useState(0); // Backend uses 0-indexed pages
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all');

  // Fetch balance history
  const { data, isLoading, error } = useBalanceHistory({
    page,
    limit: ITEMS_PER_PAGE,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // API response structure: PaginatedApiResponse<BalanceHistoryItem>
  const historyData = data?.data;
  const pagination = historyData?.pagination;

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Math.abs(amount));
  };

  // Get direction badge
  const getDirectionBadge = (direction: BalanceHistoryItem['direction']) => {
    const isIn = direction === 'IN';
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          isIn
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' // Success color - keep specific
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        )}
      >
        {isIn
          ? t.transactionHistory.direction.in
          : t.transactionHistory.direction.out}
      </span>
    );
  };

  // Get source type label
  const getSourceTypeLabel = (sourceType: BalanceHistoryItem['sourceType']) => {
    const labels = {
      DEPOSIT: t.transactionHistory.sourceType.deposit,
      PAYMENT: t.transactionHistory.sourceType.payment,
      REFUND: t.transactionHistory.sourceType.refund,
      SEMESTER_BONUS: t.transactionHistory.sourceType.semester_bonus,
    };
    return labels[sourceType] || sourceType;
  };

  // Filter data client-side (since API doesn't support these filters yet)
  const filteredData =
    historyData?.data?.filter(item => {
      if (directionFilter !== 'all' && item.direction !== directionFilter) {
        return false;
      }
      if (sourceTypeFilter !== 'all' && item.sourceType !== sourceTypeFilter) {
        return false;
      }
      return true;
    }) || [];

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [directionFilter, sourceTypeFilter]);

  // Convert 0-indexed page to 1-indexed for Pagination component
  const displayPage = (pagination?.page ?? 0) + 1;
  const totalItems = pagination?.totalItems ?? 0;

  // Show skeleton while loading
  if (isLoading) {
    return <TransactionHistoryTableSkeleton />;
  }

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">
            {t.transactionHistory.title}
          </div>
          <div className="text-sm text-slate-600 dark:text-white/70">
            {t.transactionHistory.description ||
              'Xem tất cả các giao dịch số dư của bạn'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="w-full md:w-48">
          <Select
            value={directionFilter}
            onChange={e => setDirectionFilter(e.target.value)}
            className="dark:bg-background/5 rounded-xl border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring dark:border-border dark:text-foreground"
          >
            <option value="all">{t.transactionHistory.filters.all}</option>
            <option value="IN">{t.transactionHistory.filters.in}</option>
            <option value="OUT">{t.transactionHistory.filters.out}</option>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select
            value={sourceTypeFilter}
            onChange={e => setSourceTypeFilter(e.target.value)}
            className="dark:bg-background/5 rounded-xl border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring dark:border-border dark:text-foreground"
          >
            <option value="all">{t.transactionHistory.filters.all}</option>
            <option value="DEPOSIT">
              {t.transactionHistory.filters.deposit}
            </option>
            <option value="PAYMENT">
              {t.transactionHistory.filters.payment}
            </option>
            <option value="REFUND">
              {t.transactionHistory.filters.refund}
            </option>
            <option value="SEMESTER_BONUS">
              {t.transactionHistory.filters.semester_bonus}
            </option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-white/10">
              <th className="px-4 py-2.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                {t.transactionHistory.table.transactionDate}
              </th>
              <th className="px-4 py-2.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                {t.transactionHistory.table.type}
              </th>
              <th className="px-4 py-2.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                {t.transactionHistory.table.description}
              </th>
              <th className="px-4 py-2.5 text-right text-sm font-semibold text-slate-900 dark:text-white">
                {t.transactionHistory.table.amount}
              </th>
              <th className="px-4 py-2.5 text-center text-sm font-semibold text-slate-900 dark:text-white">
                {t.transactionHistory.table.direction}
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-destructive dark:text-destructive"
                >
                  {t.transactionHistory.errors.loadFailed}
                </td>
              </tr>
            ) : !filteredData || filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-600 dark:text-white/70"
                >
                  {t.transactionHistory.empty}
                </td>
              </tr>
            ) : (
              filteredData.map(item => {
                const isIn = item.direction === 'IN';
                return (
                  <tr
                    key={item.ledgerId}
                    className="border-b border-slate-200/70 transition-colors hover:bg-slate-50/50 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-2.5 text-sm text-slate-600 dark:text-white/70">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-600 dark:text-white/70">
                      {getSourceTypeLabel(item.sourceType)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-600 dark:text-white/70">
                      {item.description || '-'}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right text-sm font-medium',
                        isIn
                          ? 'text-green-600 dark:text-green-400' // Success color - keep specific
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {isIn ? '+' : '-'}
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {getDirectionBadge(item.direction)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalItems > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between border-t border-border pt-4 dark:border-border">
          <div className="text-sm text-slate-600 dark:text-white/70">
            {t.transactionHistory.pagination?.showing || 'Hiển thị'}{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {(displayPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            -
            <span className="font-medium text-slate-900 dark:text-white">
              {Math.min(displayPage * ITEMS_PER_PAGE, totalItems)}
            </span>{' '}
            {t.transactionHistory.pagination?.of || 'trên'}{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {totalItems}
            </span>{' '}
            {t.transactionHistory.pagination?.items || 'mục'}
          </div>
          <Pagination
            page={displayPage}
            pageSize={ITEMS_PER_PAGE}
            total={totalItems}
            onChange={newPage => setPage(newPage - 1)} // Convert back to 0-indexed
          />
        </div>
      )}
    </div>
  );
}
