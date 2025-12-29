'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { AdminPrintHistoryItem } from '@/lib/api/services/adminPrintHistory';

interface PrintHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AdminPrintHistoryItem | null;
}

const statusBadgeClass: Record<AdminPrintHistoryItem['printStatus'], string> = {
  queued:
    'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/30',
  printing:
    'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-500/10 dark:text-purple-200 dark:ring-purple-500/30',
  completed:
    'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30',
  failed:
    'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30',
  cancelled:
    'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40',
  pending_payment:
    'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-200 dark:ring-yellow-500/30',
};

const paymentMethodBadgeClass: Record<
  AdminPrintHistoryItem['paymentMethod'],
  string
> = {
  balance:
    'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-500/30',
  qr: 'bg-teal-100 text-teal-700 ring-1 ring-inset ring-teal-200 dark:bg-teal-500/10 dark:text-teal-200 dark:ring-teal-500/30',
};

function StatusBadge({
  status,
  t,
}: {
  status: AdminPrintHistoryItem['printStatus'];
  t: any;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        statusBadgeClass[status]
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}

function PaymentMethodBadge({
  method,
  t,
}: {
  method: AdminPrintHistoryItem['paymentMethod'];
  t: any;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        paymentMethodBadgeClass[method]
      )}
    >
      {t(`paymentMethod.${method}`)}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function PrintHistoryDetailModal({
  isOpen,
  onClose,
  item,
}: PrintHistoryDetailModalProps) {
  const t = useTranslations('staff.managePrintHistory');

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal.detail.title')}
      size="lg"
    >
      <div className="space-y-6 p-6">
        {/* Job Information */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.jobInfo')}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.jobId')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.jobId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.createdAt')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatDate(item.createdAt)}
              </span>
            </div>
            {item.startTime && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  {t('modal.detail.startTime')}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(item.startTime)}
                </span>
              </div>
            )}
            {item.endTime && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  {t('modal.detail.endTime')}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(item.endTime)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.printStatus')}:
              </span>
              <StatusBadge status={item.printStatus} t={t} />
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.studentInfo')}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.studentCode')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.studentCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.studentName')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.studentName}
              </span>
            </div>
            <div className="flex justify-between md:col-span-2">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.studentEmail')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.studentEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Printer Information */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.printerInfo')}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.printerCode')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.printerCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.printerName')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.printerName}
              </span>
            </div>
            <div className="flex justify-between md:col-span-2">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.location')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.buildingName} - {item.floorName} - {item.roomName}
              </span>
            </div>
          </div>
        </div>

        {/* File Information */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.fileInfo')}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.fileName')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.fileName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.fileType')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.fileType.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Print Configuration */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.printConfig')}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.pageSize')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.pageSizeName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.colorMode')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.colorModeName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.orientation')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.pageOrientation}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.printSide')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.printSide}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.numberOfCopy')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.numberOfCopy}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                Trang đã in / Tổng trang:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.printedPages || item.totalPages} / {item.totalPages}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.pricing')}
          </div>
          <div className="grid gap-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.subtotal')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(item.subtotalBeforeDiscount)}
              </span>
            </div>
            {item.discountAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-white/70">
                    {t('modal.detail.discount')} (
                    {item.discountPercentage * 100}%):
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(item.discountAmount)}
                  </span>
                </div>
                {item.discountPackageName && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('modal.detail.discountPackage')}:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.discountPackageName}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3 dark:border-white/10">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('modal.detail.totalPrice')}:
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(item.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.payment')}
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-white/70">
              {t('modal.detail.paymentMethod')}:
            </span>
            <PaymentMethodBadge method={item.paymentMethod} t={t} />
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            {t('modal.detail.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
