import { Skeleton } from '@/components/common/Skeleton';

export function TransactionHistoryTableSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" variant="shimmer" />
          <Skeleton className="h-4 w-64" variant="shimmer" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Skeleton className="h-10 w-full md:w-48" variant="shimmer" />
        <Skeleton className="h-10 w-full md:w-48" variant="shimmer" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              {[1, 2, 3, 4, 5].map(i => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-4 w-24" variant="shimmer" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <tr
                key={i}
                className="border-b border-slate-100 dark:border-white/5"
              >
                {[1, 2, 3, 4, 5].map(j => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton
                      className={`h-4 ${
                        j === 4
                          ? 'ml-auto w-24'
                          : j === 5
                            ? 'mx-auto w-16'
                            : 'w-32'
                      }`}
                      variant="shimmer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
        <Skeleton className="h-4 w-48" variant="shimmer" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-9 w-9" variant="shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

