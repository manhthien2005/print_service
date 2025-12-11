'use client';

import { Button } from './Button';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const goTo = (next: number) => {
    const target = Math.min(totalPages, Math.max(1, next));
    onChange(target);
  };

  const renderPages = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPageInitial = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1
    );

    let endPage = endPageInitial;
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
      endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    }

    const pages: (number | string)[] = [];
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages.map((p, idx) =>
      p === '...' ? (
        <span
          key={`ellipsis-${idx}`}
          className="px-2 text-slate-500 dark:text-slate-400"
        >
          ...
        </span>
      ) : (
        <Button
          key={p}
          variant={page === p ? 'default' : 'outline'}
          size="sm"
          onClick={() => goTo(p as number)}
          className={cn(
            'min-w-[40px] border',
            page === p
              ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10'
          )}
        >
          {p}
        </Button>
      )
    );
  };

  return (
    <div
      className={cn(
        'mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="text-sm text-slate-600 dark:text-white/70">
        Hiển thị{' '}
        <span className="font-medium text-slate-900 dark:text-white">
          {start}
        </span>
        -
        <span className="font-medium text-slate-900 dark:text-white">
          {end}
        </span>{' '}
        trên{' '}
        <span className="font-medium text-slate-900 dark:text-white">
          {total}
        </span>{' '}
        mục
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(1)}
          disabled={page === 1}
          className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10"
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
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
            />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10"
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Button>
        <div className="flex items-center gap-1">{renderPages()}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10"
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
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(totalPages)}
          disabled={page === totalPages}
          className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10"
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
              d="M11.25 4.5l-7.5 7.5 7.5 7.5m6-15l-7.5 7.5 7.5 7.5"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
