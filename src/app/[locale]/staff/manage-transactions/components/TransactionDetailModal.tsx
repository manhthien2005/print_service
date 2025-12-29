'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils/cn';
import type { AdminTransactionHistoryItem } from '@/lib/api/services/adminTransactionHistory';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AdminTransactionHistoryItem | null;
}

const sourceTypeBadgeClass: Record<
  AdminTransactionHistoryItem['sourceType'],
  string
> = {
  DEPOSIT:
    'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30',
  SEMESTER_BONUS:
    'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/30',
  PAYMENT:
    'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40',
  REFUND:
    'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-500/10 dark:text-purple-200 dark:ring-purple-500/30',
};

const directionBadgeClass: Record<
  AdminTransactionHistoryItem['direction'],
  string
> = {
  IN: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-500/10 dark:text-green-200 dark:ring-green-500/30',
  OUT: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30',
};

function SourceTypeBadge({
  sourceType,
  t,
}: {
  sourceType: AdminTransactionHistoryItem['sourceType'];
  t: any;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        sourceTypeBadgeClass[sourceType]
      )}
    >
      {t(`sourceTypes.${sourceType}`)}
    </span>
  );
}

function DirectionBadge({
  direction,
  t,
}: {
  direction: AdminTransactionHistoryItem['direction'];
  t: any;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        directionBadgeClass[direction]
      )}
    >
      {t(`directions.${direction}`)}
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
    second: '2-digit',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  item,
}: TransactionDetailModalProps) {
  const t = useTranslations('staff.manageTransactions');

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal.detail.title')}
      size="lg"
    >
      <div className="space-y-6 p-6">
        {/* Transaction Information */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.transactionInfo')}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.ledgerId')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.ledgerId}
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
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.amount')}:
              </span>
              <span
                className={cn(
                  'font-semibold',
                  item.direction === 'IN'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {item.direction === 'IN' ? '+' : '-'}
                {formatCurrency(Math.abs(item.amount))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.direction')}:
              </span>
              <DirectionBadge direction={item.direction} t={t} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.sourceType')}:
              </span>
              <SourceTypeBadge sourceType={item.sourceType} t={t} />
            </div>
            <div className="flex justify-between md:col-span-2">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.description')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.description}
              </span>
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

        {/* Source Information */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
            {t('modal.detail.sourceInfo')}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.sourceId')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.sourceId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-white/70">
                {t('modal.detail.sourceTable')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.sourceTable}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Details based on sourceType */}
        {(item.sourceType === 'DEPOSIT' ||
          item.sourceType === 'PAYMENT' ||
          item.sourceType === 'REFUND') && (
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 text-xs uppercase text-slate-500 dark:text-white/50">
              {t('modal.detail.additionalInfo')}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {item.sourceType === 'DEPOSIT' && (
                <>
                  {item.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.paymentMethod')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {item.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.paymentReference')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.paymentReference}
                      </span>
                    </div>
                  )}
                  {item.depositCode && (
                    <div className="flex justify-between md:col-span-2">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.depositCode')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.depositCode}
                      </span>
                    </div>
                  )}
                </>
              )}
              {(item.sourceType === 'PAYMENT' ||
                item.sourceType === 'REFUND') && (
                <>
                  {item.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.paymentMethod')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {item.printJobId && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.printJobId')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.printJobId}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
