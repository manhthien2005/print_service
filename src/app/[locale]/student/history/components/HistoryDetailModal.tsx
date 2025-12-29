'use client';

import { useState } from 'react';
import type { PrintHistoryItem } from '@/app/[locale]/student/history/types';
import { FileIcon } from '@/app/[locale]/student/print/components/FileIcon';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PrinterLocationModal } from '@/app/[locale]/student/printers/components/PrinterLocationModal';
import {
  formatDate,
  getPrinterStatusMeta,
} from '@/app/[locale]/student/history/utils';
import { StatusBadge } from './StatusBadge';
import { DetailModalSkeleton } from './DetailModalSkeleton';
import { cn } from '@/lib/utils/cn';
import { usePrintJobProgressData } from '../../print/hooks/usePrintJobProgressData';
import { formatCurrency } from '@/lib/utils/format';
import { useTranslations, useLocale } from 'next-intl';

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PrintHistoryItem | null;
  isLoading: boolean;
}

export function HistoryDetailModal({
  isOpen,
  onClose,
  item,
  isLoading,
}: HistoryDetailModalProps) {
  const t = useTranslations('student.history.detailModal');
  const tPrinterStatus = useTranslations('student.history.printerStatus');
  const locale = useLocale();
  const [showLocation, setShowLocation] = useState(false);

  const showProgress =
    isOpen &&
    item !== null &&
    (item.status === 'processing' || item.status === 'queued');

  const {
    progress,
    isLoading: progressLoading,
    error: progressError,
  } = usePrintJobProgressData(showProgress ? item!.id : null, showProgress);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="lg">
        {isLoading ? (
          <DetailModalSkeleton />
        ) : item ? (
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex items-center gap-4">
                <FileIcon fileName={item.documentName} size={56} />
                <div>
                  <div className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {item.documentName}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-white/60">
                    {item.fileType} • {item.fileSizeKB} KB
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    if (item.previewUrl) {
                      window.open(
                        item.previewUrl,
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }
                  }}
                  disabled={!item.previewUrl}
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
                  {t('viewFile')}
                </Button>
                <StatusBadge status={item.status} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 pt-6 dark:border-white/10 dark:bg-white/5">
                {(() => {
                  const meta = getPrinterStatusMeta(
                    item.printerStatus,
                    (key: string) => {
                      const statusKey = key.split('.').pop() || '';
                      return tPrinterStatus(statusKey as any);
                    }
                  );
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
                        {t('sections.printer.title')}
                      </div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">
                        {item.printerName}
                      </div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-white/60">
                        {t('sections.printer.location', {
                          location: `${item.buildingName || '—'}${item.roomCode ? ` - ${item.roomCode}` : ''}`,
                        })}
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
                    {t('viewLocation')}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  {t('sections.printConfig.title')}
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('sections.printConfig.paperSize')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.paperSize || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('sections.printConfig.orientation')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.orientation === 'landscape'
                        ? t('sections.printConfig.orientationLandscape')
                        : t('sections.printConfig.orientationPortrait')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('sections.printConfig.colorMode')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.colorMode === 'color'
                        ? t('sections.printConfig.colorModeColor')
                        : item.colorMode === 'grayscale'
                          ? t('sections.printConfig.colorModeGrayscale')
                          : t('sections.printConfig.colorModeBlackWhite')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('sections.printConfig.printSide')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.duplex
                        ? t('sections.printConfig.printSideDouble')
                        : t('sections.printConfig.printSideOne')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('sections.printConfig.copies')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.copies}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('sections.printConfig.totalPages')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.pageCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  {t('sections.time.title')}
                </div>
                <div className="mt-2 space-y-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <div>
                    {t('sections.time.submitted', {
                      date: formatDate(item.submittedAt),
                    })}
                  </div>
                  <div>
                    {item.status === 'processing' &&
                    progress?.timing?.estimatedCompletionTime
                      ? t('sections.time.estimatedCompletion', {
                          date: formatDate(
                            progress.timing.estimatedCompletionTime
                          ),
                        })
                      : t('sections.time.completed', {
                          date: formatDate(item.completedAt),
                        })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  {t('sections.cost.title')}
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  {(() => {
                    const discountAmount =
                      item.discountAmount ??
                      (item.subtotalBeforeDiscount != null
                        ? Math.max(
                            item.subtotalBeforeDiscount - item.costVnd,
                            0
                          )
                        : 0);
                    const hasDiscount = (discountAmount ?? 0) > 0;

                    return (
                      <>
                        {item.subtotalBeforeDiscount != null && (
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-white/70">
                              {t('sections.cost.subtotal')}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(item.subtotalBeforeDiscount)}
                            </span>
                          </div>
                        )}
                        {hasDiscount && (
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-white/70">
                              {t('sections.cost.discount')}
                              {item.discountPercent != null
                                ? ` (${item.discountPercent * 100}%)`
                                : ''}
                            </span>
                            <span className="font-semibold text-rose-600 dark:text-rose-200">
                              -{formatCurrency(discountAmount)}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('sections.cost.payment')}
                    </span>
                    <span className="text-base font-semibold text-blue-600 dark:text-blue-200">
                      {formatCurrency(item.costVnd || 0)}
                    </span>
                  </div>
                  {item.paymentMethod && (
                    <div className="flex justify-between text-xs text-slate-500 dark:text-white/60">
                      <span>{t('sections.cost.paymentMethod')}</span>
                      <span className="font-semibold text-slate-700 dark:text-white">
                        {item.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showProgress && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                {progressLoading && !progress ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm font-semibold text-blue-800 dark:text-blue-200">
                      <span>{t('progress.loading')}</span>
                    </div>
                    <div className="mt-1 h-2 w-full animate-pulse rounded-full bg-blue-100 dark:bg-blue-900/40" />
                  </div>
                ) : progressError || !progress ? (
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    {t('progress.error')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold text-blue-800 dark:text-blue-200">
                      <span>{t('progress.title')}</span>
                      <span>
                        {t('progress.progress', {
                          printed: progress.progress.printedPages,
                          total: progress.progress.totalPages,
                          percent: progress.progress.percentage.toFixed(1),
                        })}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-blue-100 dark:bg-blue-900/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${progress.progress.percentage}%` }}
                      />
                    </div>
                    {progress.queueInfo.positionInQueue > 0 && (
                      <div className="text-xs text-blue-700 dark:text-blue-200">
                        {t('progress.queuePosition', {
                          position: progress.queueInfo.positionInQueue + 1,
                        })}
                        {progress.queueInfo.jobsAhead > 0 &&
                          ` ${t('progress.jobsAhead', { count: progress.queueInfo.jobsAhead })}`}
                      </div>
                    )}
                    {progress.timing.estimatedCompletionTime && (
                      <div className="text-xs text-blue-700 dark:text-blue-200">
                        {t('progress.estimatedCompletion', {
                          date: new Date(
                            progress.timing.estimatedCompletionTime
                          ).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US'),
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {item.errorMessage && (
              <div className="rounded-xl border border-rose-200/60 bg-rose-50/70 p-4 text-sm text-rose-700 ring-1 ring-rose-200 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                {item.errorMessage}
              </div>
            )}

            <PrinterLocationModal
              isOpen={showLocation}
              onClose={() => setShowLocation(false)}
              printer={
                item
                  ? {
                      printer_id: item.printerSerial || item.printerName,
                      serial_number: item.printerSerial || 'N/A',
                      brand_name: item.printerName,
                      model_name: item.printerName,
                      room_code: item.roomCode || 'N/A',
                      building_name: item.buildingName || 'N/A',
                      is_enabled: true,
                      supports_color: item.supportsColor ?? true,
                      supports_duplex: item.supportsDuplex ?? true,
                      max_paper_size: item.paperSize || 'A4',
                      status: item.printerStatus || 'online',
                      installed_date: '',
                      last_maintenance_date: '',
                    }
                  : null
              }
            />
          </div>
        ) : null}
      </Modal>
    </>
  );
}
