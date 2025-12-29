'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usePrinters } from '@/lib/api/services/printers';
import type { PrintHistoryFilters } from '../types';

interface PrintHistoryFiltersProps {
  filters: PrintHistoryFilters;
  onFiltersChange: (filters: PrintHistoryFilters) => void;
}

const FILE_TYPES = [
  'pdf',
  'docx',
  'xlsx',
  'pptx',
  'txt',
  'jpg',
  'png',
  'csv',
] as const;

export function PrintHistoryFiltersComponent({
  filters,
  onFiltersChange,
}: PrintHistoryFiltersProps) {
  const t = useTranslations('staff.managePrintHistory');

  // Fetch all printers for the select dropdown
  const { data: printersResponse } = usePrinters({
    limit: 1000, // Get all printers
  });

  const printers = useMemo(() => {
    return printersResponse?.data?.data || [];
  }, [printersResponse]);

  const handleFilterChange = (
    key: keyof PrintHistoryFilters,
    value: string | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' || value === '' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: filters.page,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.studentId ||
      filters.printerId ||
      filters.from ||
      filters.to ||
      filters.status ||
      filters.fileType ||
      filters.paymentMethod
    );
  }, [filters]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <DatePicker
        value={filters.from || ''}
        onChange={value => handleFilterChange('from', value)}
        placeholder={t('filters.dateFrom')}
        className="w-full"
      />
      <DatePicker
        value={filters.to || ''}
        onChange={value => handleFilterChange('to', value)}
        placeholder={t('filters.dateTo')}
        className="w-full"
        min={filters.from || undefined}
      />
      <Select
        value={filters.status || 'all'}
        onChange={e => handleFilterChange('status', e.target.value)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('filters.allStatuses')}</option>
        <option value="queued">{t('status.queued')}</option>
        <option value="printing">{t('status.printing')}</option>
        <option value="completed">{t('status.completed')}</option>
        <option value="failed">{t('status.failed')}</option>
        <option value="cancelled">{t('status.cancelled')}</option>
        <option value="pending_payment">{t('status.pending_payment')}</option>
      </Select>
      <Select
        value={filters.fileType || 'all'}
        onChange={e => handleFilterChange('fileType', e.target.value)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('filters.allFileTypes')}</option>
        {FILE_TYPES.map(type => (
          <option key={type} value={type}>
            {type.toUpperCase()}
          </option>
        ))}
      </Select>
      <Select
        value={filters.paymentMethod || 'all'}
        onChange={e => handleFilterChange('paymentMethod', e.target.value)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('filters.allPaymentMethods')}</option>
        <option value="balance">{t('paymentMethod.balance')}</option>
        <option value="qr">{t('paymentMethod.qr')}</option>
      </Select>
      <Select
        value={filters.printerId || 'all'}
        onChange={e => handleFilterChange('printerId', e.target.value)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('filters.allPrinters')}</option>
        {printers.map(printer => (
          <option key={printer.printerId} value={printer.printerId}>
            {printer.serialNumber} - {printer.modelName || ''}
          </option>
        ))}
      </Select>
      <div className="flex items-center gap-2">
        <Input
          value={filters.studentId || ''}
          onChange={e => handleFilterChange('studentId', e.target.value)}
          placeholder={t('filters.student')}
          className="flex-1 rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {t('filters.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  );
}
