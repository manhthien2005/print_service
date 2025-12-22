import { Skeleton } from '@/components/common/Skeleton';

export function HistoryTableSkeleton() {
  return (
    <>
      {/* Table Header Skeleton */}
      <div className="hidden grid-cols-12 items-center gap-4 px-1 py-2 md:grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-4 w-full" variant="shimmer" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className="grid grid-cols-12 items-center gap-4 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5"
        >
          <div className="col-span-3 flex items-center gap-3">
            <Skeleton
              className="h-10 w-10 shrink-0 rounded-lg"
              variant="shimmer"
            />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" variant="shimmer" />
              <Skeleton className="h-3 w-24" variant="shimmer" />
            </div>
          </div>
          <div className="col-span-2 space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-3 w-20" variant="shimmer" />
          </div>
          <div className="col-span-2 space-y-2">
            <Skeleton className="h-4 w-20" variant="shimmer" />
            <Skeleton className="h-3 w-16" variant="shimmer" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-4 w-16" variant="shimmer" />
          </div>
          <div className="col-span-2 space-y-2">
            <Skeleton className="h-4 w-32" variant="shimmer" />
            <Skeleton className="h-3 w-28" variant="shimmer" />
          </div>
          <div className="col-span-2 flex justify-center">
            <Skeleton className="h-6 w-20 rounded-full" variant="shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}

