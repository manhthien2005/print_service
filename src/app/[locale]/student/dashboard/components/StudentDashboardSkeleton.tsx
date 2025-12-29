'use client';

import { Skeleton } from '@/components/common/Skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

interface StudentDashboardSkeletonProps {
  t?: any;
}

export default function StudentDashboardSkeleton({
  t,
}: StudentDashboardSkeletonProps = {}) {
  const studentCopy = (t && t.student) || {};
  return (
    <div className="space-y-6">
      {/* Grid chính: Khối số dư và Lưu ý nhanh cùng hàng */}
      <div className="grid items-stretch gap-6 xl:grid-cols-[1.6fr,1fr]">
        {/* Cột trái: Khối số dư */}
        <div className="flex h-full">
          <Card className="relative flex h-full w-full overflow-hidden border-slate-200/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-lg backdrop-blur dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/0">
            <CardContent className="relative flex w-full min-w-0 flex-col p-6">
              {/* Header trong Card - Xin chào */}
              <div className="mb-4 pb-2 pt-2">
                <Skeleton className="h-10 w-64" variant="shimmer" />
              </div>

              {/* Grid 1 cột: Số dư tiền + Công việc tháng này, Trang đã in */}
              <div className="flex w-full min-w-0 flex-1 flex-col space-y-4">
                {/* Số dư tiền */}
                <div className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <Skeleton className="h-4 w-24" variant="shimmer" />
                  <div className="mt-2 flex items-end gap-2">
                    <Skeleton className="h-9 w-32" variant="shimmer" />
                    <Skeleton className="h-4 w-4" variant="shimmer" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-32" variant="shimmer" />
                </div>

                {/* Công việc tháng này và Trang đã in */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <Skeleton className="h-4 w-32" variant="shimmer" />
                    <div className="mt-2 flex items-end gap-2">
                      <Skeleton className="h-9 w-16" variant="shimmer" />
                    </div>
                    <Skeleton className="mt-2 h-3 w-24" variant="shimmer" />
                  </div>

                  <div className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <Skeleton className="h-4 w-24" variant="shimmer" />
                    <div className="mt-2 flex items-end gap-2">
                      <Skeleton className="h-9 w-16" variant="shimmer" />
                    </div>
                    <Skeleton className="mt-2 h-3 w-24" variant="shimmer" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Lưu ý nhanh */}
        <Card className="h-full border-slate-200/70 bg-white/90 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              {studentCopy.highlights?.title ?? 'Quick notes'}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-white/70">
              {studentCopy.highlights?.description ??
                'Keep your printing smooth.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <Skeleton className="h-5 w-32" variant="shimmer" />
                <div className="mt-2 space-y-1">
                  <Skeleton className="h-4 w-full" variant="shimmer" />
                  <Skeleton className="h-4 w-3/4" variant="shimmer" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-[1.6fr,1fr]">
        {/* Recent prints card */}
        <Card className="h-full border-slate-200/70 bg-white/90 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
              {studentCopy.recent?.title ?? 'Recent prints'}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-white/70">
              {studentCopy.recent?.description ?? 'Track the latest jobs.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10"
              >
                <Skeleton
                  className="h-12 w-12 shrink-0 rounded"
                  variant="shimmer"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-5 w-40" variant="shimmer" />
                    <Skeleton
                      className="h-6 w-20 rounded-full"
                      variant="shimmer"
                    />
                  </div>
                  <Skeleton className="h-4 w-32" variant="shimmer" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" variant="shimmer" />
                    <Skeleton className="h-3 w-20" variant="shimmer" />
                  </div>
                </div>
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-lg" variant="shimmer" />
          </CardContent>
        </Card>

        {/* Quick actions card */}
        <Card className="h-full border-slate-200/70 bg-white/90 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              {studentCopy.quickActions?.title ?? 'Quick actions'}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-white/70">
              {studentCopy.quickActions?.description ??
                'Jump into the most used student flows.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/70 px-4 py-4 dark:border-white/10"
              >
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" variant="shimmer" />
                  <Skeleton className="h-4 w-48" variant="shimmer" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" variant="shimmer" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
