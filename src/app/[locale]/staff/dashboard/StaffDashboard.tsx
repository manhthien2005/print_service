'use client';

import Link from 'next/link';
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
  alerts,
  paperSizeUsage,
  printerStatusSummary,
  statWidgets,
  weeklyPrintingActivity,
  type Trend,
} from '@/data/staffDashboardMock';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import CountUp from '@/components/ui/CountUp';
import { cn } from '@/lib/utils/cn';

interface StaffDashboardProps {
  locale: string;
  t: any;
}

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
  }>;
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
      <p className="font-semibold text-white/90">{label}</p>
      {payload.map(item => (
        <p key={item.name} className="flex items-center gap-2">
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
    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
      <p className="font-semibold text-white/90">{item.name}</p>
      <p className="text-white/80">Tỉ lệ: {item.value}%</p>
    </div>
  );
};

const TrendBadge = ({ trend, change }: { trend: Trend; change: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
      trend === 'up' && 'bg-emerald-500/15 text-emerald-300',
      trend === 'down' && 'bg-rose-500/15 text-rose-300',
      trend === 'flat' && 'bg-amber-500/15 text-amber-200'
    )}
  >
    <span aria-hidden>●</span>
    {change}
  </span>
);

const ProgressBar = ({ value, label }: { value: number; label?: string }) => (
  <div>
    <div className="mb-2 flex items-center justify-between text-sm text-white/70">
      <span>{label ?? 'Utilization'}</span>
      <span className="font-semibold text-white">{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default function StaffDashboard({ locale, t }: StaffDashboardProps) {
  const staff = t.staff ?? {};
  const withLocale = (path: string) =>
    `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
  const totalPrinters =
    printerStatusSummary.online +
    printerStatusSummary.offline +
    printerStatusSummary.maintenance;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">
          {staff.sectionLabel ?? 'Staff dashboard'}
        </p>
        <h1 className="text-4xl font-bold text-white">{t.title}</h1>
        <p className="text-white/70">{t.welcome}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        {statWidgets.map(stat => (
          <Card
            key={stat.id}
            className="border-white/10 bg-white/5 backdrop-blur-md"
          >
            <CardHeader className="pb-3">
              <CardDescription className="text-base font-medium text-white/80">
                {staff.stats?.[stat.id] ?? stat.id}
              </CardDescription>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-end gap-2 text-3xl font-semibold leading-tight text-white">
                  <CountUp
                    to={stat.value}
                    className="leading-none"
                    separator=","
                  />
                  {stat.suffix && (
                    <span className="text-lg font-medium text-white/80">
                      {stat.suffix}
                    </span>
                  )}
                </div>
                {stat.change && (
                  <TrendBadge trend={stat.trend} change={stat.change} />
                )}
              </div>
              {stat.captionKey && (
                <p className="text-sm text-white/65">
                  {staff.stats?.caption?.[stat.captionKey]?.replace
                    ? staff.stats.caption[stat.captionKey].replace(
                        '{total}',
                        totalPrinters.toString()
                      )
                    : staff.stats?.caption?.[stat.captionKey]}
                </p>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-white/10 bg-white/5 backdrop-blur xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">{staff.weekly?.title}</CardTitle>
            <CardDescription className="text-white/70">
              {staff.weekly?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyPrintingActivity}
                barSize={18}
                tabIndex={-1}
                style={{ outline: 'none' }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#334155" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ color: '#cbd5e1' }}
                />
                <Bar
                  dataKey="jobs"
                  name={staff.weekly?.jobs}
                  radius={[6, 6, 0, 0]}
                  fill="url(#jobsGradient)"
                />
                <Bar
                  dataKey="pages"
                  name={staff.weekly?.pages}
                  radius={[6, 6, 0, 0]}
                  fill="url(#pagesGradient)"
                />
                <defs>
                  <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient
                    id="pagesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">{staff.paper?.title}</CardTitle>
            <CardDescription className="text-white/70">
              {staff.paper?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] select-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart tabIndex={-1} style={{ outline: 'none' }}>
                <Pie
                  data={
                    paperSizeUsage as Array<{
                      name: string;
                      value: number;
                      color: string;
                    }>
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={6}
                >
                  {paperSizeUsage.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: '#cbd5e1' }}
                />
                <RechartsTooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="h-full border-white/10 bg-white/5 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-semibold text-white">
              {staff.printer?.title}
            </CardTitle>
            <CardDescription className="text-white/70">
              {staff.printer?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-sm text-white/70">
                  {staff.printer?.online ?? 'Online'}
                </p>
                <p className="text-2xl font-semibold text-emerald-300">
                  <CountUp to={printerStatusSummary.online} />
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-sm text-white/70">
                  {staff.printer?.offline ?? 'Offline'}
                </p>
                <p className="text-2xl font-semibold text-rose-300">
                  <CountUp to={printerStatusSummary.offline} />
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-sm text-white/70">
                  {staff.printer?.maintenance ?? 'Maintenance'}
                </p>
                <p className="text-2xl font-semibold text-amber-200">
                  <CountUp to={printerStatusSummary.maintenance} />
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-sm text-white/70">
                  {staff.printer?.utilization ?? 'Utilization'}
                </p>
                <p className="text-2xl font-semibold">
                  <CountUp to={printerStatusSummary.utilization} />%
                </p>
              </div>
            </div>

            <ProgressBar
              value={printerStatusSummary.utilization}
              label={staff.printer?.utilizationLabel ?? 'System utilization'}
            />

            <Link href={withLocale('/staff/manage-printers')}>
              <Button
                className="mt-2 w-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
                size="lg"
              >
                {staff.printer?.cta ?? 'Go to printers'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">{staff.alerts?.title}</CardTitle>
            <CardDescription className="text-white/70">
              {staff.alerts?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 2).map(alert => {
              const copy = staff.alerts?.items?.[alert.id];
              const severityLabel = staff.alerts?.severity?.[alert.severity];
              return (
                <div
                  key={alert.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-white"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{copy?.title}</p>
                    <span
                      className={cn(
                        'flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase',
                        alert.severity === 'critical' &&
                          'border border-rose-400/20 bg-rose-500/15 text-rose-300',
                        alert.severity === 'warning' &&
                          'border border-amber-400/20 bg-amber-500/15 text-amber-200',
                        alert.severity === 'info' &&
                          'border border-sky-400/20 bg-sky-500/15 text-sky-200'
                      )}
                    >
                      {severityLabel ?? alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">{copy?.time}</p>
                  {copy?.action && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 bg-white/10 text-white"
                    >
                      {copy.action}
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
