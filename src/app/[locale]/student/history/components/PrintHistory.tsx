'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  historyStatusFilters,
  printHistoryMock,
  printHistorySummaryMock,
  PrintHistoryItem,
  PrintJobStatus,
} from '@/data/printHistoryMock';
import { cn } from '@/lib/utils/cn';
import { FileIcon } from '../../print/components/FileIcon';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { PrinterLocationModal } from '../../printers/components/PrinterLocationModal';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';

type StatusFilterValue = (typeof historyStatusFilters)[number]['value'];
type SortColumn =
  | 'document'
  | 'printer'
  | 'mode'
  | 'pages'
  | 'time'
  | 'status'
  | null;
type SortDirection = 'asc' | 'desc' | null;

function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPrinterStatusMeta(status?: PrintHistoryItem['printerStatus']) {
  if (status === 'online') {
    return {
      label: 'Đang hoạt động',
      badge:
        'bg-emerald-100 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    };
  }
  if (status === 'maintenance') {
    return {
      label: 'Bảo trì',
      badge:
        'bg-amber-100 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
      dot: 'bg-amber-500',
    };
  }
  if (status === 'offline') {
    return {
      label: 'Ngoại tuyến',
      badge:
        'bg-rose-100 text-rose-700 ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
      dot: 'bg-rose-500',
    };
  }
  return {
    label: 'Chưa rõ',
    badge:
      'bg-slate-100 text-slate-700 ring-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200',
    dot: 'bg-slate-400',
  };
}

function StatusBadge({ status }: { status: PrintJobStatus }) {
  const styles: Record<PrintJobStatus, string> = {
    completed:
      'bg-green-100 text-green-700 ring-green-500/30 dark:bg-green-500/10 dark:text-green-300',
    processing:
      'bg-amber-100 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    queued:
      'bg-slate-100 text-slate-700 ring-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200',
    failed:
      'bg-rose-100 text-rose-700 ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  };

  const label: Record<PrintJobStatus, string> = {
    completed: 'Hoàn tất',
    processing: 'Đang xử lý',
    queued: 'Đang chờ',
    failed: 'Lỗi',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        styles[status]
      )}
    >
      {label[status]}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  caption,
  trend,
}: {
  title: string;
  value: string;
  caption?: string;
  trend?: { label: string; positive?: boolean };
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="text-sm font-semibold text-slate-500 dark:text-white/60">
        {title}
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      {caption && (
        <div className="mt-1 text-sm text-slate-500 dark:text-white/60">
          {caption}
        </div>
      )}
      {trend && title !== 'Tỷ lệ thành công' && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
            trend.positive
              ? 'bg-green-500/10 text-green-600 dark:text-green-300'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
          )}
        >
          {trend.positive ? (
            <svg
              className="h-4 w-4 text-green-600 dark:text-green-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 14l5-5 4 4 5-7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 6h4v4"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-amber-600 dark:text-amber-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 10l5 5 4-4 5 7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18h4v-4"
              />
            </svg>
          )}
          {trend.label}
        </div>
      )}
      {trend && title === 'Tỷ lệ thành công' && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/15 dark:text-green-300">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M12 21c4.97 0 9-3.582 9-8s-4.03-8-9-8-9 3.582-9 8 4.03 8 9 8z"
            />
          </svg>
          Ổn định
        </div>
      )}
    </div>
  );
}

const tagExcludes = ['1 mặt', '2 mặt', 'Màu', 'In màu', 'In xám', 'Đen trắng'];
const PAGE_SIZE = 10;

function HistoryRow({
  item,
  onClick,
}: {
  item: PrintHistoryItem;
  onClick: () => void;
}) {
  const readableTags =
    item.tags?.filter(tag => !tagExcludes.includes(tag)).join(', ') ?? '';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group grid w-full grid-cols-12 items-center gap-4 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 text-left transition hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5"
    >
      <div className="col-span-3">
        <div className="flex items-center gap-3">
          <FileIcon fileName={item.documentName} size={40} />
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {item.documentName}
            </div>
            <div className="text-xs text-slate-500 dark:text-white/60">
              {item.copies} bản • {item.fileSizeKB} KB
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-2">
        <div className="font-semibold text-slate-800 dark:text-white">
          {item.printerName}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          {item.location}
        </div>
      </div>

      <div className="col-span-2">
        <div className="text-sm text-slate-800 dark:text-white">
          {item.colorMode === 'color'
            ? 'In màu'
            : item.colorMode === 'grayscale'
              ? 'In xám'
              : 'Đen trắng'}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          {item.duplex ? '2 mặt' : '1 mặt'}
        </div>
        {readableTags && (
          <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
            {readableTags}
          </div>
        )}
      </div>

      <div className="col-span-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          {item.pageCount} trang
        </div>
      </div>

      <div className="col-span-2">
        <div className="text-sm text-slate-800 dark:text-white">
          {formatDate(item.submittedAt)}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          Kết thúc: {formatDate(item.completedAt)}
        </div>
      </div>

      <div className="col-span-2 flex flex-col items-center justify-center gap-2 text-center">
        <StatusBadge status={item.status} />
      </div>
    </button>
  );
}

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
  const [selected, setSelected] = useState<PrintHistoryItem | null>(null);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const filtered = useMemo(() => {
    return printHistoryMock.filter(item => {
      const matchesStatus = status === 'all' || item.status === status;

      const submitted = new Date(item.submittedAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const endInclusive = end ? new Date(end) : null;
      if (endInclusive) endInclusive.setHours(23, 59, 59, 999);
      const matchesTime =
        (!start || submitted >= start) &&
        (!endInclusive || submitted <= endInclusive);

      const matchesColor = colorMode === 'all' || item.colorMode === colorMode;
      const matchesDuplex =
        duplex === 'all' ||
        (duplex === 'double-sided' && item.duplex) ||
        (duplex === 'one-sided' && !item.duplex);
      const matchesFile =
        fileType === 'all' ||
        item.fileType.toLowerCase() === fileType ||
        item.documentName.toLowerCase().endsWith(`.${fileType}`);

      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        item.documentName.toLowerCase().includes(term) ||
        item.printerName.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term);

      return (
        matchesStatus &&
        matchesTime &&
        matchesColor &&
        matchesDuplex &&
        matchesFile &&
        matchesSearch
      );
    });
  }, [status, startDate, endDate, colorMode, duplex, fileType, search]);

  useEffect(() => {
    setPage(1);
  }, [
    filtered.length,
    status,
    startDate,
    endDate,
    colorMode,
    duplex,
    fileType,
    search,
    sortColumn,
    sortDirection,
  ]);

  const sorted = useMemo(() => {
    if (!sortColumn || !sortDirection) return filtered;
    const data = [...filtered];
    data.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      switch (sortColumn) {
        case 'document':
          return direction * a.documentName.localeCompare(b.documentName);
        case 'printer':
          return direction * a.printerName.localeCompare(b.printerName);
        case 'mode':
          return direction * a.colorMode.localeCompare(b.colorMode);
        case 'pages':
          return direction * (a.pageCount - b.pageCount);
        case 'time':
          return (
            direction *
            (new Date(a.submittedAt).getTime() -
              new Date(b.submittedAt).getTime())
          );
        case 'status':
          return direction * a.status.localeCompare(b.status);
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
          className="h-4 w-4 text-slate-400"
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
        className="h-4 w-4 text-blue-500"
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
        className="h-4 w-4 text-blue-500"
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Công việc tháng này"
          value={`${printHistorySummaryMock.totalJobsThisMonth} việc`}
          caption="Bao gồm cả in màu và đen trắng"
          trend={{ label: 'Tăng 8% so với tháng trước', positive: true }}
        />
        <SummaryCard
          title="Số trang đã in"
          value={`${printHistorySummaryMock.totalPagesThisMonth} trang`}
          caption="Tính trong phạm vi 30 ngày gần nhất"
        />
        <SummaryCard
          title="Tỷ lệ thành công"
          value={`${Math.round(printHistorySummaryMock.successRate * 100)}%`}
          caption="Bao gồm hoàn tất và đang chờ"
          trend={{
            label:
              printHistorySummaryMock.successRate >= 0.95
                ? 'Ổn định'
                : 'Cần cải thiện kết nối',
            positive: printHistorySummaryMock.successRate >= 0.95,
          }}
        />
      </div>

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

        {showFilters && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Select
              value={status}
              onChange={e => setStatus(e.target.value as StatusFilterValue)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {historyStatusFilters.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Ngày bắt đầu"
              className="w-full"
            />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Ngày kết thúc"
              className="w-full"
              min={startDate || undefined}
            />
            <Select
              value={colorMode}
              onChange={e => setColorMode(e.target.value as typeof colorMode)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Tất cả chế độ màu</option>
              <option value="color">In màu</option>
              <option value="grayscale">In xám</option>
              <option value="black-white">Đen trắng</option>
            </Select>
            <Select
              value={duplex}
              onChange={e => setDuplex(e.target.value as typeof duplex)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Tất cả chế độ mặt</option>
              <option value="double-sided">In 2 mặt</option>
              <option value="one-sided">In 1 mặt</option>
            </Select>
            <Select
              value={fileType}
              onChange={e => setFileType(e.target.value as typeof fileType)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Tất cả định dạng</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="pptx">PPTX</option>
              <option value="xlsx">XLSX</option>
              <option value="jpg">Ảnh (JPG/PNG)</option>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="hidden grid-cols-12 items-center gap-4 px-1 py-2 text-base font-semibold text-slate-800 dark:text-white md:grid">
            <button
              type="button"
              onClick={() => toggleSort('document')}
              className="col-span-3 flex items-center gap-2"
            >
              <span>Tài liệu</span>
              {sortIcon('document')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('printer')}
              className="col-span-2 flex items-center gap-2"
            >
              <span>Máy in</span>
              {sortIcon('printer')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('mode')}
              className="col-span-2 flex items-center gap-2"
            >
              <span>Chế độ</span>
              {sortIcon('mode')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('pages')}
              className="col-span-1 flex items-center gap-2"
            >
              <span>Trang</span>
              {sortIcon('pages')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('time')}
              className="col-span-2 flex items-center gap-2"
            >
              <span>Thời gian</span>
              {sortIcon('time')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('status')}
              className="col-span-2 flex items-center justify-center gap-2 text-center"
            >
              <span>Trạng thái</span>
              {sortIcon('status')}
            </button>
          </div>

          {paginated.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200/70 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              Không có dữ liệu phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            paginated.map(item => (
              <HistoryRow
                key={item.id}
                item={item}
                onClick={() => setSelected(item)}
              />
            ))
          )}

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
          />
        </div>
      </div>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Chi tiết lịch sử in"
        size="lg"
      >
        {selected && (
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex items-center gap-4">
                <FileIcon fileName={selected.documentName} size={56} />
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selected.documentName}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-white/60">
                    ID: {selected.id} • {selected.fileType} •{' '}
                    {selected.fileSizeKB} KB
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    if (selected.previewUrl) {
                      window.open(
                        selected.previewUrl,
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }
                  }}
                  disabled={!selected.previewUrl}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99]"
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
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Xem file in
                </Button>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 pt-6 dark:border-white/10 dark:bg-white/5">
                {(() => {
                  const meta = getPrinterStatusMeta(selected.printerStatus);
                  return (
                    <div
                      className={cn(
                        'absolute right-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                        meta.badge
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
                      {meta.label}
                    </div>
                  );
                })()}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                        Máy in
                      </div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">
                        {selected.printerName}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-white/60">
                        Serial: {selected.printerSerial || '—'}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-white/70">
                        <svg
                          className="h-4 w-4 text-slate-500 dark:text-white/60"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 21h16M4 10h16M9 21V6m6 15V6m3 4.5V4H6v6.5"
                          />
                        </svg>
                        <span>
                          {selected.buildingName || '—'}{' '}
                          {selected.roomCode ? `- ${selected.roomCode}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setShowLocation(true)}
                    className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99]"
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
                        strokeWidth={1.5}
                        d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z"
                      />
                      <circle cx="12" cy="11" r="2.5" />
                    </svg>
                    Xem vị trí
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Cấu hình in
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Khổ giấy
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.paperSize || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Hướng giấy
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.orientation === 'landscape' ? 'Ngang' : 'Dọc'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Chế độ màu
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.colorMode === 'color'
                        ? 'In màu'
                        : selected.colorMode === 'grayscale'
                          ? 'In xám'
                          : 'Đen trắng'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Mặt in
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.duplex ? '2 mặt' : '1 mặt'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Số bản
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.copies}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Tổng trang
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.pageCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Thời gian
                </div>
                <div className="mt-2 space-y-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <div>Gửi: {formatDate(selected.submittedAt)}</div>
                  <div>
                    {selected.status === 'processing'
                      ? 'Hoàn tất dự kiến:'
                      : 'Hoàn tất:'}{' '}
                    {formatDate(selected.completedAt)}
                  </div>
                </div>
              </div>
            </div>

            {selected.status === 'processing' && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                <div className="flex items-center justify-between text-sm font-semibold text-blue-800 dark:text-blue-200">
                  <span>Đang in</span>
                  <span>65%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                </div>
                <div className="mt-2 text-xs text-blue-700 dark:text-blue-200">
                  Ước tính hoàn tất trong 2 phút...
                </div>
              </div>
            )}

            {selected.errorMessage && (
              <div className="rounded-xl border border-rose-200/60 bg-rose-50/70 p-4 text-sm text-rose-700 ring-1 ring-rose-200 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                {selected.errorMessage}
              </div>
            )}

            <PrinterLocationModal
              isOpen={showLocation}
              onClose={() => setShowLocation(false)}
              printer={
                selected
                  ? {
                      printer_id:
                        selected.printerSerial || selected.printerName,
                      serial_number: selected.printerSerial || 'N/A',
                      brand_name: selected.printerName,
                      model_name: selected.printerName,
                      room_code: selected.roomCode || 'N/A',
                      building_name: selected.buildingName || 'N/A',
                      is_enabled: true,
                      supports_color: selected.supportsColor ?? true,
                      supports_duplex: selected.supportsDuplex ?? true,
                      max_paper_size: selected.paperSize || 'A4',
                      status: selected.printerStatus || 'online',
                      installed_date: '',
                      last_maintenance_date: '',
                    }
                  : null
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
}



