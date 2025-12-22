'use client';

import type { PrintJobStatus } from '../types';
import { cn } from '@/lib/utils/cn';

interface StatusBadgeProps {
  status: PrintJobStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<PrintJobStatus, string> = {
    completed:
      'bg-green-100 text-green-700 ring-green-500/30 dark:bg-green-500/10 dark:text-green-300',
    processing:
      'bg-amber-100 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    queued:
      'bg-slate-100 text-slate-700 ring-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200',
    failed:
      'bg-rose-100 text-rose-700 ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  };

  const label: Record<PrintJobStatus, string> = {
    completed: 'Hoàn tất',
    processing: 'Đang xử lý',
    queued: 'Đang chờ',
    failed: 'Lỗi',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        styles[status]
      )}
    >
      {label[status]}
    </span>
  );
}
