'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { subscribeStomp } from '@/lib/api/ws';
import { PaymentStatusResponse } from '@/types/api';
import { usePrintJobStatus } from '../api';

type PaymentState =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'failed';

interface PrintPaymentModalProps {
  isOpen: boolean;
  payment: {
    jobId: string;
    paymentId: string;
    amount: number;
    qrUrl?: string;
    transferContent?: string;
    paymentCode?: string;
    expiredAt?: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
  onFailure: (reason?: string) => void;
}

interface WebSocketMessage<T = unknown> {
  type?: string;
  data?: T;
  timestamp?: string;
}

export function PrintPaymentModal({
  isOpen,
  payment,
  onClose,
  onSuccess,
  onFailure,
}: PrintPaymentModalProps) {
  const [status, setStatus] = useState<PaymentState>('pending');
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'error'
  >('connecting');
  const [resolved, setResolved] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Fallback polling using print job status
  const { data: jobStatusData } = usePrintJobStatus(payment?.jobId ?? null, {
    enabled: isOpen && !!payment && status === 'pending',
    refetchInterval: status === 'pending' ? 5000 : false,
  });

  const expirationMs = useMemo(() => {
    if (!payment?.expiredAt) return null;
    return new Date(payment.expiredAt).getTime();
  }, [payment?.expiredAt]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !expirationMs) {
      setRemainingSeconds(null);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expirationMs - now) / 1000));
      setRemainingSeconds(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expirationMs, isOpen]);

  useEffect(() => {
    if (
      status === 'pending' &&
      remainingSeconds !== null &&
      remainingSeconds <= 0 &&
      !resolved
    ) {
      setStatus('expired');
      setResolved(true);
      onFailure('Thanh toán đã hết hạn. Vui lòng thử lại.');
    }
  }, [remainingSeconds, status, resolved, onFailure]);

  // Handle WebSocket subscription
  useEffect(() => {
    if (!isOpen || !payment) return;

    const cleanup = subscribeStomp<WebSocketMessage<PaymentStatusResponse>>({
      topic: `/topic/print-jobs/${payment.jobId}/payment-status`,
      sendDestination: `/app/print-jobs/${payment.jobId}/payment/subscribe`,
      debugLabel: 'print-payment',
      onStateChange: setConnectionState,
      onMessage: payload => {
        const wsData =
          payload?.data ?? (payload as unknown as PaymentStatusResponse);
        if (!wsData?.paymentStatus) return;

        const nextStatus = wsData.paymentStatus as PaymentState;
        setStatus(nextStatus);

        if (resolved) return;
        if (nextStatus === 'completed') {
          setResolved(true);
          onSuccess();
        } else if (
          nextStatus === 'cancelled' ||
          nextStatus === 'expired' ||
          nextStatus === 'failed'
        ) {
          setResolved(true);
          onFailure(
            nextStatus === 'expired'
              ? 'Thanh toán đã hết hạn. Vui lòng thử lại.'
              : 'Thanh toán không thành công.'
          );
        }
      },
      onError: err => {
        setConnectionState('error');
        if (process.env.NODE_ENV === 'development') {
          console.error('WS payment error', err);
        }
      },
    });

    return () => {
      cleanup();
      setConnectionState('connecting');
      setStatus('pending');
      setResolved(false);
    };
  }, [isOpen, payment, resolved, onFailure, onSuccess]);

  // Polling fallback: when print job status transitions away from pending_payment
  useEffect(() => {
    if (!isOpen || resolved || status !== 'pending') return;
    const printStatus = jobStatusData?.data?.data?.printStatus;
    if (printStatus && printStatus !== 'pending_payment') {
      setResolved(true);
      setStatus('completed');
      onSuccess();
    }
  }, [jobStatusData, status, isOpen, resolved, onSuccess]);

  useEffect(() => {
    if (!isOpen) {
      setResolved(false);
      setStatus('pending');
      setRemainingSeconds(null);
    }
  }, [isOpen]);

  if (!payment) return null;

  const statusLabelMap: Record<PaymentState, string> = {
    pending: 'Đang chờ thanh toán',
    completed: 'Đã thanh toán',
    cancelled: 'Đã hủy',
    expired: 'Hết hạn',
    failed: 'Thất bại',
  };

  const showPollingBadge = connectionState === 'error';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thanh toán QR" size="lg">
      <div className="space-y-4 p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-1 flex-col items-center gap-3">
            <div className="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              {payment.qrUrl ? (
                <img
                  src={payment.qrUrl}
                  alt="QR Code"
                  className="h-64 w-64 object-contain"
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center text-sm text-slate-500 dark:text-white/60">
                  Không có QR code
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-white/70">
              Quét mã QR để thanh toán
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase text-slate-500 dark:text-white/50">
                Số tiền
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {payment.amount.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase text-slate-500 dark:text-white/50">
                Nội dung chuyển khoản
              </p>
              <p className="mt-1 font-mono text-sm text-slate-900 dark:text-white">
                {payment.transferContent ||
                  payment.paymentCode ||
                  'Không có mã'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200/70 bg-white/50 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Trạng thái
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {statusLabelMap[status]}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-white/50 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Kết nối
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {connectionState === 'connected'
                    ? 'Realtime'
                    : connectionState === 'connecting'
                      ? 'Đang kết nối...'
                      : 'Đang dùng polling'}
                </p>
              </div>
            </div>
            {remainingSeconds !== null && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                Hết hạn sau:{' '}
                <span className="font-semibold">
                  {Math.floor(remainingSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(remainingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {showPollingBadge && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                Mất kết nối realtime, đang chuyển sang kiểm tra định kỳ.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
