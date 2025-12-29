'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { PrintHistoryTableSkeleton } from './PrintHistorySkeleton';
import type { SortColumn, SortDirection } from '../types';
import type { AdminPrintHistoryItem } from '@/lib/api/services/adminPrintHistory';

interface PrintHistoryTableProps {
  items: AdminPrintHistoryItem[];
  isLoading?: boolean;
  onItemClick: (item: AdminPrintHistoryItem) => void;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: Exclude<SortColumn, null>) => void;
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

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: Exclude<SortColumn, null>;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}) {
  if (sortColumn !== column || !sortDirection)
    return (
      <svg
        className="ml-1 h-4 w-4 text-slate-400"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M7 7l3-3 3 3M7 13l3 3 3-3"
        />
      </svg>
    );
  return sortDirection === 'asc' ? (
    <svg
      className="ml-1 h-4 w-4 text-blue-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M7 11l3-3 3 3"
      />
    </svg>
  ) : (
    <svg
      className="ml-1 h-4 w-4 text-blue-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M7 9l3 3 3-3"
      />
    </svg>
  );
}

export function PrintHistoryTable({
  items,
  isLoading,
  onItemClick,
  sortColumn,
  sortDirection,
  onSort,
}: PrintHistoryTableProps) {
  const t = useTranslations('staff.managePrintHistory');

  if (isLoading) {
    return <PrintHistoryTableSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-slate-500 dark:text-white/50">
        {t('table.noData')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
              onClick={() => onSort('createdAt')}
            >
              <div className="flex items-center">
                {t('table.createdAt')}
                <SortIcon
                  column="createdAt"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.student')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.printer')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.file')}
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
              onClick={() => onSort('totalPages')}
            >
              <div className="flex items-center">
                {t('table.pages')}
                <SortIcon
                  column="totalPages"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
              onClick={() => onSort('totalPrice')}
            >
              <div className="flex items-center">
                {t('table.price')}
                <SortIcon
                  column="totalPrice"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.status')}
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.paymentMethod')}
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.jobId}
              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
              onClick={() => onItemClick(item)}
            >
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900 dark:text-white">
                  {item.studentCode}
                </div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  {item.studentName}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900 dark:text-white">
                  {item.printerCode}
                </div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  {item.roomName}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900 dark:text-white">
                  {item.fileName}
                </div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  {item.fileType.toUpperCase()}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 dark:text-white/75">
                {item.printedPages || item.totalPages} / {item.totalPages}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(item.totalPrice)}
                </div>
                {item.discountAmount > 0 && (
                  <div className="text-xs text-slate-500 dark:text-white/60">
                    -{formatCurrency(item.discountAmount)}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={item.printStatus} t={t} />
              </td>
              <td className="px-4 py-3 text-center">
                <PaymentMethodBadge method={item.paymentMethod} t={t} />
              </td>
              <td className="px-4 py-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={e => {
                    e.stopPropagation();
                    onItemClick(item);
                  }}
                  title={t('table.viewDetail')}
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
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
