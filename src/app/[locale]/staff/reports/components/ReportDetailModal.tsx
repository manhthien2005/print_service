'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { useReportDetail } from '@/lib/api/services/staffReports';
import { DailyJobTrendsChart } from './charts/DailyJobTrendsChart';
import { DailyPageAnalyticsChart } from './charts/DailyPageAnalyticsChart';
import { TopActivePrintersChart } from './charts/TopActivePrintersChart';
import { MonthlyRevenueTrendsChart } from './charts/MonthlyRevenueTrendsChart';

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

export function ReportDetailModal({
  isOpen,
  onClose,
  reportId,
}: ReportDetailModalProps) {
  const t = useTranslations('staff.reports');
  const { data, isLoading, error } = useReportDetail(reportId);

  const report = data?.data?.data;

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('detailModal.title')}
        size="xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500 dark:text-white/60">
              {t('detailModal.loading')}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (error || !report) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('detailModal.title')}
        size="xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-center py-12 text-rose-600 dark:text-rose-400">
            {t('detailModal.error')}
          </div>
        </div>
      </Modal>
    );
  }

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('detailModal.titleWithPeriod', {
        period: formatPeriod(report.reportPeriod, report.reportType),
      })}
      size="full"
    >
      <div className="space-y-6 p-6">
        {/* Report Info */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('detailModal.info.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  {t('detailModal.info.type')}:
                </span>{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {report.reportType === 'MONTHLY'
                    ? t('detailModal.type.monthly')
                    : t('detailModal.type.yearly')}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  {t('detailModal.info.period')}:
                </span>{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatPeriod(report.reportPeriod, report.reportType)}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  {t('detailModal.info.fromDate')}:
                </span>{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(report.periodStart).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  {t('detailModal.info.toDate')}:
                </span>{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(report.periodEnd).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  {t('detailModal.info.createdAt')}:
                </span>{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(report.generatedAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  {t('detailModal.info.createdBy')}:
                </span>{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {report.generatedBy}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        {report.dailyJobTrends && report.dailyJobTrends.length > 0 && (
          <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('charts.dailyJobTrends.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyJobTrendsChart data={report.dailyJobTrends} />
            </CardContent>
          </Card>
        )}

        {report.dailyPageAnalytics && report.dailyPageAnalytics.length > 0 && (
          <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('charts.dailyPageAnalytics.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyPageAnalyticsChart data={report.dailyPageAnalytics} />
            </CardContent>
          </Card>
        )}

        {report.topActivePrinters && report.topActivePrinters.length > 0 && (
          <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('charts.topActivePrinters.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopActivePrintersChart data={report.topActivePrinters} />
            </CardContent>
          </Card>
        )}

        {report.monthlyRevenueTrends &&
          report.monthlyRevenueTrends.length > 0 && (
            <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t('charts.monthlyRevenueTrends.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyRevenueTrendsChart data={report.monthlyRevenueTrends} />
              </CardContent>
            </Card>
          )}
      </div>
    </Modal>
  );
}
