'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useReportsList } from '@/lib/api/services/staffReports';
import type { SystemReportResponse } from '@/types/api';

interface ReportsListProps {
  onViewDetail: (reportId: string) => void;
}

export function ReportsList({ onViewDetail }: ReportsListProps) {
  const t = useTranslations('staff.reports');
  const [reportType, setReportType] = useState<
    'MONTHLY' | 'YEARLY' | undefined
  >(undefined);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { data, isLoading, error } = useReportsList(reportType, page, pageSize);

  const reports = data?.data?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPeriod = (period: string, type: 'MONTHLY' | 'YEARLY') => {
    if (type === 'MONTHLY') {
      const [year, month] = period.split('-');
      return t('list.period.month', { month, year });
    }
    return t('list.period.year', { year: period });
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500 dark:text-white/60">
              {t('list.loading')}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12 text-rose-600 dark:text-rose-400">
            {t('list.error')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('list.title')}
          </CardTitle>
          <Select
            value={reportType || 'ALL'}
            onChange={e =>
              setReportType(
                e.target.value === 'ALL'
                  ? undefined
                  : (e.target.value as 'MONTHLY' | 'YEARLY')
              )
            }
            className="w-48"
          >
            <option value="ALL">{t('list.filter.all')}</option>
            <option value="MONTHLY">{t('list.filter.monthly')}</option>
            <option value="YEARLY">{t('list.filter.yearly')}</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-white/60">
            {t('list.empty')}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/10">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/70">
                      {t('list.columns.type')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/70">
                      {t('list.columns.period')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/70">
                      {t('list.columns.createdAt')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/70">
                      {t('list.columns.createdBy')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-white/70">
                      {t('list.columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report: SystemReportResponse) => (
                    <tr
                      key={report.reportId}
                      className="border-b border-slate-200/50 hover:bg-slate-50/50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {report.reportType === 'MONTHLY'
                          ? t('list.type.monthly')
                          : t('list.type.yearly')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {formatPeriod(report.reportPeriod, report.reportType)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                        {formatDate(report.generatedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                        {report.generatedBy}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetail(report.reportId)}
                        >
                          {t('list.viewDetail')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reports.length >= pageSize && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  {t('list.pagination.previous')}
                </Button>
                <span className="text-sm text-slate-600 dark:text-white/70">
                  {t('list.pagination.page', { page: page + 1 })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={reports.length < pageSize}
                >
                  {t('list.pagination.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
