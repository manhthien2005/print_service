'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useColorModePrices,
  useUpdateColorModePrice,
  type ColorModePriceResponse,
} from '@/lib/api/services/systemConfig';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { PencilIcon } from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/common/Skeleton';

export function ColorModePricesSection() {
  const t = useTranslations('staff.configuration.colorModePrices');
  const { data, isLoading, error } = useColorModePrices();
  const updateMutation = useUpdateColorModePrice();
  const [editingItem, setEditingItem] = useState<ColorModePriceResponse | null>(
    null
  );
  const [editMultiplier, setEditMultiplier] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const prices = data?.data?.data || [];

  const handleEdit = (item: ColorModePriceResponse) => {
    setEditingItem(item);
    setEditMultiplier(item.priceMultiplier.toString());
    setEditIsActive(item.isActive);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      await updateMutation.mutateAsync({
        colorModeId: editingItem.colorModeId,
        priceMultiplier: parseFloat(editMultiplier),
        isActive: editIsActive,
      });
      toast.success(t('saveSuccess'));
      setEditingItem(null);
    } catch (error) {
      toast.error(t('saveError'));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex-1">
                  <Skeleton className="h-5 w-32" variant="shimmer" />
                  <Skeleton className="mt-2 h-4 w-40" variant="shimmer" />
                  <Skeleton className="mt-2 h-3 w-48" variant="shimmer" />
                </div>
                <div className="ml-4 flex items-center gap-4">
                  <div className="text-right">
                    <Skeleton className="h-6 w-12" variant="shimmer" />
                    <Skeleton className="mt-1 h-3 w-16" variant="shimmer" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription className="text-red-600">
            {t('saveError')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prices.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-white/60">
                {t('noData')}
              </p>
            ) : (
              prices.map(item => (
                <div
                  key={item.settingId}
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {item.colorModeName === 'black-white'
                        ? 'Đen trắng'
                        : item.colorModeName === 'color'
                          ? 'Màu'
                          : item.colorModeName}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-white/70">
                      {item.description}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                      {t('updated')}:{' '}
                      {new Date(item.updatedAt).toLocaleString('vi-VN')}{' '}
                      {t('by')} {item.updatedByName || item.updatedByEmail}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        ×{item.priceMultiplier}
                      </div>
                      <div
                        className={`text-xs ${
                          item.isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.isActive ? t('active') : t('inactive')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={t('editTitle')}
        size="md"
      >
        {editingItem && (
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                {t('colorModeInfo')}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {editingItem.description}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
                {t('priceMultiplier')}
              </label>
              <Input
                type="number"
                value={editMultiplier}
                onChange={e => setEditMultiplier(e.target.value)}
                placeholder={t('multiplierPlaceholder')}
                className="w-full"
                min="0"
                step="0.1"
              />
              <p className="text-xs text-slate-500 dark:text-white/60">
                {t('multiplierHint')}
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={e => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-white/70">
                  {t('isActive')}
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={!editMultiplier || updateMutation.isPending}
                className="flex-1 border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
              >
                {updateMutation.isPending ? t('saving') : t('save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                disabled={updateMutation.isPending}
                className="border border-red-500 bg-red-500/80 text-white hover:border-red-600 hover:bg-red-600/90 dark:border-red-600 dark:bg-red-600/80 dark:hover:border-red-700 dark:hover:bg-red-700/90"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
