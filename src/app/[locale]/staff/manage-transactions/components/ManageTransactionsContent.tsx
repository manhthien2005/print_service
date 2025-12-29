'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { toast } from '@/components/ui/Toast';
import {
  useAdminTransactionHistory,
  useAdminTransactionHistoryStats,
  type AdminTransactionHistoryItem,
} from '@/lib/api/services/adminTransactionHistory';
import { TransactionStats } from './TransactionStats';
import { TransactionFiltersComponent } from './TransactionFilters';
import { TransactionTable } from './TransactionTable';
import { TransactionDetailModal } from './TransactionDetailModal';
import { TransactionStatsSkeleton } from './TransactionSkeleton';
import type { TransactionFilters, SortColumn, SortDirection } from '../types';

const PAGE_SIZE = 20;

export function ManageTransactionsContent() {
  const t = useTranslations('staff.manageTransactions');

  // State management
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedItem, setSelectedItem] =
    useState<AdminTransactionHistoryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 0,
    limit: PAGE_SIZE,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  // Convert date strings to ISO 8601 format for API
  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Build API filters
  const apiFilters = useMemo(() => {
    const apiFilterParams: Parameters<typeof useAdminTransactionHistory>[0] = {
      page: page - 1, // Convert to 0-indexed
      limit: PAGE_SIZE,
      sortBy: sortColumn || 'createdAt',
      sortDirection: sortDirection || 'desc',
    };

    if (filters.studentId) apiFilterParams.studentId = filters.studentId;
    if (filters.from) apiFilterParams.from = formatDateForAPI(filters.from);
    if (filters.to) apiFilterParams.to = formatDateForAPI(filters.to);
    if (filters.direction && filters.direction !== 'all')
      apiFilterParams.direction = filters.direction;
    if (filters.sourceType && filters.sourceType !== 'all')
      apiFilterParams.sourceType = filters.sourceType;

    return apiFilterParams;
  }, [filters, page, sortColumn, sortDirection]);

  // Stats filters (same date range, no pagination)
  const statsFilters = useMemo(() => {
    const statsParams: Parameters<typeof useAdminTransactionHistoryStats>[0] =
      {};
    if (filters.studentId) statsParams.studentId = filters.studentId;
    if (filters.from) statsParams.from = formatDateForAPI(filters.from);
    if (filters.to) statsParams.to = formatDateForAPI(filters.to);
    return statsParams;
  }, [filters]);

  // API calls
  const {
    data: historyResponse,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useAdminTransactionHistory(apiFilters);

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
  } = useAdminTransactionHistoryStats(statsFilters);

  // Extract data
  const historyItems: AdminTransactionHistoryItem[] =
    historyResponse?.data?.data || [];
  const historyData = historyResponse?.data;
  // Stats response is direct (not wrapped)
  const stats = statsResponse?.data;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [
    filters.direction,
    filters.sourceType,
    filters.from,
    filters.to,
    filters.studentId,
  ]);

  // Handle sorting
  const toggleSort = (column: Exclude<SortColumn, null>) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else setSortDirection('asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle item click
  const handleItemClick = (item: AdminTransactionHistoryItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
  };

  // Error handling
  useEffect(() => {
    if (historyError) {
      toast.error(t('errors.loadHistoryFailed'));
    }
    if (statsError) {
      toast.error(t('errors.loadStatsFailed'));
    }
  }, [historyError, statsError, t]);

  return (
    <div className="flex flex-col gap-6">
      {/* Statistics Cards */}
      {isLoadingStats ? (
        <TransactionStatsSkeleton />
      ) : (
        <TransactionStats stats={stats} isLoading={isLoadingStats} />
      )}

      {/* Main Table Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('table.title')}
            </div>
            <div className="text-sm text-slate-500 dark:text-white/60">
              {t('table.subtitle')}
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-white/10 dark:bg-white/5">
              <svg
                className="h-4 w-4 text-slate-400"
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
              <Input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  // Update studentId filter when search changes
                  setFilters(prev => ({
                    ...prev,
                    studentId: e.target.value || undefined,
                  }));
                }}
                className="ml-2 w-56 border-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                placeholder={t('table.searchPlaceholder')}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(prev => !prev)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6h18M7 12h10M10 18h4"
                />
              </svg>
              {t('table.advancedFilters')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <TransactionFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        )}

        {/* Table */}
        <TransactionTable
          items={historyItems}
          isLoading={isLoadingHistory}
          onItemClick={handleItemClick}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={toggleSort}
        />

        {/* Pagination */}
        {historyData?.pagination && historyData.pagination.totalPages > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={historyData.pagination.totalItems}
            onChange={setPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
}
