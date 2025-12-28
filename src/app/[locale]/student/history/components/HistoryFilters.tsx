'use client';

import { historyStatusFilters } from '@/app/[locale]/student/history/constants';
import type {
  PrintHistoryItem,
  StatusFilterValue,
} from '@/app/[locale]/student/history/types';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';

interface HistoryFiltersProps {
  status: StatusFilterValue;
  onStatusChange: (value: StatusFilterValue) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  colorMode: 'all' | PrintHistoryItem['colorMode'];
  onColorModeChange: (value: 'all' | PrintHistoryItem['colorMode']) => void;
  duplex: 'all' | 'one-sided' | 'double-sided';
  onDuplexChange: (value: 'all' | 'one-sided' | 'double-sided') => void;
  fileType: 'all' | 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'jpg';
  onFileTypeChange: (
    value: 'all' | 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'jpg'
  ) => void;
  showFilters: boolean;
}

export function HistoryFilters({
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  colorMode,
  onColorModeChange,
  duplex,
  onDuplexChange,
  fileType,
  onFileTypeChange,
  showFilters,
}: HistoryFiltersProps) {
  if (!showFilters) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <Select
        value={status}
        onChange={e => onStatusChange(e.target.value as StatusFilterValue)}
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
        onChange={onStartDateChange}
        placeholder="Ngày bắt đầu"
        className="w-full"
      />
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder="Ngày kết thúc"
        className="w-full"
        min={startDate || undefined}
      />
      <Select
        value={colorMode}
        onChange={e => onColorModeChange(e.target.value as typeof colorMode)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">Tất cả chế độ màu</option>
        <option value="color">In màu</option>
        <option value="grayscale">In xám</option>
        <option value="black-white">Đen trắng</option>
      </Select>
      <Select
        value={duplex}
        onChange={e => onDuplexChange(e.target.value as typeof duplex)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">Tất cả chế độ mặt</option>
        <option value="double-sided">In 2 mặt</option>
        <option value="one-sided">In 1 mặt</option>
      </Select>
      <Select
        value={fileType}
        onChange={e => onFileTypeChange(e.target.value as typeof fileType)}
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
  );
}
