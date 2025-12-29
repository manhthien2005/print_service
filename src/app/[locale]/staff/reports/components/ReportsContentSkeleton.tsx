'use client';

import { Skeleton } from '@/components/common/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';

export default function ReportsContentSkeleton() {
  const t = useTranslations('staff.reports');

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map(i => (
          <Card
            key={i}
            className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" variant="shimmer" />
            </CardHeader>
            <CardContent className="flex items-end justify-between pb-4">
              <Skeleton className="h-9 w-24" variant="shimmer" />
              <Skeleton className="h-3 w-16" variant="shimmer" />
            </CardContent>
            <CardContent className="pt-0">
              <Skeleton className="h-3 w-40" variant="shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Card */}
      <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-48" variant="shimmer" />
            <Skeleton className="h-10 w-48" variant="shimmer" />
            <Skeleton className="h-10 w-48" variant="shimmer" />
            <Skeleton className="h-10 w-24" variant="shimmer" />
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card
            key={i}
            className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <CardHeader>
              <Skeleton className="h-6 w-48" variant="shimmer" />
              <Skeleton className="mt-2 h-4 w-64" variant="shimmer" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" variant="shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
