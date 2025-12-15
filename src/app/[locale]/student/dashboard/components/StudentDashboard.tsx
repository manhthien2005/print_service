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
import GradientText from '@/components/ui/GradientText';
import { cn } from '@/lib/utils/cn';
import {
  studentHighlightsMock,
  studentProfileSummaryMock,
  studentQuickActionsMock,
  studentRecentPrintsMock,
  studentStatsMock,
} from '@/data/studentDashboardMock';
import { STATUS_STYLES } from '../constants';

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
        <div className="grid items-start gap-6 xl:grid-cols-[1.6fr,1fr]">
          {/* Cột trái: Khối số dư */}
          <div className="space-y-4">
            {/* Card số dư A4 */}
            <Card className="relative overflow-hidden border-slate-200/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-lg backdrop-blur dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/0">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
              <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/20" />
              <CardContent className="relative p-6">
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
                      {studentProfileSummaryMock.fullName}
                    </GradientText>
                  </h2>
                </div>

                {/* Grid 2 cột */}
                <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
                  {/* Cột trái: Số dư tiền + Công việc tháng này, Trang đã in */}
                  <div className="flex flex-col space-y-4">
                    {/* Số dư tiền */}
                    <div className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm font-medium text-slate-500 dark:text-white/70">
                        {studentCopy.balance?.title ?? 'Số dư tiền'}
                      </p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                          <CountUp to={studentStatsMock.balance} />
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
                            <CountUp to={studentStatsMock.jobsThisMonth} />
                          </span>
                        </div>
                        {studentStatsMock.jobsChangePercent !== 0 && (
                          <p
                            className={`mt-2 text-xs ${studentStatsMock.jobsChangePercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                          >
                            {studentStatsMock.jobsChangePercent > 0 ? '+' : ''}
                            {studentStatsMock.jobsChangePercent}% so với tháng
                            trước
                          </p>
                        )}
                      </div>

                      <div className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <p className="text-sm font-medium text-slate-500 dark:text-white/70">
                          {studentCopy.stats?.pagesThisMonth ?? 'Trang đã in'}
                        </p>
                        <div className="mt-2 flex items-end gap-2">
                          <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                            <CountUp to={studentStatsMock.pagesThisMonth} />
                          </span>
                          <span className="text-sm text-slate-500 dark:text-white/70">
                            A4
                          </span>
                        </div>
                        {studentStatsMock.pagesChangePercent !== 0 && (
                          <p
                            className={`mt-2 text-xs ${studentStatsMock.pagesChangePercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                          >
                            {studentStatsMock.pagesChangePercent > 0 ? '+' : ''}
                            {studentStatsMock.pagesChangePercent}% so với tháng
                            trước
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Số dư tặng + Số dư nạp + Hạn mức được tặng mỗi tháng */}
                  <div className="flex flex-col space-y-4">
                    {/* Số dư tặng */}
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="mb-1 text-xs text-slate-500 dark:text-white/60">
                        {studentCopy.gifted?.title ?? 'Số dư tặng'}
                      </p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                          <CountUp
                            to={
                              studentStatsMock.giftedQuotaTotal -
                              studentStatsMock.giftedQuotaUsed
                            }
                          />
                        </span>
                        <span className="text-xs text-slate-500 dark:text-white/70">
                          / {studentStatsMock.giftedQuotaTotal} A4
                        </span>
                      </div>
                    </div>

                    {/* Số dư nạp */}
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="mb-1 text-xs text-slate-500 dark:text-white/60">
                        {studentCopy.topup?.label ?? 'Số dư nạp'}
                      </p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                          <CountUp to={studentStatsMock.topupBalance} />
                        </span>
                        <span className="text-xs text-slate-500 dark:text-white/70">
                          ₫
                        </span>
                      </div>
                    </div>

                    {/* Hạn mức được tặng mỗi tháng */}
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {studentCopy.gifted?.title ??
                              'Hạn mức được tặng mỗi tháng'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-white/60">
                            {studentCopy.gifted?.subtitle ??
                              '150 trang A4 / tháng, dùng hết sẽ dùng tới số dư nạp.'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-white/70">
                              {studentCopy.gifted?.usedLabel ?? 'Đã dùng'}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {studentStatsMock.giftedQuotaUsed} /{' '}
                              {studentStatsMock.giftedQuotaTotal} A4
                            </span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 via-70% to-rose-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round(
                                    (studentStatsMock.giftedQuotaUsed /
                                      studentStatsMock.giftedQuotaTotal) *
                                      100
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
                            <span>
                              {studentCopy.gifted?.remainingLabel ?? 'Còn lại'}:{' '}
                              {studentStatsMock.giftedQuotaTotal -
                                studentStatsMock.giftedQuotaUsed}{' '}
                              A4
                            </span>
                            <span>
                              {studentCopy.gifted?.resetLabel
                                ? studentCopy.gifted.resetLabel.replace(
                                    '{date}',
                                    studentStatsMock.quotaReset
                                  )
                                : `Làm mới ${studentStatsMock.quotaReset}`}
                            </span>
                          </div>
                        </div>
                      </div>
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
              {studentHighlightsMock.map(item => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <p className="font-semibold">{item.title}</p>
                  {item.id === 'quota' && Array.isArray(item.description) ? (
                    <ul className="mt-1 space-y-1 text-slate-600 dark:text-white/70">
                      {item.description.map(line => (
                        <li key={line} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-white/60" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-600 dark:text-white/70">
                      {Array.isArray(item.description)
                        ? item.description.join(', ')
                        : item.description}
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
              {studentRecentPrintsMock.slice(0, 5).map(item => {
                const statusKey = item.status ?? 'completed';
                const status =
                  STATUS_STYLES[statusKey] ?? STATUS_STYLES.completed;
                const statusLabel =
                  (statusCopy && statusCopy[statusKey]) ?? statusKey;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-slate-200/70 px-3 py-3 transition hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
                  >
                    <FileIcon
                      fileName={item.fileName}
                      size={48}
                      className="shrink-0"
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.fileName}
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
                        {item.printer} • {item.size}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
                        <span>
                          {studentCopy.recent?.pagesLabel
                            ? studentCopy.recent.pagesLabel.replace(
                                '{pages}',
                                item.pagesUsedA4.toString()
                              )
                            : `${item.pagesUsedA4} A4`}
                        </span>
                        <span>{item.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

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
