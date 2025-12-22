import { Skeleton } from '@/components/common/Skeleton';
import { Card } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Profile Header Skeleton */}
      <SpotlightCard className="flex flex-col items-center gap-6 border-slate-200/70 bg-gradient-to-br from-white via-sky-50/30 to-indigo-50/30 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:from-white/5 dark:via-sky-500/10 dark:to-indigo-500/10">
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          {/* Avatar Skeleton */}
          <Skeleton className="h-32 w-32 rounded-full" variant="shimmer" />

          {/* Name and Status Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" variant="shimmer" />
            <Skeleton className="mx-auto h-8 w-32" variant="shimmer" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32" variant="shimmer" />
            <Skeleton className="h-10 w-36" variant="shimmer" />
          </div>
        </div>
      </SpotlightCard>

      {/* Balance Card Skeleton */}
      <SpotlightCard className="relative overflow-hidden border-slate-200/70 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-xl backdrop-blur dark:border-white/10 dark:from-emerald-500/10 dark:via-white/5 dark:to-sky-500/10">
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" variant="shimmer" />
              <Skeleton className="h-12 w-48" variant="shimmer" />
              <Skeleton className="h-4 w-32" variant="shimmer" />
            </div>
            <Skeleton className="h-11 w-28" variant="shimmer" />
          </div>
        </div>
      </SpotlightCard>

      {/* Contact Info and Academic Details Skeleton - Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info Skeleton */}
        <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="p-6">
            <Skeleton className="mb-6 h-4 w-32" variant="shimmer" />
            <div className="space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton
                    className="h-12 w-12 shrink-0 rounded-xl"
                    variant="shimmer"
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" variant="shimmer" />
                    <Skeleton className="h-4 w-28" variant="shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Academic Details Skeleton */}
        <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="p-6">
            <Skeleton className="mb-6 h-4 w-40" variant="shimmer" />
            <div className="space-y-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton
                    className="h-12 w-12 shrink-0 rounded-xl"
                    variant="shimmer"
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" variant="shimmer" />
                    <Skeleton className="h-4 w-28" variant="shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

