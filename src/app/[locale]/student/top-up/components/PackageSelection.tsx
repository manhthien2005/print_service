'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { DepositBonusPackageResponse } from '@/types/api';

interface PackageSelectionProps {
  packages: DepositBonusPackageResponse[];
  onSelectPackage: (pkg: DepositBonusPackageResponse) => void;
  isLoading?: boolean;
  loadingPackageId?: string | null;
  t: {
    packages: {
      title: string;
      description: string;
      popular: string;
      selectPackage: string;
      depositAmount: string;
      bonusAmount: string;
      totalReceived: string;
      savings: string;
    };
  };
}

export function PackageSelection({
  packages,
  onSelectPackage,
  isLoading,
  loadingPackageId,
  t,
}: PackageSelectionProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Check if package is Christmas themed
  const isChristmasPackage = (pkg: DepositBonusPackageResponse) => {
    const name = pkg.packageName?.toLowerCase() || '';
    const desc = pkg.description?.toLowerCase() || '';
    return (
      name.includes('christmas') ||
      name.includes('noel') ||
      desc.includes('christmas') ||
      desc.includes('noel')
    );
  };

  // Calculate savings percentage
  const getSavingsPercentage = (pkg: DepositBonusPackageResponse) => {
    if (pkg.bonusAmount === 0) return 0;
    return Math.round((pkg.bonusAmount / pkg.amount) * 100);
  };

  if (isLoading) {
    return (
      <div className="bg-background/80 dark:bg-background/5 rounded-2xl border border-border p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-border dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.packages.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            {t.packages.description}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="dark:bg-muted/5 h-64 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="bg-background/80 dark:bg-background/5 rounded-2xl border border-border p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-border dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.packages.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            {t.packages.description}
          </p>
        </div>
        <div className="dark:bg-muted/5 rounded-xl border border-dashed border-border bg-muted px-4 py-10 text-center text-sm text-slate-600 dark:border-border dark:text-white/70">
          Không có gói nạp tiền nào
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.packages.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
          {t.packages.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg, index) => {
          const isChristmas = isChristmasPackage(pkg);
          const hasBonus = pkg.bonusAmount > 0;
          const savingsPercent = getSavingsPercentage(pkg);

          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(pkg)}
              className="relative cursor-pointer"
              style={{
                opacity: 0,
                animation: `fadeIn 0.5s ease-in-out ${index * 100}ms forwards`,
              }}
            >
              <SpotlightCard
                className={cn(
                  'relative h-full bg-white/80 shadow-lg backdrop-blur transition-all hover:shadow-xl dark:bg-white/5',
                  'border border-slate-200/70 dark:border-white/10',
                  isChristmas &&
                    'overflow-visible border-red-300/50 dark:border-red-500/30'
                )}
                spotlightColor={
                  isChristmas
                    ? 'rgba(220, 38, 38, 0.2)'
                    : 'rgba(59, 130, 246, 0.2)'
                }
              >
                <Card
                  className={cn(
                    'relative h-full border-0 bg-transparent shadow-none',
                    isChristmas && 'overflow-visible'
                  )}
                >
                  {/* Christmas Event Badge - Centered at top */}
                  {isChristmas && (
                    <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg ring-2 ring-white/50 dark:ring-red-900/50">
                        <span className="mr-1.5 text-base">🎄</span>
                        Sự kiện
                      </span>
                    </div>
                  )}

                  {/* Christmas Background Pattern */}
                  {isChristmas && (
                    <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
                      {/* Snowflakes */}
                      <div className="absolute left-4 top-8 text-4xl">❄</div>
                      <div className="absolute right-6 top-16 text-3xl">❄</div>
                      <div className="absolute bottom-20 left-8 text-2xl">
                        ❄
                      </div>
                      <div className="absolute bottom-12 right-4 text-3xl">
                        ❄
                      </div>
                      {/* Christmas Tree */}
                      <div className="absolute bottom-4 right-2 text-5xl">
                        🎄
                      </div>
                      <div className="absolute bottom-8 left-3 text-4xl">
                        🎄
                      </div>
                      {/* Snowman */}
                      <div className="absolute left-1/2 top-12 -translate-x-1/2 text-4xl">
                        ⛄
                      </div>
                      <div className="absolute bottom-16 right-8 text-3xl">
                        ⛄
                      </div>
                    </div>
                  )}

                  <CardHeader className={cn('pb-3', isChristmas && 'pt-6')}>
                    <CardTitle
                      className={cn(
                        'text-lg',
                        isChristmas && 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {pkg.packageName}
                    </CardTitle>
                    {pkg.description && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-white/70">
                        {pkg.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex min-h-[220px] flex-col space-y-3">
                    <div className={hasBonus ? 'flex-1' : 'flex-1'}>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(pkg.amount)}
                      </div>
                      {hasBonus && (
                        <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                          {' '}
                          {/* Success color - keep specific */}
                          <span className="font-semibold">
                            +{formatPrice(pkg.bonusAmount)}{' '}
                            {t.packages.bonusAmount}
                          </span>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-slate-600 dark:text-white/70">
                        {t.packages.totalReceived}:{' '}
                        {formatPrice(pkg.totalReceived)}
                      </div>
                    </div>
                    {hasBonus && (
                      <div className="border-t border-slate-200 pt-3 dark:border-white/10">
                        <div className="text-sm text-slate-600 dark:text-white/70">
                          {t.packages.depositAmount}
                        </div>
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                          {t.packages.savings} {savingsPercent}%
                        </div>
                      </div>
                    )}
                    <div className="mt-auto">
                      <Button
                        className={cn(
                          'w-full text-white shadow-md transition-transform hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]',
                          isChristmas
                            ? 'bg-gradient-to-r from-red-500 via-red-600 to-green-500 shadow-red-500/50 hover:from-red-600 hover:via-red-700 hover:to-green-600'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                        )}
                        onClick={e => {
                          e.stopPropagation();
                          onSelectPackage(pkg);
                        }}
                        disabled={loadingPackageId === pkg.id || isLoading}
                      >
                        {loadingPackageId === pkg.id ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
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
                          t.packages.selectPackage
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
