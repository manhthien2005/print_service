'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { RechargePackage } from '@/data/rechargeMoneyMock';
import { rechargePackagesMock } from '@/data/rechargeMoneyMock';
import { cn } from '@/lib/utils/cn';

interface PackageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pkg: RechargePackage) => void;
}

export function PackageSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: PackageSelectionModalProps) {
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
      title="Chọn gói nạp tiền"
      size="xl"
    >
      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-white/70">
            Chọn một gói phù hợp với nhu cầu của bạn. Nạp theo gói để nhận thêm
            tiền bonus.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {rechargePackagesMock.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => {
                onSelect(pkg);
              }}
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
                        onSelect(pkg);
                      }}
                    >
                      Chọn gói này
                    </Button>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
