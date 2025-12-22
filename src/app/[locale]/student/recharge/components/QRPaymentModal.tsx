'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { useCurrentDeposit } from '@/lib/api/services/payment';
import { PAYMENT_CONSTANTS } from '../constants';
import type { DepositResponse } from '@/types/api';

interface QRPaymentModalProps {
  isOpen: boolean;
  deposit: DepositResponse | null;
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
    };
  };
}

export function QRPaymentModal({
  isOpen,
  deposit,
  onClose,
  onCancel,
  onSuccess,
  t,
}: QRPaymentModalProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const calculateRemainingTime = useCallback(
    (expiredAt: string, serverTime: string) => {
      const expired = new Date(expiredAt).getTime();
      const server = new Date(serverTime).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((expired - (now - server)) / 1000));
    },
    []
  );

  // Update countdown timer
  useEffect(() => {
    if (!deposit || !isOpen) return;

    const updateTimer = () => {
      const remaining = calculateRemainingTime(
        deposit.expiredAt,
        deposit.serverTime
      );
      setRemainingTime(remaining);
      setIsExpired(remaining <= 0);
    };

    updateTimer();
    const interval = setInterval(
      updateTimer,
      PAYMENT_CONSTANTS.COUNTDOWN_UPDATE_INTERVAL
    );

    return () => clearInterval(interval);
  }, [deposit, isOpen, calculateRemainingTime]);

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

  if (!deposit || !isOpen) return null;

  const qrValue = deposit.qrUrl || deposit.transferContent;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.qrModal.title}
      size="lg"
      closeOnClickOutside={false}
    >
      <div className="space-y-6 p-6">
        {/* Status message */}
        {deposit.isReused && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t.qrModal.reused}
            </p>
          </div>
        )}
        {!deposit.isReused && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
            <p className="text-sm text-green-800 dark:text-green-200">
              {t.qrModal.newOrder}
            </p>
          </div>
        )}

        {/* Expired message */}
        {isExpired && (
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
              {!isExpired ? (
                <QRCodeSVG
                  value={qrValue}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center">
                  <p className="text-sm text-slate-500 dark:text-white/60">
                    {t.qrModal.expired}
                  </p>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-white/70">
              {t.qrModal.scanQR}
            </p>
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
                    <p className="flex-1 break-all font-mono text-sm text-slate-900 dark:text-white">
                      {deposit.transferContent}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyContent}
                      className="shrink-0"
                    >
                      {copied ? t.qrModal.copied : t.qrModal.copyContent}
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
        <div className="flex justify-center">
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
