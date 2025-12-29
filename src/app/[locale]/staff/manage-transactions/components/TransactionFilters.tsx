'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { TransactionFilters } from '../types';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
}: TransactionFiltersProps) {
  const t = useTranslations('staff.manageTransactions.filters');

  const handleFilterChange = (
    key: keyof TransactionFilters,
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
      filters.from ||
      filters.to ||
      filters.direction ||
      filters.sourceType
    );
  }, [filters]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Input
        value={filters.studentId || ''}
        onChange={e => handleFilterChange('studentId', e.target.value)}
        placeholder={t('student')}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
      <DatePicker
        value={filters.from || ''}
        onChange={value => handleFilterChange('from', value)}
        placeholder={t('dateFrom')}
        className="w-full"
      />
      <DatePicker
        value={filters.to || ''}
        onChange={value => handleFilterChange('to', value)}
        placeholder={t('dateTo')}
        className="w-full"
        min={filters.from || undefined}
      />
      <Select
        value={filters.direction || 'all'}
        onChange={e => handleFilterChange('direction', e.target.value)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('allDirections')}</option>
        <option value="IN">{t('directionIn')}</option>
        <option value="OUT">{t('directionOut')}</option>
      </Select>
      <Select
        value={filters.sourceType || 'all'}
        onChange={e => handleFilterChange('sourceType', e.target.value)}
        className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="all">{t('allSourceTypes')}</option>
        <option value="DEPOSIT">{t('sourceTypeDeposit')}</option>
        <option value="SEMESTER_BONUS">{t('sourceTypeSemesterBonus')}</option>
        <option value="PAYMENT">{t('sourceTypePayment')}</option>
        <option value="REFUND">{t('sourceTypeRefund')}</option>
      </Select>
      {hasActiveFilters && (
        <div className="flex items-center">
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
            {t('clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}
