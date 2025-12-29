'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Tooltip } from '@/components/ui/Tooltip';
import { UploadedFileItem } from '@/app/[locale]/student/print/types';
import { FileIcon } from './FileIcon';
import { UploadedFilesTableSkeleton } from './UploadedFilesTableSkeleton';
import {
  useUploadedFiles,
  useDeleteUploadedFile,
  useUploadFile,
  usePermittedFileTypes,
  studentPrintKeys,
} from '@/app/[locale]/student/print/api';
import { mapUploadedFilesResponse } from '@/lib/utils/mappers/studentPrintMapper';
import { toast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils/cn';

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

function formatDate(value?: string, locale: string = 'vi') {
  if (!value) return '--';
  return new Date(value).toLocaleDateString(
    locale === 'vi' ? 'vi-VN' : 'en-US',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

// Removed getFileTypeFromMime - not used anymore as API handles file type filtering

interface UploadedFilesTableProps {
  onStartPrint?: (file: UploadedFileItem) => void;
}

export function UploadedFilesTable({ onStartPrint }: UploadedFilesTableProps) {
  const t = useTranslations('student.print.uploadedFiles');
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState<FileTypeFilterValue>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0); // 0-indexed for API
  const [sortColumn, setSortColumn] = useState<SortColumn>('uploaded_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFileItem | null>(
    null
  );
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [fileToPrint, setFileToPrint] = useState<UploadedFileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFilesToUpload, setSelectedFilesToUpload] = useState<File[]>(
    []
  );
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const deleteFileMutation = useDeleteUploadedFile();
  const uploadFileMutation = useUploadFile();
  const queryClient = useQueryClient();
  const { data: permittedFileTypesData } = usePermittedFileTypes();

  // Generate supported file types list for display
  const supportedFileTypesList = useMemo(() => {
    const permittedFileTypes = permittedFileTypesData?.data?.data || [];
    return permittedFileTypes
      .map((t: any) => {
        const ext =
          t.fileExtension || (t.extension ? t.extension.replace('.', '') : '');
        return ext ? ext.toUpperCase() : null;
      })
      .filter(Boolean)
      .join(', ');
  }, [permittedFileTypesData]);

  // Load files from API
  const {
    data: filesData,
    isLoading,
    error,
  } = useUploadedFiles({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    file_type: fileType !== 'all' ? fileType : undefined,
    date_range: dateRange !== 'all' ? dateRange : undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    sort_by: sortColumn || undefined,
    sort_direction: sortDirection || undefined,
  });

  // Map API response to UploadedFileItem format
  const files = useMemo(() => {
    if (filesData?.data?.data) {
      const apiFiles = mapUploadedFilesResponse(filesData.data.data);
      return apiFiles.map(file => ({
        id: file.uploadedFileId,
        file_name: file.fileName,
        file_type: file.fileType,
        file_size_kb: file.fileSizeKb,
        uploaded_at: file.uploadedAt,
        page_count: file.pageCount,
        last_printed_at: file.lastPrintedAt || undefined,
        print_count: file.printCount,
        file_url: file.fileUrl, // Store fileUrl for download
      })) as (UploadedFileItem & { file_url?: string })[];
    }
    return [];
  }, [filesData]);

  const pagination = filesData?.data?.pagination;

  useEffect(() => {
    setPage(0); // Reset to first page when filters change
  }, [
    search,
    fileType,
    dateRange,
    startDate,
    endDate,
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

  const sortIcon = (column: Exclude<SortColumn, null>) => {
    if (sortColumn !== column || !sortDirection)
      return (
        <svg
          className="ml-1 h-4 w-4 text-muted-foreground"
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
        className="ml-1 h-4 w-4 text-primary"
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
        className="ml-1 h-4 w-4 text-primary"
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

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await deleteFileMutation.mutateAsync(fileToDelete.id);
      toast.success(t('toasts.deleteSuccess'));
      setDeleteModalOpen(false);
      setFileToDelete(null);
    } catch (err: unknown) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t('toasts.deleteFailed');
      toast.error(errorMessage);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  };

  // Multi-select handlers
  const toggleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const handleViewFile = (file: UploadedFileItem) => {
    const fileUrl = (file as any).file_url;
    if (!fileUrl) {
      toast.error(t('toasts.fileNotFound'));
      return;
    }

    try {
      // Open file in a new browser tab for viewing
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      toast.error(t('toasts.openFileFailed'));
      console.error('Open file error:', err);
    }
  };

  const handleDownloadFile = async (file: UploadedFileItem) => {
    const fileUrl = (file as any).file_url;
    if (!fileUrl) {
      toast.error(t('toasts.fileNotFound'));
      return;
    }

    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.file_name;
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t('toasts.downloadSuccess'));
    } catch (err: unknown) {
      toast.error(t('toasts.downloadFailed'));
      console.error('Download error:', err);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedFiles.size === 0) return;

    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));

    try {
      // Download each file using fileUrl from API
      for (const file of selectedFileItems) {
        const fileUrl = (file as any).file_url;
        if (!fileUrl) {
          console.warn(`File ${file.id} does not have fileUrl`);
          continue;
        }

        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = file.file_name;
        link.target = '_blank'; // Open in new tab as fallback
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Add small delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      toast.success(
        t('toasts.bulkDownloadSuccess', { count: selectedFiles.size })
      );
      setSelectedFiles(new Set());
    } catch (err: unknown) {
      toast.error(t('toasts.downloadFailed'));
      console.error('Download error:', err);
    }
  };

  const handleDeselectAll = () => {
    setSelectedFiles(new Set());
  };

  // Upload multiple files handlers
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFilesToList = (files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFilesToUpload(prev => [...prev, ...fileArray]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFilesToList(e.target.files);
    // Reset input to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFilesToList(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFileFromUpload = (index: number) => {
    setSelectedFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (selectedFilesToUpload.length === 0) return;

    const permittedFileTypes = permittedFileTypesData?.data?.data || [];
    const maxSizeMB = 50;
    let successCount = 0;
    let errorCount = 0;

    // Validate all files first
    for (const file of selectedFilesToUpload) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = permittedFileTypes.some(
        (type: {
          fileExtension?: string;
          extension?: string;
          mimeType?: string;
          mime_type?: string;
        }) => {
          const ext =
            type.fileExtension ||
            (type.extension ? type.extension.replace('.', '') : '');
          return (
            (ext && `.${ext}`.toLowerCase() === fileExtension.toLowerCase()) ||
            type.mimeType === file.type ||
            type.mime_type === file.type
          );
        }
      );

      if (!isValidType) {
        toast.error(t('toasts.fileNotSupported', { fileName: file.name }));
        errorCount++;
        continue;
      }

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast.error(
          t('toasts.fileTooLarge', { fileName: file.name, maxSize: maxSizeMB })
        );
        errorCount++;
        continue;
      }
    }

    // Upload files sequentially
    for (const file of selectedFilesToUpload) {
      const fileId = `${file.name}-${file.size}`;
      setUploadingFiles(prev => new Set(prev).add(fileId));
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        await uploadFileMutation.mutateAsync(file);
        successCount++;
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      } catch (err: unknown) {
        errorCount++;
        const errorMessage =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string })?.message ||
          t('toasts.uploadFailed');
        toast.error(`${file.name}: ${errorMessage}`);
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    }

    // Refresh file list
    queryClient.invalidateQueries({
      queryKey: studentPrintKeys.files.all,
    });

    // Show summary
    if (successCount > 0) {
      toast.success(t('toasts.uploadSuccess', { count: successCount }));
    }
    if (errorCount > 0) {
      toast.error(t('toasts.uploadPartialSuccess', { errorCount }));
    }

    // Close modal and reset
    setUploadModalOpen(false);
    setSelectedFilesToUpload([]);
    setUploadProgress({});
    setIsDragging(false);
  };

  const handleCloseUploadModal = () => {
    if (uploadingFiles.size === 0) {
      setUploadModalOpen(false);
      setSelectedFilesToUpload([]);
      setUploadProgress({});
      setIsDragging(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold text-foreground dark:text-foreground">
            {t('title')}
          </div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            {t('description')}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Button
            onClick={() => setUploadModalOpen(true)}
            variant="default"
            size="sm"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3 3V4"
              />
            </svg>
            {t('upload')}
          </Button>
          <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-white/10 dark:bg-white/5">
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
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ml-2 w-56 bg-transparent text-foreground outline-none placeholder:text-muted-foreground dark:text-foreground"
              placeholder={t('searchPlaceholder')}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(prev => !prev)}
            className="dark:bg-background/5 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary hover:bg-muted dark:border-border dark:text-foreground"
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
            className="focus:ring-primary/50 dark:bg-background/5 rounded-xl border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 dark:border-border dark:text-foreground"
          >
            {[
              { value: 'all', label: t('fileTypeFilters.all') },
              { value: 'pdf', label: t('fileTypeFilters.pdf') },
              { value: 'docx', label: t('fileTypeFilters.docx') },
              { value: 'xlsx', label: t('fileTypeFilters.xlsx') },
              { value: 'pptx', label: t('fileTypeFilters.pptx') },
            ].map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </Select>
          <Select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as DateRangeFilterValue)}
            className="focus:ring-primary/50 dark:bg-background/5 rounded-xl border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 dark:border-border dark:text-foreground"
          >
            {[
              { value: 'all', label: t('dateRangeFilters.all') },
              { value: 'today', label: t('dateRangeFilters.today') },
              { value: 'week', label: t('dateRangeFilters.week') },
              { value: 'month', label: t('dateRangeFilters.month') },
              { value: '3months', label: t('dateRangeFilters.3months') },
            ].map(filter => (
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

      {/* Loading State */}
      {isLoading && <UploadedFilesTableSkeleton />}

      {/* Error State */}
      {error && !isLoading && (
        <div className="border-destructive/30 bg-destructive/10 dark:border-destructive/30 dark:bg-destructive/10 rounded-lg border p-4">
          <p className="text-sm text-destructive dark:text-destructive">
            {(error as any)?.response?.data?.message ||
              (error as any)?.message ||
              t('errors.loadFailed')}
          </p>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedFiles.size > 0 && (
        <div className="border-primary/30 bg-primary/10 dark:border-primary/30 dark:bg-primary/10 flex items-center justify-between rounded-lg border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary dark:text-primary">
              {t('selectedCount', { count: selectedFiles.size })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="dark:bg-background/5 dark:hover:bg-background/10 h-7 border-input bg-background text-xs text-foreground hover:bg-muted dark:border-input dark:text-foreground"
            >
              {t('deselectAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDownload}
              className="hover:bg-primary/10 dark:border-primary/50 dark:bg-background/5 dark:hover:bg-primary/20 flex items-center gap-2 border-primary bg-background text-primary dark:text-primary"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t('downloadSelected', { count: selectedFiles.size })}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      files.length > 0 && selectedFiles.size === files.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-white/20"
                  />
                </th>
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
              {files.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-500 dark:text-white/50"
                  >
                    {t('table.noData')}
                  </td>
                </tr>
              ) : (
                files.map(item => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(item.id)}
                        onChange={() => toggleSelectFile(item.id)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-white/20"
                      />
                    </td>
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
                      {formatDate(item.uploaded_at, locale)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                      {formatDate(item.last_printed_at, locale)}
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
                        <Tooltip content={t('view')}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900/20 dark:hover:text-slate-200"
                            onClick={() => handleViewFile(item)}
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
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Button>
                        </Tooltip>
                        <Tooltip content={t('download')}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                            onClick={() => handleDownloadFile(item)}
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
                              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination && pagination.totalItems > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
          <div className="text-sm text-slate-600 dark:text-white/60">
            {t('table.showing', {
              from: page * PAGE_SIZE + 1,
              to: Math.min((page + 1) * PAGE_SIZE, pagination.totalItems),
              total: pagination.totalItems,
            })}
          </div>
          <Pagination
            page={page + 1} // Convert to 1-indexed for Pagination component
            pageSize={PAGE_SIZE}
            total={pagination.totalItems}
            onChange={newPage => setPage(newPage - 1)} // Convert back to 0-indexed
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

      {/* Upload Multiple Files Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={handleCloseUploadModal}
        title={t('uploadMultiple')}
        size="lg"
      >
        <div className="px-6 py-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept={permittedFileTypesData?.data?.data
              ?.map(
                (t: { mimeType?: string; mime_type?: string }) =>
                  t.mimeType || t.mime_type
              )
              .join(',')}
            onChange={handleInputChange}
            disabled={uploadingFiles.size > 0}
          />

          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={cn(
              'group relative mb-6 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300',
              isDragging
                ? 'scale-[1.02] border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-500/20 dark:from-blue-500/20 dark:to-blue-500/10'
                : 'border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:border-blue-400 hover:from-blue-50/50 hover:to-blue-100/30 hover:shadow-md dark:border-white/20 dark:from-white/5 dark:to-white/10 dark:hover:border-blue-400 dark:hover:from-blue-500/10 dark:hover:to-blue-500/5'
            )}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 p-5 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl dark:from-blue-500/30 dark:to-blue-600/30">
                <svg
                  className={cn(
                    'h-10 w-10 text-blue-600 transition-transform duration-300 dark:text-blue-400',
                    isDragging && 'animate-bounce'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3 3v12"
                  />
                </svg>
              </div>
              <p className="mb-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {t('dragDropUpload')}
              </p>
              <p className="text-sm text-slate-500 dark:text-white/60">
                {supportedFileTypesList
                  ? t('fileSizeLimitWithTypes', {
                      types: supportedFileTypesList,
                    })
                  : t('fileSizeLimit')}
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFilesToUpload.length > 0 && (
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-700 dark:text-white/90">
                  {t('selectedFilesList', {
                    count: selectedFilesToUpload.length,
                  })}
                </div>
                {uploadingFiles.size === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFilesToUpload([])}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    {t('removeAll')}
                  </Button>
                )}
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {selectedFilesToUpload.map((file, index) => {
                  const fileId = `${file.name}-${file.size}`;
                  const isUploading = uploadingFiles.has(fileId);
                  const progress = uploadProgress[fileId] || 0;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <FileIcon fileName={file.name} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {file.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-white/60">
                            {formatFileSize(file.size)}
                          </div>
                          {isUploading && (
                            <div className="mt-1">
                              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
                                <div
                                  className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFileFromUpload(index)}
                          className="ml-2 h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCloseUploadModal}
              disabled={uploadingFiles.size > 0}
              className="rounded-lg border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="default"
              onClick={handleUploadFiles}
              disabled={
                selectedFilesToUpload.length === 0 || uploadingFiles.size > 0
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingFiles.size > 0 ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('uploading')}
                </>
              ) : (
                t('uploadFiles', { count: selectedFilesToUpload.length })
              )}
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
