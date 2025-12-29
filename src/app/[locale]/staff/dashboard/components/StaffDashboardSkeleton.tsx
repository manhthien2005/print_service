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
          {t?.title || 'Dashboard'}
        </h1>
        {t?.welcome && <p className="text-white/70">{t.welcome}</p>}
      </div>

      {/* Stats Widgets Skeleton - 4 widgets now */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: staff.stats?.jobsToday || 'Jobs today',
            caption: staff.stats?.caption?.lastJob || 'Last job',
          },
          {
            label: staff.stats?.pagesMonth || 'Pages this month',
          },
          {
            label: 'Revenue today',
          },
          {
            label: 'Active students',
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
              {staff.weekly?.title || 'Weekly activity'}
            </CardTitle>
            <CardDescription className="text-white/70">
              {staff.weekly?.description || 'Completed jobs and pages'}
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
              {staff.paper?.title || 'Paper size usage'}
            </CardTitle>
            <CardDescription className="text-white/70">
              {staff.paper?.description || 'Share of paper sizes'}
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
      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr,1fr]">
        {/* Printer Status Card Skeleton */}
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold text-white">
              {staff.printer?.title || 'Status'}
            </CardTitle>
            <CardDescription className="text-sm text-white/70">
              {staff.printer?.description || 'Health and utilization overview'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {/* 3x2 grid for printer status */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <Skeleton className="mb-1 h-3 w-16" variant="shimmer" />
                  <Skeleton className="h-6 w-12" variant="shimmer" />
                </div>
              ))}
            </div>
            <Skeleton
              className="mt-4 h-10 w-full rounded-lg"
              variant="shimmer"
            />
          </CardContent>
        </Card>

        {/* Alerts Card Skeleton */}
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold text-white">
              {staff.alerts?.title || 'Alerts'}
            </CardTitle>
            <CardDescription className="text-sm text-white/70">
              {staff.alerts?.description || 'Items to resolve soon'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-32" variant="shimmer" />
                    <Skeleton className="h-3 w-24" variant="shimmer" />
                  </div>
                  <Skeleton
                    className="h-5 w-16 rounded-full"
                    variant="shimmer"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
