'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  uploadedFilesMock,
  UploadedFileItem,
  fileTypeFilters,
  dateRangeFilters,
} from '@/data/uploadedFilesMock';
import { FileIcon } from './FileIcon';

const PAGE_SIZE = 10;

type FileTypeFilterValue = 'all' | 'pdf' | 'docx' | 'xlsx' | 'pptx';
type DateRangeFilterValue = 'all' | 'today' | 'week' | 'month' | '3months';
type SortColumn =
  | 'file_name'
  | 'uploaded_at'
  | 'last_printed_at'
  | 'print_count'
  | null;
type SortDirection = 'asc' | 'desc' | null;

function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileTypeFromMime(fileType: string): FileTypeFilterValue {
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('wordprocessingml')) return 'docx';
  if (fileType.includes('spreadsheetml')) return 'xlsx';
  if (fileType.includes('presentationml')) return 'pptx';
  return 'all';
}

interface UploadedFilesTableProps {
  onStartPrint?: (file: UploadedFileItem) => void;
}

export function UploadedFilesTable({ onStartPrint }: UploadedFilesTableProps) {
  const t = useTranslations('student.print.uploadedFiles');
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState<FileTypeFilterValue>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFileItem | null>(
    null
  );
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [fileToPrint, setFileToPrint] = useState<UploadedFileItem | null>(null);

  // Filter data
  const filtered = useMemo(() => {
    return uploadedFilesMock.filter(item => {
      const matchesSearch =
        !search || item.file_name.toLowerCase().includes(search.toLowerCase());
      const matchesFileType =
        fileType === 'all' || getFileTypeFromMime(item.file_type) === fileType;

      // Date range filtering
      let matchesDateRange = true;
      if (dateRange !== 'all') {
        const now = new Date();
        const itemDate = new Date(item.uploaded_at);
        const diffTime = now.getTime() - itemDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (dateRange) {
          case 'today':
            matchesDateRange = diffDays < 1;
            break;
          case 'week':
            matchesDateRange = diffDays < 7;
            break;
          case 'month':
            matchesDateRange = diffDays < 30;
            break;
          case '3months':
            matchesDateRange = diffDays < 90;
            break;
        }
      }

      // Custom date range
      let matchesTime = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.uploaded_at).getTime();
        if (startDate) {
          const start = new Date(startDate).getTime();
          matchesTime = matchesTime && itemDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
          matchesTime = matchesTime && itemDate <= end;
        }
      }

      return (
        matchesSearch && matchesFileType && matchesDateRange && matchesTime
      );
    });
  }, [search, fileType, dateRange, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [
    filtered.length,
    search,
    fileType,
    dateRange,
    startDate,
    endDate,
    sortColumn,
    sortDirection,
  ]);

  // Sort data
  const sorted = useMemo(() => {
    if (!sortColumn || !sortDirection) return filtered;
    const data = [...filtered];
    data.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      switch (sortColumn) {
        case 'file_name':
          return direction * a.file_name.localeCompare(b.file_name);
        case 'uploaded_at':
          return (
            direction *
            (new Date(a.uploaded_at).getTime() -
              new Date(b.uploaded_at).getTime())
          );
        case 'last_printed_at':
          const aTime = a.last_printed_at
            ? new Date(a.last_printed_at).getTime()
            : 0;
          const bTime = b.last_printed_at
            ? new Date(b.last_printed_at).getTime()
            : 0;
          return direction * (aTime - bTime);
        case 'print_count':
          return direction * (a.print_count - b.print_count);
        default:
          return 0;
      }
    });
    return data;
  }, [filtered, sortColumn, sortDirection]);

  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const sortIcon = (column: Exclude<SortColumn, null>) => {
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
  };

  const handlePrintClick = (file: UploadedFileItem) => {
    setFileToPrint(file);
    setPrintModalOpen(true);
  };

  const handleConfirmPrint = () => {
    if (fileToPrint && onStartPrint) {
      onStartPrint(fileToPrint);
      setPrintModalOpen(false);
      setFileToPrint(null);
    }
  };

  const handleCancelPrint = () => {
    setPrintModalOpen(false);
    setFileToPrint(null);
  };

  const handleDeleteClick = (file: UploadedFileItem) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      // TODO: Implement delete action
      console.log('Delete file:', fileToDelete);
      setDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('title')}
          </div>
          <div className="text-sm text-slate-500 dark:text-white/60">
            {t('description')}
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
              placeholder={t('searchPlaceholder')}
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
            {t('filters')}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={fileType}
            onChange={e => setFileType(e.target.value as FileTypeFilterValue)}
            className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            {fileTypeFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </Select>
          <Select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as DateRangeFilterValue)}
            className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            {dateRangeFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </Select>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder={t('dateFrom')}
            className="w-full"
          />
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder={t('dateTo')}
            className="w-full"
            min={startDate || undefined}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                {t('table.fileName')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                {t('table.pages')}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                onClick={() => toggleSort('uploaded_at')}
              >
                <div className="flex items-center">
                  {t('table.uploadedAt')}
                  {sortIcon('uploaded_at')}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                onClick={() => toggleSort('last_printed_at')}
              >
                <div className="flex items-center">
                  {t('table.lastPrintedAt')}
                  {sortIcon('last_printed_at')}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                onClick={() => toggleSort('print_count')}
              >
                <div className="flex items-center justify-center">
                  {t('table.printCount')}
                  {sortIcon('print_count')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500 dark:text-white/50"
                >
                  {t('table.noData')}
                </td>
              </tr>
            ) : (
              paginated.map(item => {
                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileIcon fileName={item.file_name} size={32} />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.file_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                      {item.page_count || '--'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                      {formatDate(item.uploaded_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                      {formatDate(item.last_printed_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/30">
                        {item.print_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Tooltip content={t('table.print')}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                            onClick={() => handlePrintClick(item)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M6 9V2h12v7" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <path d="M6 14h12v8H6z" />
                            </svg>
                          </Button>
                        </Tooltip>
                        <Tooltip content={t('table.delete')}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteClick(item)}
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
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
          <div className="text-sm text-slate-600 dark:text-white/60">
            {t('table.showing', {
              from: (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, sorted.length),
              total: sorted.length,
            })}
          </div>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={sorted.length}
            onChange={setPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        title={t('deleteModal.title')}
        size="md"
      >
        <div className="px-6 py-4">
          <p className="text-slate-600 dark:text-white/70">
            {t('deleteModal.message', {
              fileName: fileToDelete?.file_name || '',
            })}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="rounded-lg border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              {t('deleteModal.cancel')}
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              {t('deleteModal.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Print Confirmation Modal */}
      <Modal
        isOpen={printModalOpen}
        onClose={handleCancelPrint}
        title={t('printModal.title')}
        size="md"
      >
        <div className="px-6 py-4">
          <p className="text-slate-600 dark:text-white/70">
            {t('printModal.message', {
              fileName: fileToPrint?.file_name || '',
            })}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancelPrint}
              className="rounded-lg border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              {t('printModal.cancel')}
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmPrint}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {t('printModal.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
