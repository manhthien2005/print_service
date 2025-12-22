import { Skeleton } from '@/components/common/Skeleton';

export function DetailModalSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {/* Header Skeleton - Only content, not title */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex items-center gap-4">
          <Skeleton
            className="h-14 w-14 shrink-0 rounded-lg"
            variant="shimmer"
          />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" variant="shimmer" />
            <Skeleton className="h-4 w-48" variant="shimmer" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-md" variant="shimmer" />
          <Skeleton className="h-7 w-20 rounded-full" variant="shimmer" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Printer Info Skeleton */}
        <div className="relative rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 pt-6 dark:border-white/10 dark:bg-white/5">
          <Skeleton
            className="absolute right-4 top-4 h-6 w-24 rounded-full"
            variant="shimmer"
          />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" variant="shimmer" />
              <Skeleton className="h-5 w-40" variant="shimmer" />
              <Skeleton className="h-4 w-32" variant="shimmer" />
              <Skeleton className="h-4 w-36" variant="shimmer" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" variant="shimmer" />
          </div>
        </div>

        {/* Print Config Skeleton */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <Skeleton className="mb-4 h-3 w-24" variant="shimmer" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" variant="shimmer" />
                <Skeleton className="h-4 w-16" variant="shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Time Info Skeleton */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <Skeleton className="mb-4 h-3 w-20" variant="shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" variant="shimmer" />
            <Skeleton className="h-4 w-52" variant="shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
