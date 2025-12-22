'use client';

import React, { useMemo, useState, useEffect } from 'react';
import type {
  PrintHistoryItem,
  StatusFilterValue,
  SortColumn,
  SortDirection,
} from '../types';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import {
  usePrintHistoryStats,
  usePrintHistory,
  usePrintJobDetail,
  type PrintHistoryFilters,
} from '@/lib/api/services/student';
import {
  mapHistoryItemToFE,
  mapJobDetailToFE,
} from '@/lib/utils/printHistoryMapper';
import { SummaryCard } from './SummaryCard';
import { HistoryTable } from './HistoryTable';
import { HistoryFilters } from './HistoryFilters';
import { HistoryDetailModal } from './HistoryDetailModal';
import { HistoryTableSkeleton } from './HistoryTableSkeleton';
import { PAGE_SIZE } from '../constants';

export function PrintHistory() {
  const [status, setStatus] = useState<StatusFilterValue>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [colorMode, setColorMode] = useState<
    'all' | PrintHistoryItem['colorMode']
  >('all');
  const [duplex, setDuplex] = useState<'all' | 'one-sided' | 'double-sided'>(
    'all'
  );
  const [fileType, setFileType] = useState<
    'all' | 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'jpg'
  >('all');
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Map FE sort column to BE sort field
  const getSortBy = (column: SortColumn): string | null => {
    switch (column) {
      case 'document':
      case 'printer':
        return null; // These are computed fields, sort client-side
      case 'time':
        return 'createdAt';
      case 'status':
        return 'printStatus';
      case 'pages':
        return 'totalPages';
      case 'mode':
        return null; // Sort client-side
      default:
        return 'createdAt';
    }
  };

  // Build filters for API
  const apiFilters: PrintHistoryFilters = useMemo(() => {
    const sortBy = getSortBy(sortColumn);
    const filters: PrintHistoryFilters = {
      page: page - 1, // BE uses 0-indexed pages
      limit: PAGE_SIZE,
    };

    // Only add sort params if we have a valid BE sort field
    if (sortBy) {
      filters.sortBy = sortBy;
      filters.sortDirection = sortDirection || 'desc';
    } else {
      // Default to createdAt desc if no valid sort field
      filters.sortBy = 'createdAt';
      filters.sortDirection = 'desc';
    }

    if (status !== 'all') {
      filters.status = status;
    }
    if (startDate) {
      filters.fromDate = startDate;
    }
    if (endDate) {
      filters.toDate = endDate;
    }
    if (colorMode !== 'all') {
      if (colorMode === 'color') {
        filters.supportsColor = true;
      }
    }
    if (duplex !== 'all') {
      filters.supportsDuplex = duplex === 'double-sided';
    }
    if (fileType !== 'all') {
      filters.fileType = fileType;
    }

    return filters;
  }, [
    status,
    startDate,
    endDate,
    colorMode,
    duplex,
    fileType,
    page,
    sortColumn,
    sortDirection,
  ]);

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = usePrintHistoryStats();

  // Fetch history list
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = usePrintHistory(apiFilters);

  // Fetch job detail when selected
  const { data: detailData, isLoading: detailLoading } =
    usePrintJobDetail(selectedJobId);

  // Map BE response to FE format
  const historyItems = useMemo(() => {
    if (!historyData?.data?.data) return [];

    let items = historyData.data.data.map(mapHistoryItemToFE);

    // Client-side filtering for search and color mode (if not color)
    items = items.filter(item => {
      // Search filter (client-side since BE doesn't support it)
      if (search.trim()) {
        const term = search.trim().toLowerCase();
        const matchesSearch =
          item.documentName.toLowerCase().includes(term) ||
          item.printerName.toLowerCase().includes(term) ||
          item.location.toLowerCase().includes(term) ||
          item.id.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Color mode filter for grayscale/black-white (client-side)
      if (colorMode !== 'all' && colorMode !== 'color') {
        if (item.colorMode !== colorMode) return false;
      }

      return true;
    });

    // Client-side sorting for fields that can't be sorted on BE
    const sortBy = getSortBy(sortColumn);
    if (sortColumn && sortDirection && !sortBy) {
      items = [...items].sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        switch (sortColumn) {
          case 'document':
            return direction * a.documentName.localeCompare(b.documentName);
          case 'printer':
            return direction * a.printerName.localeCompare(b.printerName);
          case 'mode':
            return direction * a.colorMode.localeCompare(b.colorMode);
          default:
            return 0;
        }
      });
    }

    return items;
  }, [historyData, search, colorMode, sortColumn, sortDirection]);

  // Get selected item from detail or history
  const selected = useMemo(() => {
    if (selectedJobId && detailData?.data?.data) {
      return mapJobDetailToFE(detailData.data.data);
    }
    if (selectedJobId) {
      return historyItems.find(item => item.id === selectedJobId) || null;
    }
    return null;
  }, [selectedJobId, detailData, historyItems]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    status,
    startDate,
    endDate,
    colorMode,
    duplex,
    fileType,
    sortColumn,
    sortDirection,
  ]);

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

  // Get pagination info from BE
  const pagination = historyData?.data?.pagination;
  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 0;

  // Get stats
  const stats = statsData?.data?.data;
  const jobsThisMonth = stats?.jobsThisMonth?.total || 0;
  const pagesLast30Days = stats?.pagesLast30Days || 0;
  const successRate = stats?.successRate?.percent || 0;
  const growthPercent = stats?.jobsThisMonth?.growthPercent || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Công việc tháng này"
          value={`${jobsThisMonth} việc`}
          caption="Bao gồm cả in màu và đen trắng"
          trend={
            growthPercent !== 0
              ? {
                  label: `${growthPercent > 0 ? 'Tăng' : 'Giảm'} ${Math.abs(growthPercent)}% so với tháng trước`,
                  positive: growthPercent > 0,
                }
              : undefined
          }
          isLoading={statsLoading}
        />
        <SummaryCard
          title="Số trang đã in"
          value={`${pagesLast30Days} trang`}
          caption="Tính trong phạm vi 30 ngày gần nhất"
          isLoading={statsLoading}
        />
        <SummaryCard
          title="Tỷ lệ thành công"
          value={`${successRate}%`}
          caption="Bao gồm hoàn tất và đang chờ"
          trend={{
            label: successRate >= 95 ? 'Ổn định' : 'Cần cải thiện kết nối',
            positive: successRate >= 95,
          }}
          isLoading={statsLoading}
        />
      </div>

      {/* History Table Section */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              Lịch sử in gần đây
            </div>
            <div className="text-sm text-slate-500 dark:text-white/60">
              Tìm kiếm, lọc và sắp xếp lịch sử
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
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ml-2 w-56 bg-transparent text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                placeholder="Tìm theo tên tài liệu, máy in..."
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
              Bộ lọc nâng cao
            </Button>
          </div>
        </div>

        <HistoryFilters
          status={status}
          onStatusChange={setStatus}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
          duplex={duplex}
          onDuplexChange={setDuplex}
          fileType={fileType}
          onFileTypeChange={setFileType}
          showFilters={showFilters}
        />

        <div className="flex flex-col gap-3">
          {historyLoading ? (
            <HistoryTableSkeleton />
          ) : historyError ? (
            <div className="rounded-xl border border-rose-200/70 bg-rose-50/80 px-4 py-10 text-center text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            </div>
          ) : (
            <>
              <HistoryTable
                items={historyItems}
                onItemClick={item => setSelectedJobId(item.id)}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              {totalPages > 0 && (
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={totalItems}
                  onChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <HistoryDetailModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedJobId(null)}
        item={selected}
        isLoading={detailLoading}
      />
    </div>
  );
}
