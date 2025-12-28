'use client';

import { Skeleton } from '@/components/common/Skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function PageAllocationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" variant="shimmer" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-24" variant="shimmer" />
              </div>
              <Skeleton className="mt-2 h-4 w-40" variant="shimmer" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader>
          <Skeleton className="h-6 w-48" variant="shimmer" />
          <Skeleton className="mt-2 h-4 w-64" variant="shimmer" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-9 gap-4 border-b border-white/10 pb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <Skeleton key={i} className="h-4 w-full" variant="shimmer" />
              ))}
            </div>
            {/* Table Rows */}
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="grid grid-cols-9 gap-4 border-b border-white/10 py-3"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(j => (
                  <Skeleton key={j} className="h-4 w-full" variant="shimmer" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
