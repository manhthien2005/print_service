'use client';

import Link from 'next/link';
import { FileIcon } from '../../print/components/FileIcon';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import CountUp from '@/components/ui/CountUp';
import BalanceCountUp from '@/app/[locale]/student/profile/components/BalanceCountUp';
import GradientText from '@/components/ui/GradientText';
import { cn } from '@/lib/utils/cn';
import { useStudentDashboard } from '@/lib/api/services/student';
import { useBonusPackages } from '@/lib/api/services/payment';
import type { StudentDashboardResponse } from '@/types/api';
import { studentQuickActionsMock } from '../constants';
import { STATUS_STYLES } from '../constants';
import StudentDashboardSkeleton from './StudentDashboardSkeleton';

export default function StudentDashboard({
  locale,
  t,
}: {
  locale: string;
  t: any;
}) {
  const studentCopy = (t && t.student) || {};

  const withLocale = (path: string) =>
    `/${locale}${path.startsWith('/') ? path : '/' + path}`;

  const statusCopy = (studentCopy.recent && studentCopy.recent.status) || {};

  // Fetch dashboard data from API
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isError: isErrorDashboard,
    isFetching: isFetchingDashboard,
  } = useStudentDashboard();

  // Debug: Log API call status
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('📊 Dashboard API Status:', {
      isLoading: isLoadingDashboard,
      isFetching: isFetchingDashboard,
      isError: isErrorDashboard,
      hasData: !!dashboardData,
      endpoint: '/api/student/dashboard',
    });
  }

  // Fetch bonus packages for printing discounts
  const { data: bonusPackagesData, isLoading: isLoadingBonusPackages } =
    useBonusPackages();

  // Extract data
  // useApiQuery returns AxiosResponse<ApiResponse<StudentDashboardResponse>>
  // So we need: dashboardData.data.data to get StudentDashboardResponse
  const dashboard = dashboardData?.data?.data as
    | StudentDashboardResponse
    | undefined;
  const userName = dashboard?.userName || 'Sinh viên';
  const recentFiles = Array.isArray(dashboard?.recentFiles)
    ? dashboard.recentFiles
    : [];

  // Debug: Log extracted data
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('📊 Extracted Dashboard Data:', {
      hasDashboard: !!dashboard,
      userName: dashboard?.userName,
      hasBalance: !!dashboard?.balance,
      hasStats: !!dashboard?.printHistoryStats,
      recentFilesCount: recentFiles.length,
    });
  }

  // Ensure bonusPackages is always an array
  // useApiQuery returns AxiosResponse<ApiResponse<BonusPackageResponse[]>>
  // So we need: bonusPackagesData.data.data to get BonusPackageResponse[]
  const bonusPackages = Array.isArray(bonusPackagesData?.data?.data)
    ? bonusPackagesData.data.data
    : [];

  // Debug: Log bonus packages
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🎁 Bonus Packages Data:', {
      hasData: !!bonusPackagesData,
      rawData: bonusPackagesData?.data,
      packages: bonusPackagesData?.data?.data,
      packagesCount: bonusPackages.length,
      activePackages: bonusPackages.filter(
        (pkg: any) => pkg?.isActive !== false
      ).length,
    });
  }

  // Loading state
  const isLoading = isLoadingDashboard || isLoadingBonusPackages;

  // Prepare highlights (bonus packages + support info) - removed "Quy đổi khổ giấy", changed "Làm mới hạn mức" to "Làm mới bonus"
  // Filter only active bonus packages and sort by minPages
  const activeBonusPackages = Array.isArray(bonusPackages)
    ? bonusPackages
        .filter((pkg: any) => pkg?.isActive !== false)
        .sort((a: any, b: any) => (a?.minPages || 0) - (b?.minPages || 0))
    : [];

  // Prepare highlights: bonus packages from API + hardcoded support info
  // Debug: Log highlights preparation
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('📝 Preparing Highlights:', {
      activeBonusPackagesCount: activeBonusPackages.length,
      activeBonusPackages: activeBonusPackages,
    });
  }

  const highlights = [
    // Bonus packages from API
    ...(activeBonusPackages.length > 0
      ? [
          {
            id: 'bonus-packages',
            title: 'Gói giảm giá khi in',
            description: activeBonusPackages.map((pkg: any) => {
              const discountPercent = (pkg.discountPercentage * 100).toFixed(0);
              if (pkg.discountPercentage === 0) {
                return `In từ ${pkg.minPages} trang: không giảm giá`;
              }
              return `In từ ${pkg.minPages} trang: giảm ${discountPercent}%`;
            }),
          },
        ]
      : []),
    // Hardcoded support info
    {
      id: 'reset',
      title: 'Làm mới bonus',
      description:
        'Hệ thống tự động cập nhật bonus mỗi tháng. Kiểm tra thường xuyên để nhận ưu đãi tốt nhất.',
    },
    {
      id: 'support',
      title: 'Hỗ trợ kỹ thuật',
      description: 'Liên hệ IT helpdesk nếu gặp lỗi kết nối hoặc kẹt giấy.',
    },
  ];

  // Loading state - show header immediately, skeleton for data
  if (isLoading) {
    return (
      <div className="space-y-8 pb-24">
        {/* Header ngoài Card - đồng bộ style với các trang khác */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Trang chủ
          </h1>
          <p className="mt-2 text-slate-600 dark:text-white/70">
            {studentCopy.subtext ??
              'Kiểm tra số dư, in nhanh và theo dõi gần đây.'}
          </p>
        </header>
        <StudentDashboardSkeleton t={t} />
      </div>
    );
  }

  // Error state
  if (isErrorDashboard) {
    return (
      <div className="space-y-8 pb-24">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Trang chủ
          </h1>
          <p className="mt-2 text-slate-600 dark:text-white/70">
            {studentCopy.subtext ??
              'Kiểm tra số dư, in nhanh và theo dõi gần đây.'}
          </p>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-rose-600 dark:text-rose-400">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
          </div>
        </div>
      </div>
    );
  }

  // Extract values from API data
  const balance = dashboard?.balance?.balanceAmount || 0;
  const jobsThisMonth = dashboard?.printHistoryStats?.jobsThisMonth?.total || 0;
  const jobsGrowthPercent =
    dashboard?.printHistoryStats?.jobsThisMonth?.growthPercent || 0;
  const pagesThisMonth = dashboard?.printHistoryStats?.pagesThisMonth || 0;
  const pagesLast30Days = dashboard?.printHistoryStats?.pagesLast30Days || 0;

  // Debug: Log extracted values
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('📊 Extracted Dashboard Values:', {
      userName,
      balance,
      jobsThisMonth,
      jobsGrowthPercent,
      pagesThisMonth,
      pagesLast30Days,
      hasRecentFiles: recentFiles.length > 0,
    });
  }

  // Calculate pages difference: Estimate pages from previous month
  // pagesLast30Days includes current month, so: pagesLast30Days - pagesThisMonth ≈ pages from previous month in last 30 days
  // This is an approximation since 30 days may span across two months
  const estimatedPagesLastMonth = Math.max(0, pagesLast30Days - pagesThisMonth);
  const pagesDifference = pagesThisMonth - estimatedPagesLastMonth;

  return (
    <div className="space-y-8 pb-24">
      {/* Header ngoài Card - đồng bộ style với các trang khác */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Trang chủ
        </h1>
        <p className="mt-2 text-slate-600 dark:text-white/70">
          {studentCopy.subtext ??
            'Kiểm tra số dư, in nhanh và theo dõi gần đây.'}
        </p>
      </header>

      <div className="space-y-6">
        {/* Grid chính: Khối số dư và Lưu ý nhanh cùng hàng */}
        <div className="grid items-stretch gap-6 xl:grid-cols-[1.6fr,1fr]">
          {/* Cột trái: Khối số dư - chỉ có 3 khối chính */}
          <div className="flex h-full">
            {/* Card số dư */}
            <Card className="relative flex h-full w-full overflow-hidden border-slate-200/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-lg backdrop-blur dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/0">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
              <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/20" />
              <CardContent className="relative flex w-full min-w-0 flex-col p-6">
                {/* Header trong Card - Xin chào */}
                <div className="mb-4 pb-2 pt-2">
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                    <span>Xin chào, </span>
                    <GradientText
                      colors={[
                        '#40ffaa',
                        '#4079ff',
                        '#40ffaa',
                        '#4079ff',
                        '#40ffaa',
                      ]}
                      animationSpeed={3}
                      showBorder={false}
                    >
                      {userName}
                    </GradientText>
                  </h2>
                </div>

                {/* Grid 1 cột: Số dư tiền + Công việc tháng này, Trang đã in */}
                <div className="flex w-full min-w-0 flex-1 flex-col space-y-4">
                  {/* Số dư tiền */}
                  <div className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-medium text-slate-500 dark:text-white/70">
                      {studentCopy.balance?.title ?? 'Số dư tiền'}
                    </p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                        <BalanceCountUp to={balance} duration={2} />
                      </span>
                      <span className="text-sm text-slate-500 dark:text-white/70">
                        ₫
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-white/60">
                      {studentCopy.balance?.subtitle ?? 'Số dư khả dụng'}
                    </p>
                  </div>

                  {/* Công việc tháng này và Trang đã in - cùng một row */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm font-medium text-slate-500 dark:text-white/70">
                        {studentCopy.stats?.jobsThisMonth ??
                          'Công việc tháng này'}
                      </p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                          <CountUp to={jobsThisMonth} />
                        </span>
                      </div>
                      {jobsGrowthPercent !== 0 && (
                        <p
                          className={`mt-2 text-xs ${jobsGrowthPercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                        >
                          {jobsGrowthPercent > 0 ? '+' : ''}
                          {jobsGrowthPercent}% so với tháng trước
                        </p>
                      )}
                    </div>

                    <div className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm font-medium text-slate-500 dark:text-white/70">
                        {studentCopy.stats?.pagesThisMonth ?? 'Trang đã in'}
                      </p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                          <CountUp to={pagesThisMonth} />
                        </span>
                      </div>
                      {estimatedPagesLastMonth > 0 && pagesDifference !== 0 && (
                        <p
                          className={`mt-2 text-xs ${pagesDifference > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                        >
                          {pagesDifference > 0 ? '+' : ''}
                          {pagesDifference} trang so với tháng trước
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột phải: Lưu ý nhanh - cùng hàng với khối số dư */}
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
              {highlights.map(item => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <p className="font-semibold">{item.title}</p>
                  {Array.isArray(item.description) ? (
                    <ul className="mt-1 space-y-1 text-slate-600 dark:text-white/70">
                      {item.description.map((line, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-white/60" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-600 dark:text-white/70">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.6fr,1fr]">
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
              {recentFiles.length > 0 ? (
                recentFiles.slice(0, 5).map((item: any, index: number) => {
                  // Map API response to display format
                  const statusKey =
                    item.printStatus?.toLowerCase() || 'completed';
                  const status =
                    STATUS_STYLES[statusKey as keyof typeof STATUS_STYLES] ??
                    STATUS_STYLES.completed;
                  const statusLabel =
                    (statusCopy && statusCopy[statusKey]) ?? statusKey;

                  return (
                    <div
                      key={item.jobId || index}
                      className="flex items-center gap-4 rounded-xl border border-slate-200/70 px-3 py-3 transition hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
                    >
                      <FileIcon
                        fileName={item.fileName || 'document'}
                        size={48}
                        className="shrink-0"
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {item.fileName || 'Unknown file'}
                          </p>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                              status.className
                            )}
                          >
                            <span
                              className={cn('h-2 w-2 rounded-full', status.dot)}
                            />
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-white/70">
                          {item.printerName ||
                            item.printerLocation ||
                            'Unknown printer'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
                          <span>
                            {item.totalPages
                              ? `${item.totalPages} trang`
                              : 'N/A'}
                          </span>
                          <span>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  'vi-VN'
                                )
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-500 dark:text-white/60">
                  Chưa có lịch sử in gần đây
                </div>
              )}

              <Link href={withLocale('/student/history')} className="block">
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  {studentCopy.recent?.viewAll ?? 'View history'}
                </Button>
              </Link>
            </CardContent>
          </Card>

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
              {studentQuickActionsMock.map(action => (
                <Link
                  key={action.id}
                  href={withLocale(action.href)}
                  className="block"
                >
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/70 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {action.title}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-white/70">
                        {action.description}
                      </p>
                    </div>
                    {action.badge && (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200">
                        {action.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
