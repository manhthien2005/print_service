'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useCancelPrintJob } from '../api';
import { usePrintJobProgressData } from '../hooks/usePrintJobProgressData';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';
import { printHistoryKeys } from '@/lib/api/services/student';

interface PrintJobProgressProps {
  jobId: string;
  onComplete?: () => void;
}

export function PrintJobProgress({ jobId, onComplete }: PrintJobProgressProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'vi';
  const queryClient = useQueryClient();

  const { progress, isLoading, error } = usePrintJobProgressData(jobId, true);
  const cancelJobMutation = useCancelPrintJob();

  // Navigate to history when completed and invalidate queries
  useEffect(() => {
    if (progress?.printStatus === 'completed') {
      toast.success('In thành công!');

      // Invalidate print history queries để cập nhật dữ liệu
      queryClient.invalidateQueries({
        queryKey: printHistoryKeys.all,
      });

      if (onComplete) {
        onComplete();
      } else {
        // Navigate to print history after a short delay
        setTimeout(() => {
          router.push(`/${locale}/student/history`);
        }, 2000);
      }
    } else if (progress?.printStatus === 'failed') {
      toast.error('In thất bại. Vui lòng thử lại.');

      // Invalidate print history queries khi failed
      queryClient.invalidateQueries({
        queryKey: printHistoryKeys.all,
      });
    } else if (progress?.printStatus === 'cancelled') {
      toast.info('Đã hủy print job.');

      // Invalidate print history queries khi cancelled
      queryClient.invalidateQueries({
        queryKey: printHistoryKeys.all,
      });

      if (onComplete) {
        onComplete();
      }
    }
  }, [progress?.printStatus, onComplete, router, locale, queryClient]);

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy print job này?')) {
      return;
    }

    try {
      await cancelJobMutation.mutateAsync(jobId);
      toast.success(
        'Đã hủy print job thành công. Số tiền sẽ được hoàn lại vào tài khoản.'
      );
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Có lỗi xảy ra khi hủy print job.';
      toast.error(errorMessage);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'queued':
        return 'Đang chờ trong hàng đợi';
      case 'printing':
        return 'Đang in';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'failed':
        return 'Thất bại';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'printing':
        return 'text-blue-600 dark:text-blue-400';
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (isLoading && !progress) {
    return (
      <Card className="border-slate-200/70 bg-white/80 shadow-lg dark:border-white/10 dark:bg-white/5">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-4 text-sm text-slate-600 dark:text-white/70">
              Đang tải thông tin print job...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !progress) {
    return (
      <Card className="border-slate-200/70 bg-white/80 shadow-lg dark:border-white/10 dark:bg-white/5">
        <CardContent className="p-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-sm text-red-600 dark:text-red-400">
              {(error as any)?.response?.data?.message ||
                (error as any)?.message ||
                'Có lỗi xảy ra khi tải thông tin print job. Vui lòng thử lại.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-lg dark:border-white/10 dark:bg-white/5">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Theo dõi tiến trình in
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
              Job ID: {jobId}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'text-lg font-semibold',
                getStatusColor(progress.printStatus)
              )}
            >
              {getStatusLabel(progress.printStatus)}
            </span>
            {progress.printStatus === 'printing' && (
              <svg
                className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </div>

          {/* Progress Bar */}
          {progress.printStatus === 'printing' ||
          progress.printStatus === 'queued' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-white/70">
                  Tiến trình: {progress.progress.printedPages} /{' '}
                  {progress.progress.totalPages} trang
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {progress.progress.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress.progress.percentage}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* Queue Info */}
          {progress.printStatus === 'queued' &&
            progress.queueInfo.positionInQueue > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/30 dark:bg-yellow-500/10">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Vị trí trong hàng đợi:{' '}
                  {progress.queueInfo.positionInQueue + 1}
                  {progress.queueInfo.jobsAhead > 0 &&
                    ` (${progress.queueInfo.jobsAhead} job phía trước)`}
                </p>
                {progress.timing.estimatedCompletionTime && (
                  <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                    Thời gian ước tính hoàn thành:{' '}
                    {new Date(
                      progress.timing.estimatedCompletionTime
                    ).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            )}

          {/* Timing Info */}
          {progress.timing.startTime && (
            <div className="space-y-2 text-sm text-slate-600 dark:text-white/70">
              <div className="flex justify-between">
                <span>Thời gian bắt đầu:</span>
                <span className="font-medium">
                  {new Date(progress.timing.startTime).toLocaleString('vi-VN')}
                </span>
              </div>
              {progress.timing.estimatedCompletionTime && (
                <div className="flex justify-between">
                  <span>Thời gian ước tính hoàn thành:</span>
                  <span className="font-medium">
                    {new Date(
                      progress.timing.estimatedCompletionTime
                    ).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
              {progress.printStatus === 'printing' && (
                <div className="flex justify-between">
                  <span>Đã trôi qua:</span>
                  <span className="font-medium">
                    {progress.timing.elapsedMinutes} phút{' '}
                    {progress.timing.elapsedSeconds % 60} giây
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Printer Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Máy in: {progress.printer.printerName}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
              Vị trí: {progress.printer.location}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
              Trạng thái: {progress.printer.status}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {progress.printStatus === 'queued' && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelJobMutation.isPending}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                {cancelJobMutation.isPending ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang hủy...
                  </>
                ) : (
                  'Hủy Print Job'
                )}
              </Button>
            )}
            {(progress.printStatus === 'completed' ||
              progress.printStatus === 'failed' ||
              progress.printStatus === 'cancelled') && (
              <Button
                onClick={() => router.push(`/${locale}/student/history`)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Xem Lịch Sử In
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
