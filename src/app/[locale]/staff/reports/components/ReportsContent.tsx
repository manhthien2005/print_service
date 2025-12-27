'use client';

import React, { useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
  XAxis,
  YAxis,
  Area,
  AreaChart,
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
import {
  useCustomReport,
  usePaperUsage,
} from '@/lib/api/services/staffReports';

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

const PieTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
      <p className="mb-1 font-semibold text-slate-900 dark:text-white">
        {item.name}
      </p>
      <p className="text-slate-700 dark:text-white/80">
        Số lượng: <span className="font-semibold">{item.value}</span>
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

  // Fetch data from API
  const { data: customReportData, isLoading: isLoadingReport } =
    useCustomReport(dateRangeParams.from, dateRangeParams.to);
  const { data: paperUsageData } = usePaperUsage(
    dateRangeParams.from,
    dateRangeParams.to
  );

  // Extract data from API responses
  const reportData = customReportData?.data?.data;
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
        printJobsByDate: [],
        printStatusDistribution: [],
        pagesPrintedByDate: [],
        revenueByMonth: [],
        topPrinters: [],
        colorModeDistribution: [],
        paperSizeDistribution: [],
      };
    }

    const printJobStats = reportData.printJobStats || {};
    const revenueStats = reportData.revenueStats || {};

    // Calculate summary
    const totalJobs = printJobStats.totalJobs || 0;
    const completedJobs = printJobStats.completedJobs || 0;
    const totalPages = printJobStats.totalPages || 0;
    const totalRevenue = revenueStats.totalRevenue || 0;
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (new Date(dateRangeParams.to).getTime() -
          new Date(dateRangeParams.from).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const averageJobsPerDay = Math.round(totalJobs / daysDiff);
    const successRate = totalJobs > 0 ? completedJobs / totalJobs : 0;

    // Print status distribution
    const printStatusDistribution = [
      {
        name: 'Hoàn tất',
        value: completedJobs,
        color: '#10b981',
      },
      {
        name: 'Thất bại',
        value: printJobStats.failedJobs || 0,
        color: '#ef4444',
      },
      {
        name: 'Đang chờ',
        value: printJobStats.cancelledJobs || 0,
        color: '#64748b',
      },
    ];

    // Paper size distribution from paper usage API
    const paperSizeDistribution = paperUsage.map(item => ({
      size: item.sizeName,
      count: item.count,
      percentage: item.percentage,
    }));

    // Color mode distribution (if available from API)
    const colorModeDistribution = [
      {
        name: 'Đen trắng',
        value: printJobStats.bwPages || 0,
        color: '#1e293b',
      },
      {
        name: 'In màu',
        value: printJobStats.colorPages || 0,
        color: '#3b82f6',
      },
      {
        name: 'In xám',
        value:
          (printJobStats.totalPages || 0) -
          (printJobStats.colorPages || 0) -
          (printJobStats.bwPages || 0),
        color: '#64748b',
      },
    ].filter(item => item.value > 0);

    // Note: Daily breakdowns (printJobsByDate, pagesPrintedByDate) are not available
    // from the custom report API. These would need to be calculated from print job history
    // or provided by a separate endpoint. For now, we'll show empty arrays.

    return {
      summary: {
        totalPrintJobs: totalJobs,
        totalPagesPrinted: totalPages,
        totalRevenue,
        averageJobsPerDay,
        successRate,
      },
      printJobsByDate: reportData.printJobsByDate || [],
      printStatusDistribution,
      pagesPrintedByDate: reportData.pagesPrintedByDate || [],
      revenueByMonth: reportData.revenueByMonth || [],
      topPrinters: reportData.topPrinters || [],
      colorModeDistribution,
      paperSizeDistribution,
    };
  }, [reportData, paperUsage, dateRangeParams]);

  const COLORS = {
    completed: '#10b981',
    failed: '#ef4444',
    queued: '#64748b',
    color: '#3b82f6',
    grayscale: '#64748b',
    blackWhite: '#1e293b',
  };

  if (isLoadingReport) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 text-lg text-slate-600 dark:text-white/70">
            Đang tải dữ liệu báo cáo...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Tổng công việc in"
          useCountUp
          countUpValue={mappedData.summary.totalPrintJobs}
          caption="Trong khoảng thời gian đã chọn"
        />
        <SummaryCard
          title="Tổng trang đã in"
          useCountUp
          countUpValue={mappedData.summary.totalPagesPrinted}
          caption="Bao gồm màu và đen trắng"
        />
        <SummaryCard
          title="Tổng doanh thu"
          value={formatCurrency(mappedData.summary.totalRevenue)}
          caption="Từ mua trang in"
        />
        <SummaryCard
          title="TB công việc/ngày"
          useCountUp
          countUpValue={mappedData.summary.averageJobsPerDay}
          caption="Trung bình hàng ngày"
        />
        <SummaryCard
          title="Tỷ lệ thành công"
          value={`${Math.round(mappedData.summary.successRate * 100)}%`}
          caption="Hoàn tất / Tổng số"
          trend={{
            label: 'Ổn định',
            positive: mappedData.summary.successRate >= 0.9,
          }}
        />
      </div>

      {/* Filters */}
      <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Bộ lọc thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as typeof dateRange)}
              className="w-48"
            >
              <option value="7days">7 ngày gần nhất</option>
              <option value="30days">30 ngày gần nhất</option>
              <option value="90days">90 ngày gần nhất</option>
              <option value="custom">Tùy chỉnh</option>
            </Select>
            {dateRange === 'custom' && (
              <>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Từ ngày"
                  className="w-48"
                />
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Đến ngày"
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
              Đặt lại
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Print Jobs by Date - Line Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Công việc in theo ngày
            </CardTitle>
            <CardDescription>
              Xu hướng công việc in trong khoảng thời gian
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mappedData.printJobsByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mappedData.printJobsByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b' }}
                    tickFormatter={value => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={COLORS.completed}
                    strokeWidth={2}
                    name="Hoàn tất"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke={COLORS.failed}
                    strokeWidth={2}
                    name="Thất bại"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="queued"
                    stroke={COLORS.queued}
                    strokeWidth={2}
                    name="Đang chờ"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
                Dữ liệu chi tiết theo ngày không khả dụng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print Status Distribution - Pie Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Phân bố trạng thái in
            </CardTitle>
            <CardDescription>Tỷ lệ các trạng thái công việc in</CardDescription>
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
                <RechartsTooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pages Printed by Date - Area Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Số trang in theo ngày
            </CardTitle>
            <CardDescription>
              Phân tích số trang in màu và đen trắng
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mappedData.pagesPrintedByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mappedData.pagesPrintedByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b' }}
                    tickFormatter={value => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="colorPages"
                    stackId="1"
                    stroke={COLORS.color}
                    fill={COLORS.color}
                    name="Trang màu"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="blackWhitePages"
                    stackId="1"
                    stroke={COLORS.blackWhite}
                    fill={COLORS.blackWhite}
                    name="Trang đen trắng"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
                Dữ liệu chi tiết theo ngày không khả dụng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Month - Bar Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Doanh thu theo tháng
            </CardTitle>
            <CardDescription>
              Xu hướng doanh thu từ mua trang in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mappedData.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mappedData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                  <YAxis
                    tick={{ fill: '#64748b' }}
                    tickFormatter={value => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    name="Doanh thu (VND)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
                Dữ liệu doanh thu theo tháng không khả dụng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Printers - Bar Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Top máy in hoạt động
            </CardTitle>
            <CardDescription>5 máy in có nhiều công việc nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {mappedData.topPrinters.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mappedData.topPrinters} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: '#64748b' }} />
                  <YAxis
                    dataKey="printerName"
                    type="category"
                    width={200}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="totalJobs"
                    fill="#10b981"
                    name="Số công việc"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
                Dữ liệu top máy in không khả dụng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Color Mode Distribution - Pie Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Phân bố chế độ màu
            </CardTitle>
            <CardDescription>Tỷ lệ sử dụng các chế độ in</CardDescription>
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
                  <RechartsTooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
                Dữ liệu phân bố chế độ màu không khả dụng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paper Size Distribution - Bar Chart */}
        <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Phân bố khổ giấy
            </CardTitle>
            <CardDescription>Sử dụng các khổ giấy khác nhau</CardDescription>
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
                    name="Số lượng"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-white/60">
                Dữ liệu phân bố khổ giấy không khả dụng
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsContent;
