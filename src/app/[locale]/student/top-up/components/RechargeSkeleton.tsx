import { Skeleton } from '@/components/common/Skeleton';
import { Card } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { DepositHistoryTableSkeleton } from './DepositHistoryTableSkeleton';

export function RechargeSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Package Selection Skeleton */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-48" variant="shimmer" />
          <Skeleton className="h-4 w-64" variant="shimmer" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <SpotlightCard
              key={i}
              className="relative h-full border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <Card className="relative h-full border-0 bg-transparent shadow-none">
                <div className="space-y-4 p-6">
                  {/* Package Name */}
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" variant="shimmer" />
                    <Skeleton className="h-4 w-40" variant="shimmer" />
                  </div>
                  {/* Amount */}
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-28" variant="shimmer" />
                    <Skeleton className="h-4 w-36" variant="shimmer" />
                    <Skeleton className="h-4 w-32" variant="shimmer" />
                  </div>
                  {/* Button */}
                  <div className="mt-auto pt-4">
                    <Skeleton className="h-10 w-full" variant="shimmer" />
                  </div>
                </div>
              </Card>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Custom Amount Input Skeleton */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-40" variant="shimmer" />
          <Skeleton className="h-4 w-56" variant="shimmer" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" variant="shimmer" />
            <Skeleton className="h-12 w-full" variant="shimmer" />
            <Skeleton className="h-3 w-48" variant="shimmer" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 flex-1" variant="shimmer" />
            <Skeleton className="h-12 w-32" variant="shimmer" />
          </div>
        </div>
      </div>

      {/* Deposit History Table Skeleton */}
      <DepositHistoryTableSkeleton />
    </div>
  );
}
