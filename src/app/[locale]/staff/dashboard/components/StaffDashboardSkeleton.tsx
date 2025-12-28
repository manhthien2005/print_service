'use client';

import { Skeleton } from '@/components/common/Skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

interface StaffDashboardSkeletonProps {
  t?: {
    title?: string;
    welcome?: string;
    staff?: {
      stats?: {
        printersOnline?: string;
        jobsToday?: string;
        pagesMonth?: string;
        caption?: {
          total?: string;
          lastJob?: string;
        };
      };
      weekly?: {
        title?: string;
        description?: string;
      };
      paper?: {
        title?: string;
        description?: string;
      };
      printer?: {
        title?: string;
        description?: string;
      };
      alerts?: {
        title?: string;
        description?: string;
      };
    };
  };
}

export default function StaffDashboardSkeleton({
  t,
}: StaffDashboardSkeletonProps = {}) {
  const staff = t?.staff || {};
  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">
          {t?.title ?? 'Bảng điều khiển'}
        </h1>
        {t?.welcome && <p className="text-white/70">{t.welcome}</p>}
      </div>

      {/* Stats Widgets Skeleton */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        {[
          {
            label: staff.stats?.printersOnline ?? 'Máy in trực tuyến',
            caption: staff.stats?.caption?.total ?? 'Tổng {total} máy',
          },
          {
            label: staff.stats?.jobsToday ?? 'Công việc hôm nay',
            caption: staff.stats?.caption?.lastJob ?? 'Công việc gần nhất',
          },
          {
            label: staff.stats?.pagesMonth ?? 'Trang tháng này',
          },
        ].map((widget, i) => (
          <Card key={i} className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="pb-3">
              <p className="text-sm font-medium text-white/70">
                {widget.label}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-24" variant="shimmer" />
                <Skeleton className="h-6 w-16 rounded-full" variant="shimmer" />
              </div>
              {widget.caption && (
                <p className="mt-2 text-xs text-white/60">{widget.caption}</p>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Bar Chart Skeleton */}
        <Card className="border-white/10 bg-white/5 backdrop-blur xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">
              {staff.weekly?.title ?? 'Hoạt động in theo tuần'}
            </CardTitle>
            <CardDescription className="text-white/70">
              {staff.weekly?.description ?? 'Thống kê công việc và trang in'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <Skeleton className="h-full w-full" variant="shimmer" />
          </CardContent>
        </Card>

        {/* Pie Chart Skeleton */}
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">
              {staff.paper?.title ?? 'Sử dụng khổ giấy'}
            </CardTitle>
            <CardDescription className="text-white/70">
              {staff.paper?.description ?? 'Phân bố các khổ giấy'}
            </CardDescription>
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
            <CardTitle className="text-white">
              {staff.printer?.title ?? 'Trạng thái máy in'}
            </CardTitle>
            <CardDescription className="text-white/70">
              {staff.printer?.description ?? 'Tổng quan hệ thống'}
            </CardDescription>
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
            <CardTitle className="text-white">
              {staff.alerts?.title ?? 'Cảnh báo'}
            </CardTitle>
            <CardDescription className="text-white/70">
              {staff.alerts?.description ?? 'Thông báo hệ thống'}
            </CardDescription>
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
