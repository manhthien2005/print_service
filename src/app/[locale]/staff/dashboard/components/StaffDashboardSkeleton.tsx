'use client';

import { Skeleton } from '@/components/common/Skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function StaffDashboardSkeleton() {
  return (
    <div className="space-y-8 pb-24">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" variant="shimmer" />
        <Skeleton className="h-10 w-64" variant="shimmer" />
        <Skeleton className="h-5 w-96" variant="shimmer" />
      </div>

      {/* Stats Widgets Skeleton */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" variant="shimmer" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-24" variant="shimmer" />
                <Skeleton className="h-6 w-16 rounded-full" variant="shimmer" />
              </div>
              <Skeleton className="mt-2 h-4 w-40" variant="shimmer" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Bar Chart Skeleton */}
        <Card className="border-white/10 bg-white/5 backdrop-blur xl:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" variant="shimmer" />
            <Skeleton className="mt-2 h-4 w-64" variant="shimmer" />
          </CardHeader>
          <CardContent className="h-[320px]">
            <Skeleton className="h-full w-full" variant="shimmer" />
          </CardContent>
        </Card>

        {/* Pie Chart Skeleton */}
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <Skeleton className="h-6 w-40" variant="shimmer" />
            <Skeleton className="mt-2 h-4 w-56" variant="shimmer" />
          </CardHeader>
          <CardContent className="h-[320px]">
            <Skeleton
              className="h-full w-full rounded-full"
              variant="shimmer"
            />
          </CardContent>
        </Card>
      </div>

      {/* Printer Status & Alerts Skeleton */}
      <div className="grid items-stretch gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Printer Status Card Skeleton */}
        <Card className="h-full border-white/10 bg-white/5 backdrop-blur">
          <CardHeader className="pb-3">
            <Skeleton className="h-7 w-48" variant="shimmer" />
            <Skeleton className="mt-2 h-4 w-64" variant="shimmer" />
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <Skeleton className="h-4 w-20" variant="shimmer" />
                  <Skeleton className="mt-2 h-8 w-12" variant="shimmer" />
                </div>
              ))}
            </div>
            <Skeleton className="h-2 w-full rounded-full" variant="shimmer" />
            <Skeleton className="h-12 w-full rounded-lg" variant="shimmer" />
          </CardContent>
        </Card>

        {/* Alerts Card Skeleton */}
        <Card className="h-full border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <Skeleton className="h-6 w-32" variant="shimmer" />
            <Skeleton className="mt-2 h-4 w-48" variant="shimmer" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map(i => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" variant="shimmer" />
                  <Skeleton
                    className="h-6 w-20 rounded-full"
                    variant="shimmer"
                  />
                </div>
                <Skeleton className="mt-2 h-4 w-24" variant="shimmer" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

