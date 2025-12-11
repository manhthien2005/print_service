'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import {
  pagePackagesMock,
  PaymentMethod,
  PagePackage,
} from '@/data/buyPagesMock';
import { PackageSelectionModal } from './PackageSelectionModal';
import { PaymentVerificationModal } from './PaymentVerificationModal';
import { PurchaseHistory } from './PurchaseHistory';

export function BuyPagesContent() {
  const [selectedPackage, setSelectedPackage] = useState<PagePackage | null>(
    null
  );
  const [customPages, setCustomPages] = useState<string>('');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'package' | 'custom' | null>(
    null
  );

  const handlePackageSelect = (pkg: PagePackage) => {
    setSelectedPackage(pkg);
    setPurchaseType('package');
    setShowPackageModal(false);
    setShowPaymentModal(true);
  };

  const handleCustomPurchase = () => {
    const pages = parseInt(customPages, 10);
    if (pages && pages > 0) {
      setPurchaseType('custom');
      setShowPaymentModal(true);
    }
  };

  const handlePaymentConfirm = (method: PaymentMethod) => {
    // TODO: Gọi API để xử lý thanh toán
    console.log('Processing payment:', {
      type: purchaseType,
      package: selectedPackage,
      customPages: customPages,
      method: method,
    });
    // Sau khi thanh toán thành công, đóng modal và reset
    setTimeout(() => {
      setShowPaymentModal(false);
      setSelectedPackage(null);
      setCustomPages('');
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
            Chọn gói mua trang
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            Mua theo gói để nhận thêm trang bonus
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pagePackagesMock.map(pkg => (
            <Card
              key={pkg.id}
              className={cn(
                'relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg',
                pkg.popular && 'ring-2 ring-blue-500 ring-offset-2'
              )}
              onClick={() => handlePackageSelect(pkg)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Phổ biến
                  </span>
                </div>
              )}
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
                    {pkg.pages.toLocaleString('vi-VN')} trang
                  </div>
                  {pkg.bonusPages > 0 && (
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
                        +{pkg.bonusPages} trang bonus
                      </span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-500 dark:text-white/60">
                    Tổng: {pkg.pages + pkg.bonusPages} trang
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3 dark:border-white/10">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(pkg.priceVnd)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/60">
                    {formatPrice(
                      Math.round(pkg.priceVnd / (pkg.pages + pkg.bonusPages))
                    )}{' '}
                    /trang
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99]"
                  onClick={e => {
                    e.stopPropagation();
                    handlePackageSelect(pkg);
                  }}
                >
                  Chọn gói
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Purchase Section */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Mua tùy chỉnh
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            Nhập số trang bạn muốn mua (tối thiểu 10 trang)
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-white">
              Số trang
            </label>
            <Input
              type="number"
              min="10"
              value={customPages}
              onChange={e => setCustomPages(e.target.value)}
              placeholder="Nhập số trang (tối thiểu 10)"
              className="w-full"
            />
            {customPages && parseInt(customPages, 10) > 0 && (
              <div className="mt-2 text-sm text-slate-600 dark:text-white/70">
                <div>
                  Giá:{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatPrice(parseInt(customPages, 10) * 500)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  (500 VND /trang)
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleCustomPurchase}
            disabled={!customPages || parseInt(customPages, 10) < 10}
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
        customPages={customPages ? parseInt(customPages, 10) : 0}
      />
    </div>
  );
}
