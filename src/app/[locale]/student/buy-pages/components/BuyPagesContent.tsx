'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import {
  rechargePackagesMock,
  PaymentMethod,
  RechargePackage,
} from '@/data/rechargeMoneyMock';
import { PackageSelectionModal } from './PackageSelectionModal';
import { PaymentVerificationModal } from './PaymentVerificationModal';
import { PurchaseHistory } from './PurchaseHistory';

export function BuyPagesContent() {
  const [selectedPackage, setSelectedPackage] =
    useState<RechargePackage | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'package' | 'custom' | null>(
    null
  );

  const handlePackageSelect = (pkg: RechargePackage) => {
    setSelectedPackage(pkg);
    setPurchaseType('package');
    setShowPackageModal(false);
    setShowPaymentModal(true);
  };

  const handleCustomRecharge = () => {
    const amount = parseInt(customAmount, 10);
    if (amount && amount >= 10000) {
      setPurchaseType('custom');
      setShowPaymentModal(true);
    }
  };

  const handlePaymentConfirm = (method: PaymentMethod) => {
    // TODO: Gọi API để xử lý thanh toán
    console.log('Processing payment:', {
      type: purchaseType,
      package: selectedPackage,
      customAmount: customAmount,
      method: method,
    });
    // Sau khi thanh toán thành công, đóng modal và reset
    setTimeout(() => {
      setShowPaymentModal(false);
      setSelectedPackage(null);
      setCustomAmount('');
      setPurchaseType(null);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Packages Section */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chọn gói nạp tiền
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            Nạp theo gói để nhận thêm tiền bonus
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {rechargePackagesMock.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => handlePackageSelect(pkg)}
              className="relative cursor-pointer"
            >
              {pkg.isEvent ? (
                <div className="absolute -top-3 left-1/2 z-30 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-red-500 via-red-600 to-green-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Sự kiện
                  </span>
                </div>
              ) : pkg.popular ? (
                <div className="absolute -top-3 left-1/2 z-30 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Phổ biến
                  </span>
                </div>
              ) : null}
              <SpotlightCard
                className={cn(
                  'relative bg-white/80 shadow-lg backdrop-blur transition-all hover:shadow-xl dark:bg-white/5',
                  pkg.isEvent
                    ? 'ring-2 ring-red-500 ring-offset-2'
                    : pkg.popular
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'border border-slate-200/70 dark:border-white/10'
                )}
                spotlightColor={
                  pkg.isEvent
                    ? 'rgba(239, 68, 68, 0.3)'
                    : pkg.popular
                      ? 'rgba(59, 130, 246, 0.3)'
                      : 'rgba(148, 163, 184, 0.2)'
                }
              >
                <Card className="h-full border-0 bg-transparent shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    {pkg.description && (
                      <p className="text-xs text-slate-500 dark:text-white/60">
                        {pkg.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(pkg.amountVnd)}
                      </div>
                      {pkg.bonusAmountVnd && pkg.bonusAmountVnd > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="font-semibold">
                            +{formatPrice(pkg.bonusAmountVnd)} bonus
                          </span>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-slate-500 dark:text-white/60">
                        Tổng:{' '}
                        {formatPrice(pkg.amountVnd + (pkg.bonusAmountVnd || 0))}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3 dark:border-white/10">
                      <div className="text-sm text-slate-500 dark:text-white/60">
                        Số tiền nạp
                      </div>
                      {pkg.bonusAmountVnd && pkg.bonusAmountVnd > 0 && (
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                          Tiết kiệm{' '}
                          {Math.round(
                            (pkg.bonusAmountVnd / pkg.amountVnd) * 100
                          )}
                          %
                        </div>
                      )}
                    </div>
                    <Button
                      className={cn(
                        'w-full text-white shadow-md transition-transform hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]',
                        pkg.isEvent
                          ? 'bg-gradient-to-r from-red-500 via-red-600 to-green-600 hover:from-red-600 hover:via-red-700 hover:to-green-700'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                      )}
                      onClick={e => {
                        e.stopPropagation();
                        handlePackageSelect(pkg);
                      }}
                    >
                      Chọn gói
                    </Button>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Recharge Section */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nạp tùy chỉnh
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            Nhập số tiền bạn muốn nạp (tối thiểu 10,000₫)
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-white">
              Số tiền (VND)
            </label>
            <Input
              type="number"
              min="10000"
              step="1000"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="Nhập số tiền (tối thiểu 10,000₫)"
              className="w-full"
            />
            {customAmount && parseInt(customAmount, 10) >= 10000 && (
              <div className="mt-2 text-sm text-slate-600 dark:text-white/70">
                <div>
                  Số tiền nạp:{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatPrice(parseInt(customAmount, 10))}
                  </span>
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleCustomRecharge}
            disabled={!customAmount || parseInt(customAmount, 10) < 10000}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
          >
            Thanh toán
          </Button>
        </div>
      </div>

      {/* Purchase History */}
      <PurchaseHistory />

      {/* Modals */}
      <PackageSelectionModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onSelect={handlePackageSelect}
      />

      <PaymentVerificationModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
        }}
        onConfirm={handlePaymentConfirm}
        purchaseType={purchaseType}
        selectedPackage={selectedPackage}
        customAmount={customAmount ? parseInt(customAmount, 10) : 0}
      />
    </div>
  );
}
