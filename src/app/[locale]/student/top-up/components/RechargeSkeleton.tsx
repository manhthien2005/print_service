import { Skeleton } from '@/components/common/Skeleton';
import { Card } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { DepositHistoryTableSkeleton } from '@/app/[locale]/student/top-up/components/DepositHistoryTableSkeleton';

interface RechargeSkeletonProps {
  t?: {
    packages?: {
      title: string;
      description: string;
    };
    custom?: {
      title: string;
      description?: string;
      amountLabel: string;
    };
  };
}

export function RechargeSkeleton({ t }: RechargeSkeletonProps = {}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Package Selection Skeleton */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t?.packages?.title ?? 'Chọn gói nạp tiền'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            {t?.packages?.description ??
              'Chọn một gói nạp tiền phù hợp với bạn'}
          </p>
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t?.custom?.title ?? 'Nạp tiền tùy chỉnh'}
          </h2>
          {t?.custom?.description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
              {t.custom.description}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white">
            {t?.custom?.amountLabel ?? 'Số tiền nạp'}
          </label>
          <div className="flex flex-col gap-4 md:flex-row md:flex-nowrap md:items-start">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-12 w-full" variant="shimmer" />
            </div>
            <div className="flex shrink-0 items-start">
              <Skeleton
                className="h-12 w-32 whitespace-nowrap"
                variant="shimmer"
              />
            </div>
          </div>
          <Skeleton className="h-3 w-48" variant="shimmer" />
        </div>
      </div>

      {/* Deposit History Table Skeleton */}
      <DepositHistoryTableSkeleton />
    </div>
  );
}
