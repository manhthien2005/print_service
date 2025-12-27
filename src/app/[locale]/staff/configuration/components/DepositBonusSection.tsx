'use client';

import React, { useState } from 'react';
import {
  useDepositBonusPackages,
  useCreateDepositBonusPackage,
  useUpdateDepositBonusPackage,
  useDeleteDepositBonusPackage,
  type DepositBonusPackageResponse,
  type CreateDepositBonusPackageRequest,
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
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/common/Skeleton';
import { useTranslations } from 'next-intl';

export function DepositBonusSection() {
  const t = useTranslations('staff.configuration.depositBonus');
  const { data, isLoading, error } = useDepositBonusPackages();
  const createMutation = useCreateDepositBonusPackage();
  const updateMutation = useUpdateDepositBonusPackage();
  const deleteMutation = useDeleteDepositBonusPackage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<DepositBonusPackageResponse | null>(null);
  const [formData, setFormData] = useState<CreateDepositBonusPackageRequest>({
    packageName: '',
    amountCap: 0,
    bonusPercentage: 0,
    description: '',
    isActive: true,
  });

  const packages = data?.data?.data || [];

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success(t('createSuccess'));
      setIsCreateModalOpen(false);
      setFormData({
        packageName: '',
        amountCap: 0,
        bonusPercentage: 0,
        description: '',
        isActive: true,
      });
    } catch (error) {
      toast.error(t('createError'));
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await updateMutation.mutateAsync({
        packageId: editingItem.packageId,
        data: formData,
      });
      toast.success(t('updateSuccess'));
      setEditingItem(null);
    } catch (error) {
      toast.error(t('updateError'));
    }
  };

  const handleDelete = async (packageId: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      await deleteMutation.mutateAsync(packageId);
      toast.success(t('deleteSuccess'));
    } catch (error) {
      toast.error(t('deleteError'));
    }
  };

  const handleEdit = (item: DepositBonusPackageResponse) => {
    setEditingItem(item);
    setFormData({
      packageName: item.packageName,
      amountCap: item.amountCap,
      bonusPercentage: item.bonusPercentage,
      description: item.description,
      isActive: item.isActive,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <Skeleton className="h-9 w-24 rounded" variant="shimmer" />
          </div>
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
                  <Skeleton className="mt-2 h-4 w-48" variant="shimmer" />
                  <div className="mt-2 flex gap-4">
                    <Skeleton className="h-4 w-32" variant="shimmer" />
                    <Skeleton className="h-4 w-24" variant="shimmer" />
                  </div>
                  <Skeleton className="mt-2 h-3 w-20" variant="shimmer" />
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
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
          <CardTitle>Gói bonus nạp tiền</CardTitle>
          <CardDescription className="text-red-600">
            {t('createError')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              {t('addPackage')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {packages.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-white/60">
                {t('noData')}
              </p>
            ) : (
              packages.map(item => (
                <div
                  key={item.packageId}
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {item.packageName}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-white/70">
                      {item.description}
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('depositLevel')}:{' '}
                        {item.amountCap.toLocaleString('vi-VN')} VND
                      </span>
                      <span className="text-slate-600 dark:text-white/70">
                        {t('bonus')}: {(item.bonusPercentage * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div
                      className={`mt-1 text-xs ${
                        item.isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.isActive ? t('active') : t('inactive')}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.packageId)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || Boolean(editingItem)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingItem(null);
          setFormData({
            packageName: '',
            amountCap: 0,
            bonusPercentage: 0,
            description: '',
            isActive: true,
          });
        }}
        title={editingItem ? t('editTitle') : t('createTitle')}
        size="md"
      >
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('packageName')}
            </label>
            <Input
              type="text"
              value={formData.packageName}
              onChange={e =>
                setFormData({ ...formData, packageName: e.target.value })
              }
              placeholder={t('packageNamePlaceholder')}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('amountCap')}
            </label>
            <Input
              type="number"
              value={formData.amountCap}
              onChange={e =>
                setFormData({
                  ...formData,
                  amountCap: parseFloat(e.target.value) || 0,
                })
              }
              placeholder={t('amountCapPlaceholder')}
              className="w-full"
              min="0"
              step="10000"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('bonusPercentage')}
            </label>
            <Input
              type="number"
              value={formData.bonusPercentage}
              onChange={e =>
                setFormData({
                  ...formData,
                  bonusPercentage: parseFloat(e.target.value) || 0,
                })
              }
              placeholder={t('bonusPercentagePlaceholder')}
              className="w-full"
              min="0"
              max="1"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('description')}
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t('descriptionPlaceholder')}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-white/70">
                {t('isActive')}
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={editingItem ? handleUpdate : handleCreate}
              disabled={
                !formData.packageName ||
                !formData.description ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="flex-1 border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {createMutation.isPending || updateMutation.isPending
                ? t('saving')
                : editingItem
                  ? t('save')
                  : t('create')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingItem(null);
                setFormData({
                  packageName: '',
                  amountCap: 0,
                  bonusPercentage: 0,
                  description: '',
                  isActive: true,
                });
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="border border-red-500 bg-red-500/80 text-white hover:border-red-600 hover:bg-red-600/90 dark:border-red-600 dark:bg-red-600/80 dark:hover:border-red-700 dark:hover:bg-red-700/90"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
