import type { PrintHistoryItem } from '../types';
import { FileIcon } from '../../print/components/FileIcon';
import { formatDate } from '../utils';
import { formatCurrency } from '@/lib/utils/format';
import { StatusBadge } from './StatusBadge';
import { tagExcludes } from '../constants';

interface HistoryRowProps {
  item: PrintHistoryItem;
  onClick: () => void;
}

export function HistoryRow({ item, onClick }: HistoryRowProps) {
  const readableTags =
    item.tags?.filter(tag => !tagExcludes.includes(tag)).join(', ') ?? '';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group grid w-full grid-cols-12 items-center gap-4 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 text-left transition hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5"
    >
      <div className="col-span-3">
        <div className="flex items-center gap-3">
          <FileIcon fileName={item.documentName} size={40} />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 font-semibold text-slate-900 dark:text-white">
              {item.documentName}
            </div>
            <div className="text-xs text-slate-500 dark:text-white/60">
              {item.copies} bản • {item.fileSizeKB} KB
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
            ? 'In màu'
            : item.colorMode === 'grayscale'
              ? 'In xám'
              : 'Đen trắng'}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          {item.duplex ? '2 mặt' : '1 mặt'}
        </div>
        {readableTags && (
          <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
            {readableTags}
          </div>
        )}
      </div>

      <div className="col-span-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          {item.pageCount} trang
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          {formatCurrency(item.costVnd || 0)}
        </div>
      </div>

      <div className="col-span-2">
        <div className="text-sm text-slate-800 dark:text-white">
          {formatDate(item.submittedAt)}
        </div>
        <div className="text-xs text-slate-500 dark:text-white/60">
          Kết thúc: {formatDate(item.completedAt)}
        </div>
      </div>

      <div className="col-span-2 flex flex-col items-center justify-center gap-2 text-center">
        <StatusBadge status={item.status} />
      </div>
    </button>
  );
}
