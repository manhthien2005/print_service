'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onRechargeMore?: () => void;
  t: {
    successModal: {
      title: string;
      message: string;
      amount: string;
      close: string;
      rechargeMore: string;
    };
  };
}

export function PaymentSuccessModal({
  isOpen,
  amount,
  onClose,
  onRechargeMore,
  t,
}: PaymentSuccessModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.successModal.title}
      size="md"
    >
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
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
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {t.successModal.message}
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(amount)}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/60">
              {t.successModal.amount}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {onRechargeMore && (
            <Button
              variant="outline"
              onClick={onRechargeMore}
              className="flex-1"
            >
              {t.successModal.rechargeMore}
            </Button>
          )}
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99]"
          >
            {t.successModal.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
