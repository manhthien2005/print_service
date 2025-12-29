'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { useTranslations } from 'next-intl';
import { GenerateReportModal } from './GenerateReportModal';
import { ReportsList } from './ReportsList';
import { ReportDetailModal } from './ReportDetailModal';

type ViewMode = 'generate' | 'reports';

interface ReportManagementProps {
  defaultView?: ViewMode;
}

export function ReportManagement({
  defaultView = 'generate',
}: ReportManagementProps) {
  const t = useTranslations('staff.reports');
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateModalType, setGenerateModalType] = useState<
    'MONTHLY' | 'YEARLY'
  >('MONTHLY');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>('');

  const handleGenerateClick = (type: 'MONTHLY' | 'YEARLY') => {
    setGenerateModalType(type);
    setGenerateModalOpen(true);
  };

  const handleViewDetail = (reportId: string) => {
    setSelectedReportId(reportId);
    setDetailModalOpen(true);
  };

  const handleGenerateSuccess = () => {
    // Switch to reports view after generating
    setViewMode('reports');
  };

  const tabs = [
    { value: 'generate', label: t('management.tabs.generate') },
    { value: 'reports', label: t('management.tabs.reports') },
  ];

  return (
    <>
      <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('management.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            items={tabs}
            value={viewMode}
            onChange={value => setViewMode(value as ViewMode)}
            className="mb-6"
          />

          {viewMode === 'generate' && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-white/70">
                  {t('management.generate.title')}
                </h3>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleGenerateClick('MONTHLY')}
                    variant="outline"
                  >
                    {t('management.generate.monthly')}
                  </Button>
                  <Button
                    onClick={() => handleGenerateClick('YEARLY')}
                    variant="outline"
                  >
                    {t('management.generate.yearly')}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-white/60">
                  {t('management.generate.description')}
                </p>
              </div>
            </div>
          )}

          {viewMode === 'reports' && (
            <ReportsList onViewDetail={handleViewDetail} />
          )}
        </CardContent>
      </Card>

      <GenerateReportModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        type={generateModalType}
        onSuccess={handleGenerateSuccess}
      />

      <ReportDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        reportId={selectedReportId}
      />
    </>
  );
}
