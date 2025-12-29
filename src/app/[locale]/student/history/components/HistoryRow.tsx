'use client';

import type { PrintHistoryItem } from '@/app/[locale]/student/history/types';
import { FileIcon } from '@/app/[locale]/student/print/components/FileIcon';
import { formatDate } from '@/app/[locale]/student/history/utils';
import { formatCurrency } from '@/lib/utils/format';
import { StatusBadge } from './StatusBadge';
import { tagExcludes } from '@/app/[locale]/student/history/constants';
import { useTranslations, useLocale } from 'next-intl';

interface HistoryRowProps {
  item: PrintHistoryItem;
  onClick: () => void;
}

export function HistoryRow({ item, onClick }: HistoryRowProps) {
  const t = useTranslations('student.history.row');
  const locale = useLocale();
  const readableTags =
    item.tags?.filter(tag => !tagExcludes.includes(tag)).join(', ') ?? '';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group grid w-full grid-cols-12 items-center gap-4 rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-left transition hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5"
    >
      <div className="col-span-3">
        <div className="flex items-center gap-3">
          <FileIcon fileName={item.documentName} size={40} />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 font-semibold text-slate-900 dark:text-white">
              {item.documentName}
            </div>
            <div className="text-xs text-slate-500 dark:text-white/60">
              {t('copies', { count: item.copies })} • {item.fileSizeKB} KB
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-2">
        <div className="font-semibold text-slate-800 dark:text-white">
          {item.printerName}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          {item.location}
        </div>
      </div>

      <div className="col-span-2">
        <div className="text-sm text-slate-800 dark:text-white">
          {item.colorMode === 'color'
            ? t('colorMode.color')
            : item.colorMode === 'grayscale'
              ? t('colorMode.grayscale')
              : t('colorMode.blackWhite')}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          {item.duplex ? t('duplex.doubleSided') : t('duplex.oneSided')}
        </div>
        {readableTags && (
          <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
            {readableTags}
          </div>
        )}
      </div>

      <div className="col-span-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          {t('pages', { count: item.pageCount })}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          {formatCurrency(item.costVnd || 0)}
        </div>
      </div>

      <div className="col-span-2">
        <div className="text-sm text-slate-800 dark:text-white">
          {formatDate(item.submittedAt, locale)}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          {t('completedAt', { date: formatDate(item.completedAt, locale) })}
        </div>
      </div>

      <div className="col-span-2 flex flex-col items-center justify-center gap-2 text-center">
        <StatusBadge status={item.status} />
      </div>
    </button>
  );
}
