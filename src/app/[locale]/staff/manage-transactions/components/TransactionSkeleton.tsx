'use client';

import { Skeleton } from '@/components/common/Skeleton';

const PAGE_SIZE = 10;

export function TransactionStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 15 }).map((_, index) => (
        <div
          key={`stats-skeleton-${index}`}
          className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        >
          <Skeleton className="h-4 w-24" variant="shimmer" />
          <Skeleton className="mt-3 h-9 w-32" variant="shimmer" />
        </div>
      ))}
    </div>
  );
}

export function TransactionTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              <Skeleton className="h-4 w-24" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              <Skeleton className="h-4 w-32" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              <Skeleton className="h-4 w-28" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              <Skeleton className="h-4 w-24" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              <Skeleton className="h-4 w-20" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              <Skeleton className="h-4 w-32" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
              <Skeleton className="h-4 w-40" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
              <Skeleton className="h-4 w-20" variant="shimmer" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.min(PAGE_SIZE, 5) }).map((_, index) => (
            <tr
              key={`table-skeleton-${index}`}
              className="animate-fade-in border-b border-slate-100 dark:border-white/5"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both',
              }}
            >
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-28" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-16" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-40" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
