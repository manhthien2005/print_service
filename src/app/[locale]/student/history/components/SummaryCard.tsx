'use client';

import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/common/Skeleton';

interface SummaryCardProps {
  title: string;
  value: string;
  caption?: string;
  trend?: { label: string; positive?: boolean };
  isLoading?: boolean;
}

export function SummaryCard({
  title,
  value,
  caption,
  trend,
  isLoading,
}: SummaryCardProps) {
  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="text-sm font-semibold text-slate-500 dark:text-white/60">
        {title}
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
        {isLoading ? (
          <Skeleton className="h-10 w-24" variant="shimmer" />
        ) : (
          value
        )}
      </div>
      {caption && (
        <div className="mt-1 text-sm text-slate-500 dark:text-white/60">
          {caption}
        </div>
      )}
      {trend && title !== 'Tỷ lệ thành công' && !isLoading && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
            trend.positive
              ? 'bg-green-500/10 text-green-600 dark:text-green-300'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
          )}
        >
          {trend.positive ? (
            <svg
              className="h-4 w-4 text-green-600 dark:text-green-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 14l5-5 4 4 5-7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 6h4v4"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-amber-600 dark:text-amber-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 10l5 5 4-4 5 7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18h4v-4"
              />
            </svg>
          )}
          {trend.label}
        </div>
      )}
      {trend && title === 'Tỷ lệ thành công' && !isLoading && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/15 dark:text-green-300">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M12 21c4.97 0 9-3.582 9-8s-4.03-8-9-8-9 3.582-9 8 4.03 8 9 8z"
            />
          </svg>
          Ổn định
        </div>
      )}
    </div>
  );
}
