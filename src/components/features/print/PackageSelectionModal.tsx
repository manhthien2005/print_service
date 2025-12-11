'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PagePackage } from '@/data/buyPagesMock';
import { pagePackagesMock } from '@/data/buyPagesMock';
import { cn } from '@/lib/utils/cn';

interface PackageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pkg: PagePackage) => void;
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
      title="Chọn gói mua trang"
      size="xl"
    >
      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-white/70">
            Chọn một gói phù hợp với nhu cầu của bạn. Mua theo gói để nhận thêm
            trang bonus.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {pagePackagesMock.map(pkg => (
            <Card
              key={pkg.id}
              className={cn(
                'relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg',
                pkg.popular && 'ring-2 ring-blue-500 ring-offset-2'
              )}
              onClick={() => {
                onSelect(pkg);
              }}
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
                    onSelect(pkg);
                  }}
                >
                  Chọn gói này
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Modal>
  );
}
