'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { subscribeStomp } from '@/lib/api/ws';
import { PaymentStatusResponse } from '@/types/api';
import { usePrintJobStatus } from '@/app/[locale]/student/print/api';

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
  const t = useTranslations('student.print.printPaymentModal');
  const locale = useLocale();
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
      onFailure(t('paymentExpired'));
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
            nextStatus === 'expired' ? t('paymentExpired') : t('paymentFailed')
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
    pending: t('waiting'),
    completed: t('completed'),
    cancelled: t('cancelled'),
    expired: t('expired'),
    failed: t('failed'),
  };

  const showPollingBadge = connectionState === 'error';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="lg">
      <div className="space-y-4 p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-1 flex-col items-center gap-3">
            <div className="dark:bg-background/5 rounded-xl border border-border bg-background p-4 dark:border-border">
              {payment.qrUrl ? (
                <img
                  src={payment.qrUrl}
                  alt="QR Code"
                  className="h-64 w-64 object-contain"
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center text-sm text-muted-foreground dark:text-muted-foreground">
                  {t('noQRCode')}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              {t('scanQR')}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div className="dark:bg-muted/5 rounded-lg border border-border bg-muted p-4 dark:border-border">
              <p className="text-xs uppercase text-muted-foreground dark:text-muted-foreground">
                {t('amount')}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground dark:text-foreground">
                {payment.amount.toLocaleString(
                  locale === 'vi' ? 'vi-VN' : 'en-US'
                )}{' '}
                {t('currency')}
              </p>
            </div>
            <div className="dark:bg-muted/5 rounded-lg border border-border bg-muted p-4 dark:border-border">
              <p className="text-xs uppercase text-muted-foreground dark:text-muted-foreground">
                {t('transferContent')}
              </p>
              <p className="mt-1 font-mono text-sm text-foreground dark:text-foreground">
                {payment.transferContent || payment.paymentCode || t('noCode')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 dark:bg-background/5 rounded-lg border border-border p-3 shadow-sm dark:border-border">
                <p className="text-xs uppercase text-muted-foreground dark:text-muted-foreground">
                  {t('status')}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground dark:text-foreground">
                  {statusLabelMap[status]}
                </p>
              </div>
              <div className="bg-background/50 dark:bg-background/5 rounded-lg border border-border p-3 shadow-sm dark:border-border">
                <p className="text-xs uppercase text-muted-foreground dark:text-muted-foreground">
                  {t('connection')}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground dark:text-foreground">
                  {connectionState === 'connected'
                    ? t('realtime')
                    : connectionState === 'connecting'
                      ? t('connecting')
                      : t('polling')}
                </p>
              </div>
            </div>
            {remainingSeconds !== null && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                {t('expiresIn')}:{' '}
                <span className="font-semibold">
                  {Math.floor(remainingSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(remainingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {showPollingBadge && (
              <div className="dark:bg-muted/5 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground dark:border-border dark:text-muted-foreground">
                {t('connectionLost')}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
