'use client';

import React, { useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import CountUp from '@/components/ui/CountUp';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import {
  useCustomReport,
  usePaperUsage,
  useDashboardOverview,
} from '@/lib/api/services/staffReports';
import ReportsContentSkeleton from './ReportsContentSkeleton';
import { ReportManagement } from './ReportManagement';
import { DailyJobTrendsChart } from './charts/DailyJobTrendsChart';
import { DailyPageAnalyticsChart } from './charts/DailyPageAnalyticsChart';
import { TopActivePrintersChart } from './charts/TopActivePrintersChart';
import { MonthlyRevenueTrendsChart } from './charts/MonthlyRevenueTrendsChart';

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
      <p className="mb-2 font-semibold text-slate-900 dark:text-white">
        {label}
      </p>
      {payload.map((item, index) => (
        <p
          key={index}
          className="flex items-center gap-2 text-slate-700 dark:text-white/80"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.name}: <span className="font-semibold">{item.value}</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload, t }: ChartTooltipProps & { t: any }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
      <p className="mb-1 font-semibold text-slate-900 dark:text-white">
        {item.name}
      </p>
      <p className="text-slate-700 dark:text-white/80">
        {t('charts.printStatusDistribution.tooltip.quantity')}:{' '}
        <span className="font-semibold">{item.value}</span>
      </p>
    </div>
  );
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

function SummaryCard({
  title,
  value,
  caption,
  trend,
  useCountUp,
  countUpValue,
}: {
  title: string;
  value?: string;
  caption?: string;
  trend?: { label: string; positive?: boolean };
  useCountUp?: boolean;
  countUpValue?: number;
}) {
  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-600 dark:text-white/70">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between pb-4">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {useCountUp && countUpValue !== undefined ? (
            <CountUp to={countUpValue} separator="." duration={2} />
          ) : (
            value
          )}
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.positive
                ? 'text-emerald-600 dark:text-emerald-300'
                : 'text-rose-600 dark:text-rose-300'
            )}
          >
            {trend.label}
          </span>
        )}
      </CardContent>
      {caption && (
        <CardContent className="pt-0">
          <p className="text-xs text-slate-500 dark:text-white/60">{caption}</p>
        </CardContent>
      )}
    </Card>
  );
}

export function ReportsContent() {
  const t = useTranslations('staff.reports');
  const [dateRange, setDateRange] = useState<
    '7days' | '30days' | '90days' | 'custom'
  >('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate date range for API calls
  const dateRangeParams = useMemo(() => {
    const today = new Date();
    const to = today.toISOString().split('T')[0]; // YYYY-MM-DD

    let from: string;
    if (dateRange === '7days') {
      const date = new Date(today);
      date.setDate(date.getDate() - 7);
      from = date.toISOString().split('T')[0];
    } else if (dateRange === '30days') {
      const date = new Date(today);
      date.setDate(date.getDate() - 30);
      from = date.toISOString().split('T')[0];
    } else if (dateRange === '90days') {
      const date = new Date(today);
      date.setDate(date.getDate() - 90);
      from = date.toISOString().split('T')[0];
    } else {
      // custom
      from = startDate || to;
      const toDate = endDate || to;
      return { from, to: toDate };
    }

    return { from, to };
  }, [dateRange, startDate, endDate]);

  // Use dashboard for 7 days, custom report for other ranges
  const useDashboard = dateRange === '7days';
  const { data: dashboardData, isLoading: isLoadingDashboard } =
    useDashboardOverview();
  const { data: customReportData, isLoading: isLoadingCustomReport } =
    useCustomReport(dateRangeParams.from, dateRangeParams.to);
  const { data: paperUsageData } = usePaperUsage(
    dateRangeParams.from,
    dateRangeParams.to
  );

  const isLoadingReport = useDashboard
    ? isLoadingDashboard
    : isLoadingCustomReport;

  // Extract data from API responses
  const reportData = useDashboard
    ? dashboardData?.data?.data
    : customReportData?.data?.data;
  const paperUsage = paperUsageData?.data?.data || [];

  // Map API data to chart formats
  const mappedData = useMemo(() => {
    if (!reportData) {
      return {
        summary: {
          totalPrintJobs: 0,
          totalPagesPrinted: 0,
          totalRevenue: 0,
          averageJobsPerDay: 0,
          successRate: 0,
        },
        dailyJobTrends: [],
        dailyPageAnalytics: [],
        topActivePrinters: [],
        monthlyRevenueTrends: [],
        printStatusDistribution: [],
        colorModeDistribution: [],
        paperSizeDistribution: [],
      };
    }

    // Calculate days difference for both cases
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (new Date(dateRangeParams.to).getTime() -
          new Date(dateRangeParams.from).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    let totalJobs = 0;
    let completedJobs = 0;
    let failedJobs = 0;
    let cancelledJobs = 0;
    let totalPages = 0;
    let totalRevenue = 0;
    let bwPages = 0;
    let colorPages = 0;

    // Handle Dashboard response (different structure)
    if (useDashboard) {
      // Dashboard has direct fields, not nested in printJobStats/revenueStats
      totalJobs = (reportData as any).jobsThisMonth || 0;
      completedJobs = (reportData as any).completedJobsToday || 0;
      totalPages = (reportData as any).totalPagesThisMonth || 0;
      totalRevenue = (reportData as any).revenueThisMonth || 0;

      // Calculate failed/cancelled from dailyJobTrends if available
      const dailyJobTrends = (reportData as any).dailyJobTrends || [];
      if (dailyJobTrends.length > 0) {
        failedJobs = dailyJobTrends.reduce(
          (sum: number, item: any) => sum + (item.failedJobs || 0),
          0
        );
        cancelledJobs = dailyJobTrends.reduce(
          (sum: number, item: any) => sum + (item.cancelledJobs || 0),
          0
        );
        // Recalculate completedJobs from trends if available
        const completedFromTrends = dailyJobTrends.reduce(
          (sum: number, item: any) => sum + (item.completedJobs || 0),
          0
        );
        if (completedFromTrends > 0) {
          completedJobs = completedFromTrends;
        }
        // Recalculate totalJobs from trends
        const totalFromTrends = dailyJobTrends.reduce(
          (sum: number, item: any) => sum + (item.jobCount || 0),
          0
        );
        if (totalFromTrends > 0) {
          totalJobs = totalFromTrends;
        }
      }

      // Calculate color/BW pages from dailyPageAnalytics if available
      const dailyPageAnalytics = (reportData as any).dailyPageAnalytics || [];
      if (dailyPageAnalytics.length > 0) {
        colorPages = dailyPageAnalytics.reduce(
          (sum: number, item: any) => sum + (item.colorPages || 0),
          0
        );
        bwPages = dailyPageAnalytics.reduce(
          (sum: number, item: any) => sum + (item.bwPages || 0),
          0
        );
      }
    } else {
      // Handle Custom Report response (has nested printJobStats/revenueStats)
      const printJobStats = (reportData as any).printJobStats || {};
      const revenueStats = (reportData as any).revenueStats || {};

      totalJobs = printJobStats.totalJobs || 0;
      completedJobs = printJobStats.completedJobs || 0;
      failedJobs = printJobStats.failedJobs || 0;
      cancelledJobs = printJobStats.cancelledJobs || 0;
      totalPages = printJobStats.totalPages || 0;
      totalRevenue = revenueStats.totalRevenue || 0;
      bwPages = printJobStats.bwPages || 0;
      colorPages = printJobStats.colorPages || 0;
    }

    // Calculate summary metrics
    const averageJobsPerDay = Math.round(totalJobs / daysDiff);
    const successRate = totalJobs > 0 ? completedJobs / totalJobs : 0;

    // Get analytics fields (available in both response types)
    const dailyJobTrends = (reportData as any).dailyJobTrends || [];
    const dailyPageAnalytics = (reportData as any).dailyPageAnalytics || [];
    const topActivePrinters = (reportData as any).topActivePrinters || [];
    const monthlyRevenueTrends = (reportData as any).monthlyRevenueTrends || [];

    // Print status distribution
    const printStatusDistribution = [
      {
        name: t('charts.printStatusDistribution.labels.completed'),
        value: completedJobs,
        color: '#10b981',
      },
      {
        name: t('charts.printStatusDistribution.labels.failed'),
        value: failedJobs,
        color: '#ef4444',
      },
      {
        name: t('charts.printStatusDistribution.labels.queued'),
        value: cancelledJobs,
        color: '#64748b',
      },
    ];

    // Paper size distribution from paper usage API
    const paperSizeDistribution = paperUsage.map(item => ({
      size: item.sizeName,
      count: item.count,
      percentage: item.percentage,
    }));

    // Color mode distribution
    const colorModeDistribution = [
      {
        name: t('charts.colorModeDistribution.labels.blackWhite'),
        value: bwPages,
        color: '#1e293b',
      },
      {
        name: t('charts.colorModeDistribution.labels.color'),
        value: colorPages,
        color: '#3b82f6',
      },
      {
        name: t('charts.colorModeDistribution.labels.grayscale'),
        value: Math.max(0, totalPages - colorPages - bwPages),
        color: '#64748b',
      },
    ].filter(item => item.value > 0);

    // Check if range is more than 1 month for monthly revenue display
    const showMonthlyRevenue = daysDiff > 31;

    return {
      summary: {
        totalPrintJobs: totalJobs,
        totalPagesPrinted: totalPages,
        totalRevenue,
        averageJobsPerDay,
        successRate,
      },
      dailyJobTrends,
      dailyPageAnalytics,
      topActivePrinters,
      monthlyRevenueTrends: showMonthlyRevenue ? monthlyRevenueTrends : [],
      printStatusDistribution,
      colorModeDistribution,
      paperSizeDistribution,
    };
  }, [reportData, paperUsage, dateRangeParams, useDashboard, t]);

  if (isLoadingReport) {
    return <ReportsContentSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title={t('summary.totalPrintJobs')}
          useCountUp
          countUpValue={mappedData.summary.totalPrintJobs}
          caption={t('summary.caption.inSelectedPeriod')}
        />
        <SummaryCard
          title={t('summary.totalPagesPrinted')}
          useCountUp
          countUpValue={mappedData.summary.totalPagesPrinted}
          caption={t('summary.caption.includingColorAndBW')}
        />
        <SummaryCard
          title={t('summary.totalRevenue')}
          value={formatCurrency(mappedData.summary.totalRevenue)}
          caption={t('summary.caption.fromPagePurchases')}
        />
        <SummaryCard
          title={t('summary.averageJobsPerDay')}
          useCountUp
          countUpValue={mappedData.summary.averageJobsPerDay}
          caption={t('summary.caption.dailyAverage')}
        />
        <SummaryCard
          title={t('summary.successRate')}
          value={`${Math.round(mappedData.summary.successRate * 100)}%`}
          caption={t('summary.caption.completedOverTotal')}
          trend={{
            label: t('summary.trend.stable'),
            positive: mappedData.summary.successRate >= 0.9,
          }}
        />
      </div>

      {/* Filters and Report Management */}
      <div className="space-y-4">
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('filters.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <Select
                value={dateRange}
                onChange={e => setDateRange(e.target.value as typeof dateRange)}
                className="w-48"
              >
                <option value="7days">{t('filters.dateRanges.7days')}</option>
                <option value="30days">{t('filters.dateRanges.30days')}</option>
                <option value="90days">{t('filters.dateRanges.90days')}</option>
                <option value="custom">{t('filters.dateRanges.custom')}</option>
              </Select>
              {dateRange === 'custom' && (
                <>
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder={t('filters.fromDate')}
                    className="w-48"
                  />
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    placeholder={t('filters.toDate')}
                    className="w-48"
                    min={startDate || undefined}
                  />
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateRange('30days');
                  setStartDate('');
                  setEndDate('');
                }}
                disabled={isLoadingReport}
              >
                {t('filters.reset')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ReportManagement defaultView="generate" />
      </div>

      {/* Daily Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Job Trends */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('charts.dailyJobTrends.title')}
            </CardTitle>
            <CardDescription>
              {t('charts.dailyJobTrends.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DailyJobTrendsChart data={mappedData.dailyJobTrends} />
          </CardContent>
        </Card>

        {/* Daily Page Analytics */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('charts.dailyPageAnalytics.title')}
            </CardTitle>
            <CardDescription>
              {t('charts.dailyPageAnalytics.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DailyPageAnalyticsChart data={mappedData.dailyPageAnalytics} />
          </CardContent>
        </Card>
      </div>

      {/* Top Active Printers - Full Width */}
      {mappedData.topActivePrinters.length > 0 && (
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('charts.topActivePrinters.title')}
            </CardTitle>
            <CardDescription>
              {t('charts.topActivePrinters.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopActivePrintersChart data={mappedData.topActivePrinters} />
          </CardContent>
        </Card>
      )}

      {/* Monthly Revenue Trends - Conditional, Full Width */}
      {mappedData.monthlyRevenueTrends.length > 0 && (
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('charts.monthlyRevenueTrends.title')}
            </CardTitle>
            <CardDescription>
              {t('charts.monthlyRevenueTrends.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyRevenueTrendsChart data={mappedData.monthlyRevenueTrends} />
          </CardContent>
        </Card>
      )}

      {/* Distribution Charts - 2x2 Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Print Status Distribution - Pie Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('charts.printStatusDistribution.title')}
            </CardTitle>
            <CardDescription>
              {t('charts.printStatusDistribution.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mappedData.printStatusDistribution as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mappedData.printStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<PieTooltip t={t} />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Color Mode Distribution - Pie Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('charts.colorModeDistribution.title')}
            </CardTitle>
            <CardDescription>
              {t('charts.colorModeDistribution.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mappedData.colorModeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mappedData.colorModeDistribution as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mappedData.colorModeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieTooltip t={t} />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
                {t('charts.colorModeDistribution.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paper Size Distribution - Bar Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('charts.paperSizeDistribution.title')}
            </CardTitle>
            <CardDescription>
              {t('charts.paperSizeDistribution.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mappedData.paperSizeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mappedData.paperSizeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="size" tick={{ fill: '#64748b' }} />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    formatter={(value: number, name: string) => {
                      if (name === 'percentage') return `${value}%`;
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    name={t('charts.paperSizeDistribution.legend.count')}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
                {t('charts.paperSizeDistribution.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsContent;
