'use client';

import type {
  PrintHistoryItem,
  StatusFilterValue,
} from '@/app/[locale]/student/history/types';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('student.history.filters');

  if (!showFilters) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <Select
        value={status}
        onChange={e => onStatusChange(e.target.value as StatusFilterValue)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('status.all')}</option>
        <option value="completed">{t('status.completed')}</option>
        <option value="processing">{t('status.processing')}</option>
        <option value="queued">{t('status.queued')}</option>
        <option value="failed">{t('status.failed')}</option>
      </Select>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder={t('dateFrom')}
        className="w-full"
      />
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder={t('dateTo')}
        className="w-full"
        min={startDate || undefined}
      />
      <Select
        value={colorMode}
        onChange={e => onColorModeChange(e.target.value as typeof colorMode)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('colorMode.all')}</option>
        <option value="color">{t('colorMode.color')}</option>
        <option value="grayscale">{t('colorMode.grayscale')}</option>
        <option value="black-white">{t('colorMode.blackWhite')}</option>
      </Select>
      <Select
        value={duplex}
        onChange={e => onDuplexChange(e.target.value as typeof duplex)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('duplex.all')}</option>
        <option value="double-sided">{t('duplex.doubleSided')}</option>
        <option value="one-sided">{t('duplex.oneSided')}</option>
      </Select>
      <Select
        value={fileType}
        onChange={e => onFileTypeChange(e.target.value as typeof fileType)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('fileType.all')}</option>
        <option value="pdf">{t('fileType.pdf')}</option>
        <option value="docx">{t('fileType.docx')}</option>
        <option value="pptx">{t('fileType.pptx')}</option>
        <option value="xlsx">{t('fileType.xlsx')}</option>
        <option value="jpg">{t('fileType.jpg')}</option>
      </Select>
    </div>
  );
}
