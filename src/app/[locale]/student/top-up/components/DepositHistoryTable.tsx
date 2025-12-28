'use client';

import React, { useState } from 'react';
import { useDepositHistory } from '@/lib/api/services/payment';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import CountUp from '@/components/ui/CountUp';
import BalanceCountUp from '@/app/[locale]/student/profile/components/BalanceCountUp';
import { DepositHistoryTableSkeleton } from './DepositHistoryTableSkeleton';
import type { DepositHistoryItem } from '@/types/api';
import { cn } from '@/lib/utils/cn';

interface DepositHistoryTableProps {
  t: Record<string, any>;
  onDepositClick?: (depositId: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function DepositHistoryTable({
  t,
  onDepositClick,
}: DepositHistoryTableProps) {
  const [page, setPage] = useState(0); // Backend uses 0-indexed pages
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch deposit history
  const { data, isLoading, error } = useDepositHistory({
    page,
    limit: ITEMS_PER_PAGE,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  // API response structure: ApiResponse<DepositHistoryResponse>
  // DepositHistoryResponse contains: { statistics, data: PaginatedApiResponse<DepositHistoryItem> }
  const historyResponse = data?.data?.data;
  const statistics = historyResponse?.statistics;
  const historyData = historyResponse?.data; // This is PaginatedApiResponse<DepositHistoryItem>
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
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: DepositHistoryItem['paymentStatus']) => {
    const statusConfig = {
      completed: {
        label: t.history.status.completed,
        className:
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      },
      pending: {
        label: t.history.status.pending,
        className:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      cancelled: {
        label: t.history.status.cancelled,
        className:
          'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground',
      },
      expired: {
        label: t.history.status.expired,
        className:
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      failed: {
        label: t.history.status.failed,
        className:
          'bg-destructive/10 text-destructive dark:bg-destructive/30 dark:text-destructive',
      },
      refunded: {
        label: t.history.status.refunded,
        className:
          'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      },
    };

    const config = statusConfig[status] || statusConfig.completed;
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          config.className
        )}
      >
        {config.label}
      </span>
    );
  };

  // Handle search with debounce
  const [searchInput, setSearchInput] = useState('');
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(0); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  // Convert 0-indexed page to 1-indexed for Pagination component
  const displayPage = (pagination?.page ?? 0) + 1;
  const totalItems = pagination?.totalItems ?? 0;

  // Show skeleton while loading
  if (isLoading) {
    return <DepositHistoryTableSkeleton />;
  }

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">
            {t.history.title}
          </div>
          <div className="text-sm text-slate-600 dark:text-white/70">
            {t.history.description ||
              'Xem lịch sử các giao dịch nạp tiền của bạn'}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-slate-200/70 bg-white/50 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-slate-600 dark:text-white/70">
              {t.history.statistics.totalTransactions}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              <CountUp to={statistics.totalTransactions} />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/50 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-slate-600 dark:text-white/70">
              {t.history.statistics.completedTransactions}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              <CountUp to={statistics.completedTransactions} />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/50 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-slate-600 dark:text-white/70">
              {t.history.statistics.totalDeposited}
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              <BalanceCountUp
                to={statistics.totalDeposited}
                duration={1.5}
                className="inline-block"
              />
              <span className="ml-1">₫</span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/50 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-slate-600 dark:text-white/70">
              {t.history.statistics.totalBonus}
            </div>
            <div className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
              {' '}
              {/* Success color - keep specific */}
              <BalanceCountUp
                to={statistics.totalBonus}
                duration={1.5}
                className="inline-block"
              />
              <span className="ml-1">₫</span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/50 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-slate-600 dark:text-white/70">
              {t.history.statistics.totalSpent}
            </div>
            <div className="mt-1 text-lg font-bold text-red-600 dark:text-red-400">
              <BalanceCountUp
                to={statistics.totalSpent}
                duration={1.5}
                className="inline-block"
              />
              <span className="ml-1">₫</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 md:max-w-md">
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
            />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            className="ml-2 w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
            placeholder={t.history.searchPlaceholder}
          />
        </div>
        <div className="w-full md:ml-auto md:w-48">
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="all">{t.history.filters.all}</option>
            <option value="completed">{t.history.filters.completed}</option>
            <option value="pending">{t.history.filters.pending}</option>
            <option value="cancelled">{t.history.filters.cancelled}</option>
            <option value="expired">{t.history.filters.expired}</option>
            <option value="failed">{t.history.filters.failed}</option>
            <option value="refunded">{t.history.filters.refunded}</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-white/10">
              <th className="px-4 py-2.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                {t.history.table.depositCode}
              </th>
              <th className="px-4 py-2.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                {t.history.table.transactionDate}
              </th>
              <th className="px-4 py-2.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                {t.history.table.packageName}
              </th>
              <th className="px-4 py-2.5 text-right text-sm font-semibold text-slate-900 dark:text-white">
                {t.history.table.depositAmount}
              </th>
              <th className="px-4 py-2.5 text-right text-sm font-semibold text-slate-900 dark:text-white">
                {t.history.table.bonusAmount}
              </th>
              <th className="px-4 py-2.5 text-right text-sm font-semibold text-slate-900 dark:text-white">
                {t.history.table.totalCredited}
              </th>
              <th className="px-4 py-2.5 text-center text-sm font-semibold text-slate-900 dark:text-white">
                {t.history.table.status}
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-red-600 dark:text-red-400"
                >
                  {t.history.errors.loadFailed}
                </td>
              </tr>
            ) : !historyData?.data || historyData.data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-600 dark:text-white/70"
                >
                  {t.history.empty}
                </td>
              </tr>
            ) : (
              historyData.data.map(item => (
                <tr
                  key={item.depositId}
                  onClick={() => {
                    if (item.paymentStatus === 'pending' && onDepositClick) {
                      onDepositClick(item.depositId);
                    }
                  }}
                  className={cn(
                    'border-b border-slate-200/70 transition-colors dark:border-white/10',
                    item.paymentStatus === 'pending' && onDepositClick
                      ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5'
                      : ''
                  )}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                        {item.depositCode}
                      </span>
                      {item.paymentStatus === 'pending' && onDepositClick && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          ({t.history.table.clickToPay})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-slate-600 dark:text-white/70">
                    {formatDate(item.transactionDate)}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-slate-600 dark:text-white/70">
                    {item.packageName || (
                      <span className="text-slate-400 dark:text-slate-500">
                        {t.history.table.customAmount}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(item.depositAmount)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-medium text-slate-900 dark:text-white">
                    {item.bonusAmount > 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        +{formatCurrency(item.bonusAmount)}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.totalCredited)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {getStatusBadge(item.paymentStatus)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalItems > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
          <div className="text-sm text-slate-600 dark:text-white/70">
            {t.history.pagination?.showing || 'Hiển thị'}{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {(displayPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            -
            <span className="font-medium text-slate-900 dark:text-white">
              {Math.min(displayPage * ITEMS_PER_PAGE, totalItems)}
            </span>{' '}
            {t.history.pagination?.of || 'trên'}{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {totalItems}
            </span>{' '}
            {t.history.pagination?.items || 'mục'}
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
