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
  t,
}: PackageSelectionProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
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
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
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
        <div className="rounded-xl border border-dashed border-slate-200/70 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
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
        {packages.map(pkg => (
          <div
            key={pkg.id}
            onClick={() => onSelectPackage(pkg)}
            className="relative cursor-pointer"
          >
            <SpotlightCard
              className={cn(
                'relative bg-white/80 shadow-lg backdrop-blur transition-all hover:shadow-xl dark:bg-white/5',
                'border border-slate-200/70 dark:border-white/10'
              )}
              spotlightColor="rgba(59, 130, 246, 0.2)"
            >
              <Card className="h-full border-0 bg-transparent shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
                  {pkg.description && (
                    <p className="text-xs text-slate-500 dark:text-white/60">
                      {pkg.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatPrice(pkg.amount)}
                    </div>
                    {pkg.bonusAmount > 0 && (
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
                          +{formatPrice(pkg.bonusAmount)}{' '}
                          {t.packages.bonusAmount}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-slate-500 dark:text-white/60">
                      {t.packages.totalReceived}:{' '}
                      {formatPrice(pkg.totalReceived)}
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3 dark:border-white/10">
                    <div className="text-sm text-slate-500 dark:text-white/60">
                      {t.packages.depositAmount}
                    </div>
                    {pkg.bonusAmount > 0 && (
                      <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                        {t.packages.savings}{' '}
                        {Math.round((pkg.bonusAmount / pkg.amount) * 100)}%
                      </div>
                    )}
                  </div>
                  <Button
                    className={cn(
                      'w-full text-white shadow-md transition-transform hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]',
                      'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                    )}
                    onClick={e => {
                      e.stopPropagation();
                      onSelectPackage(pkg);
                    }}
                  >
                    {t.packages.selectPackage}
                  </Button>
                </CardContent>
              </Card>
            </SpotlightCard>
          </div>
        ))}
      </div>
    </div>
  );
}

