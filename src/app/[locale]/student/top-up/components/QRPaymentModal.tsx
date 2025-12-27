'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCurrentDeposit } from '@/lib/api/services/payment';
import { PAYMENT_CONSTANTS } from '../constants';
import type {
  DepositResponse,
  DepositBonusPackageResponse,
  DepositStatusResponse,
} from '@/types/api';
import { subscribeStomp } from '@/lib/api/ws';

interface QRPaymentModalProps {
  isOpen: boolean;
  deposit: DepositResponse | null;
  selectedPackage?: DepositBonusPackageResponse | null;
  onClose: () => void;
  onCancel: (depositId: string) => void;
  onSuccess: (amount: number) => void;
  t: {
    qrModal: {
      title: string;
      transferContent: string;
      amount: string;
      expiresIn: string;
      cancelOrder: string;
      expired: string;
      reused: string;
      newOrder: string;
      scanQR: string;
      copyContent: string;
      copied: string;
      instructions: string;
      step1: string;
      step2: string;
      step3: string;
      step4: string;
      packageName?: string;
      packageInfo?: string;
      bonusAmount?: string;
      totalReceived?: string;
    };
    packages: {
      packageName: string;
      bonusAmount: string;
      totalReceived: string;
    };
  };
}

export function QRPaymentModal({
  isOpen,
  deposit,
  selectedPackage,
  onClose,
  onCancel,
  onSuccess,
  t,
}: QRPaymentModalProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'error'
  >('connecting');

  // Polling for status updates
  const { data: currentDepositData } = useCurrentDeposit({
    enabled: isOpen && deposit?.status === 'pending' && !isExpired,
    refetchInterval:
      isOpen && deposit?.status === 'pending' && !isExpired
        ? PAYMENT_CONSTANTS.POLLING_INTERVAL
        : false,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update countdown timer - real-time countdown with server time sync
  useEffect(() => {
    if (!deposit || !isOpen) {
      setRemainingTime(0);
      setIsExpired(false);
      return;
    }

    // If status is already expired, don't calculate timer
    if (deposit.status === 'expired') {
      setRemainingTime(0);
      setIsExpired(true);
      return;
    }

    // Only calculate timer for pending deposits
    if (deposit.status !== 'pending') {
      setRemainingTime(0);
      setIsExpired(false);
      return;
    }

    // Calculate time difference: how much time has passed since serverTime
    const serverTime = new Date(deposit.serverTime).getTime();
    const expiredAt = new Date(deposit.expiredAt).getTime();
    // Duration from serverTime to expiredAt (in milliseconds)
    const duration = expiredAt - serverTime;

    const updateTimer = () => {
      const now = Date.now();
      // Calculate how much time has passed since serverTime
      const elapsed = now - serverTime;
      // Remaining time = total duration - elapsed time
      const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));

      setRemainingTime(remaining);
      // Only set expired if remaining is 0, but don't override status
      setIsExpired(remaining <= 0);
    };

    // Update immediately
    updateTimer();

    // Update every second for real-time countdown
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deposit, isOpen]);

  // Handle status changes from polling
  useEffect(() => {
    if (!currentDepositData?.data?.data) return;

    const currentDeposit = currentDepositData.data.data;
    if (currentDeposit.status === 'completed') {
      onSuccess(currentDeposit.amount);
      onClose();
    } else if (
      currentDeposit.status === 'cancelled' ||
      currentDeposit.status === 'expired'
    ) {
      onClose();
    }
  }, [currentDepositData, onSuccess, onClose]);

  const handleCopyContent = async () => {
    if (!deposit) return;
    try {
      await navigator.clipboard.writeText(deposit.transferContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleContentClick = () => {
    handleCopyContent();
  };

  // WebSocket subscription for realtime status
  useEffect(() => {
    if (!isOpen || !deposit || deposit.status !== 'pending') return;

    const cleanup = subscribeStomp<{
      type?: string;
      data?: DepositStatusResponse;
    }>({
      topic: `/topic/deposits/${deposit.depositId}/status`,
      sendDestination: `/app/deposits/${deposit.depositId}/subscribe`,
      debugLabel: 'deposit-payment',
      onStateChange: setConnectionState,
      onMessage: payload => {
        const data =
          payload?.data ?? (payload as unknown as DepositStatusResponse);
        if (!data?.paymentStatus) return;

        if (data.paymentStatus === 'completed') {
          onSuccess(data.totalCredited ?? deposit.amount);
          onClose();
        } else if (
          data.paymentStatus === 'cancelled' ||
          data.paymentStatus === 'expired' ||
          data.paymentStatus === 'failed'
        ) {
          onClose();
        }
      },
      onError: () => setConnectionState('error'),
    });

    return () => {
      cleanup();
      setConnectionState('connecting');
    };
  }, [deposit, isOpen, onClose, onSuccess]);

  if (!deposit || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.qrModal.title}
      size="lg"
      closeOnClickOutside={true}
    >
      <div className="space-y-6 p-6">
        {/* Package Info - Only show if selected from package */}
        {selectedPackage && (
          <div className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/70 p-5 shadow-lg backdrop-blur dark:border-blue-500/30 dark:from-blue-500/10 dark:via-blue-500/5 dark:to-indigo-500/10">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-400 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-indigo-400 blur-2xl" />
            </div>

            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 dark:bg-blue-400/20">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <p className="text-base font-bold text-blue-900 dark:text-blue-200">
                  {t.qrModal.packageInfo || 'Thông tin gói đã chọn'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-blue-200/50 bg-white/60 p-3 backdrop-blur dark:border-blue-500/20 dark:bg-white/5">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {t.packages.packageName}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-200">
                    {selectedPackage.packageName}
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200/50 bg-white/60 p-3 backdrop-blur dark:border-blue-500/20 dark:bg-white/5">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {t.qrModal.amount}
                  </p>
                  <p className="mt-1 text-base font-bold text-blue-900 dark:text-blue-200">
                    {formatPrice(selectedPackage.amount)}
                  </p>
                </div>

                {selectedPackage.bonusAmount > 0 && (
                  <div className="rounded-lg border border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50/70 p-3 backdrop-blur dark:border-green-500/20 dark:from-green-500/10 dark:to-emerald-500/10">
                    <p className="text-xs font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
                      {t.packages.bonusAmount}
                    </p>
                    <p className="mt-1 text-base font-bold text-green-700 dark:text-green-300">
                      +{formatPrice(selectedPackage.bonusAmount)}
                    </p>
                  </div>
                )}

                <div className="rounded-lg border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-purple-50/70 p-3 backdrop-blur dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-purple-500/10">
                  <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                    {t.packages.totalReceived}
                  </p>
                  <p className="mt-1 text-lg font-bold text-indigo-900 dark:text-indigo-200">
                    {formatPrice(selectedPackage.totalReceived)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expired message - Only show if status is actually expired */}
        {deposit.status === 'expired' && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              {t.qrModal.expired}
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              {deposit.status !== 'expired' && deposit.qrUrl ? (
                <img
                  src={deposit.qrUrl}
                  alt="QR Code"
                  className="h-64 w-64 object-contain"
                  onError={e => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className =
                      'flex h-64 w-64 items-center justify-center text-sm text-slate-500 dark:text-white/60';
                    fallback.textContent = 'Không thể tải QR code';
                    target.parentElement?.appendChild(fallback);
                  }}
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center">
                  <p className="text-sm text-slate-500 dark:text-white/60">
                    {deposit.status === 'expired'
                      ? t.qrModal.expired
                      : 'Đang tải QR code...'}
                  </p>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-white/70">
              {t.qrModal.scanQR}
            </p>
            {connectionState === 'error' && (
              <p className="text-xs text-amber-600 dark:text-amber-300">
                Mất kết nối realtime, đang dùng kiểm tra định kỳ.
              </p>
            )}
          </div>

          {/* Payment Info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase text-slate-500 dark:text-white/50">
                    {t.qrModal.amount}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(deposit.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 dark:text-white/50">
                    {t.qrModal.expiresIn}
                  </p>
                  <p
                    className={`mt-1 text-xl font-bold ${
                      isExpired || remainingTime < 60
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isExpired ? '00:00' : formatTime(remainingTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 dark:text-white/50">
                    {t.qrModal.transferContent}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p
                      onClick={handleContentClick}
                      className="flex-1 cursor-pointer break-all rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                      title="Click để sao chép"
                    >
                      {deposit.transferContent}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyContent}
                      className="shrink-0"
                      title={copied ? t.qrModal.copied : t.qrModal.copyContent}
                    >
                      {copied ? (
                        <svg
                          className="h-4 w-4 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                {t.qrModal.instructions}
              </p>
              <ol className="space-y-2 text-xs text-slate-600 dark:text-white/70">
                <li>1. {t.qrModal.step1}</li>
                <li>
                  2.{' '}
                  {t.qrModal.step2.replace(
                    '{content}',
                    deposit.transferContent
                  )}
                </li>
                <li>
                  3.{' '}
                  {t.qrModal.step3.replace(
                    '{amount}',
                    formatPrice(deposit.amount)
                  )}
                </li>
                <li>4. {t.qrModal.step4}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => onCancel(deposit.depositId)}
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            {t.qrModal.cancelOrder}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
