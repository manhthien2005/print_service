import type { PrintHistoryItem } from '../types';

export function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPrinterStatusMeta(
  status?: PrintHistoryItem['printerStatus']
) {
  if (status === 'online') {
    return {
      label: 'Đang hoạt động',
      badge:
        'bg-emerald-100 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    };
  }
  if (status === 'maintenance') {
    return {
      label: 'Bảo trì',
      badge:
        'bg-amber-100 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
      dot: 'bg-amber-500',
    };
  }
  if (status === 'offline') {
    return {
      label: 'Ngoại tuyến',
      badge:
        'bg-rose-100 text-rose-700 ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
      dot: 'bg-rose-500',
    };
  }
  return {
    label: 'Chưa rõ',
    badge:
      'bg-slate-100 text-slate-700 ring-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200',
    dot: 'bg-slate-400',
  };
}

