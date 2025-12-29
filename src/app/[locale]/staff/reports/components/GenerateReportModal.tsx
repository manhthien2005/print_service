'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { useTranslations } from 'next-intl';
import {
  useGenerateMonthlyReport,
  useGenerateYearlyReport,
} from '@/lib/api/services/staffReports';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'MONTHLY' | 'YEARLY';
  onSuccess?: () => void;
}

export function GenerateReportModal({
  isOpen,
  onClose,
  type,
  onSuccess,
}: GenerateReportModalProps) {
  const t = useTranslations('staff.reports');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const generateMonthly = useGenerateMonthlyReport();
  const generateYearly = useGenerateYearlyReport();

  const isLoading = generateMonthly.isPending || generateYearly.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (type === 'MONTHLY') {
        await generateMonthly.mutateAsync({ year, month });
        toast.success(t('generateModal.success.monthly', { month, year }));
      } else {
        await generateYearly.mutateAsync({ year });
        toast.success(t('generateModal.success.yearly', { year }));
      }
      onSuccess?.();
      onClose();
      // Reset form
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth() + 1);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('generateModal.error');
      toast.error(errorMessage);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: t('generateModal.months.1') },
    { value: 2, label: t('generateModal.months.2') },
    { value: 3, label: t('generateModal.months.3') },
    { value: 4, label: t('generateModal.months.4') },
    { value: 5, label: t('generateModal.months.5') },
    { value: 6, label: t('generateModal.months.6') },
    { value: 7, label: t('generateModal.months.7') },
    { value: 8, label: t('generateModal.months.8') },
    { value: 9, label: t('generateModal.months.9') },
    { value: 10, label: t('generateModal.months.10') },
    { value: 11, label: t('generateModal.months.11') },
    { value: 12, label: t('generateModal.months.12') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        type === 'MONTHLY'
          ? t('generateModal.monthly.title')
          : t('generateModal.yearly.title')
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="year"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/70"
            >
              {t('generateModal.year')}
            </label>
            <Select
              id="year"
              value={year.toString()}
              onChange={e => setYear(parseInt(e.target.value))}
              className="w-full"
              required
            >
              {years.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>

          {type === 'MONTHLY' && (
            <div>
              <label
                htmlFor="month"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/70"
              >
                {t('generateModal.month')}
              </label>
              <Select
                id="month"
                value={month.toString()}
                onChange={e => setMonth(parseInt(e.target.value))}
                className="w-full"
                required
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('generateModal.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t('generateModal.submitting')
                : t('generateModal.submit')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
