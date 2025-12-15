'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PaymentMethod, RechargePackage } from '@/data/rechargeMoneyMock';
import { paymentMethods } from '@/data/rechargeMoneyMock';
import { cn } from '@/lib/utils/cn';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
  purchaseType: 'package' | 'custom' | null;
  selectedPackage: RechargePackage | null;
  customAmount: number;
}

export function PaymentVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  purchaseType,
  selectedPackage,
  customAmount,
}: PaymentVerificationModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateTotal = () => {
    if (purchaseType === 'package' && selectedPackage) {
      return selectedPackage.amountVnd;
    }
    if (purchaseType === 'custom' && customAmount > 0) {
      return customAmount;
    }
    return 0;
  };

  const getTotalAmount = () => {
    if (purchaseType === 'package' && selectedPackage) {
      return selectedPackage.amountVnd + (selectedPackage.bonusAmountVnd || 0);
    }
    return customAmount;
  };

  const handleConfirm = () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      onConfirm(selectedMethod);
      setIsProcessing(false);
      setSelectedMethod(null);
    }, 1500);
  };

  const total = calculateTotal();
  const totalAmount = getTotalAmount();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác thực thanh toán"
      size="lg"
      closeOnClickOutside={!isProcessing}
    >
      <div className="space-y-6 p-6">
        {/* Purchase Summary */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 text-sm font-semibold uppercase text-slate-500 dark:text-white/50">
            Thông tin đơn hàng
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-white/70">
                Loại mua:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {purchaseType === 'package'
                  ? selectedPackage?.name || 'Gói'
                  : 'Mua tùy chỉnh'}
              </span>
            </div>
            {purchaseType === 'package' && selectedPackage && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-white/70">
                    Số tiền nạp:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(selectedPackage.amountVnd)}
                  </span>
                </div>
                {selectedPackage.bonusAmountVnd &&
                  selectedPackage.bonusAmountVnd > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-white/70">
                        Tiền bonus:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        +{formatPrice(selectedPackage.bonusAmountVnd)}
                      </span>
                    </div>
                  )}
              </>
            )}
            {purchaseType === 'custom' && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-white/70">
                  Số tiền nạp:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatPrice(customAmount)}
                </span>
              </div>
            )}
            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-slate-900 dark:text-white">
                  Tổng tiền nhận được:
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-base font-semibold text-slate-900 dark:text-white">
                  Số tiền thanh toán:
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <div className="mb-4 text-sm font-semibold uppercase text-slate-500 dark:text-white/50">
            Chọn phương thức thanh toán
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {paymentMethods.map(method => (
              <button
                key={method.value}
                type="button"
                onClick={() => setSelectedMethod(method.value)}
                disabled={isProcessing}
                className={cn(
                  'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                  selectedMethod === method.value
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10',
                  isProcessing && 'cursor-not-allowed opacity-50'
                )}
              >
                <div className="text-3xl">{method.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {method.label}
                  </div>
                  {method.value === 'bank' && (
                    <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                      Chuyển khoản ngân hàng
                    </div>
                  )}
                  {method.value === 'momo' && (
                    <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                      Thanh toán qua ví MoMo
                    </div>
                  )}
                </div>
                {selectedMethod === method.value && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                    <svg
                      className="h-4 w-4 text-white"
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
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
              <div className="font-semibold">Lưu ý quan trọng</div>
              <div className="mt-1">
                Vui lòng kiểm tra lại thông tin trước khi xác nhận. Sau khi
                thanh toán thành công, số tiền sẽ được cộng vào tài khoản của
                bạn ngay lập tức.
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedMethod || isProcessing || total === 0}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
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
                Đang xử lý...
              </span>
            ) : (
              'Xác nhận thanh toán'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
