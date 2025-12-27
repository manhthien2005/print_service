'use client';

import React, { useState } from 'react';
import {
  useSemesterBonus,
  useCreateSemesterBonus,
  useUpdateSemesterBonus,
  useDistributeSemesterBonus,
  type SemesterBonusResponse,
  type CreateSemesterBonusRequest,
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
import { PencilIcon, PlusIcon, GiftIcon } from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/common/Skeleton';
import { useTranslations } from 'next-intl';

export function SemesterBonusSection() {
  const t = useTranslations('staff.configuration.semesterBonus');
  const { data, isLoading, error } = useSemesterBonus();
  const createMutation = useCreateSemesterBonus();
  const updateMutation = useUpdateSemesterBonus();
  const distributeMutation = useDistributeSemesterBonus();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SemesterBonusResponse | null>(
    null
  );
  const [formData, setFormData] = useState<CreateSemesterBonusRequest>({
    semesterId: '',
    bonusAmount: 0,
    bonusDescription: '',
    isActive: true,
    distributionDate: '',
  });

  const bonuses = data?.data?.data || [];

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success(t('createSuccess'));
      setIsCreateModalOpen(false);
      setFormData({
        semesterId: '',
        bonusAmount: 0,
        bonusDescription: '',
        isActive: true,
        distributionDate: '',
      });
    } catch (error) {
      toast.error(t('createError'));
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await updateMutation.mutateAsync({
        bonusId: editingItem.bonusId,
        data: formData,
      });
      toast.success(t('updateSuccess'));
      setEditingItem(null);
    } catch (error) {
      toast.error(t('updateError'));
    }
  };

  const handleDistribute = async (bonusId: string) => {
    if (!confirm(t('distributeConfirm'))) return;

    try {
      const result = await distributeMutation.mutateAsync(bonusId);
      const count = result.data?.data?.newlyDistributed || 0;
      toast.success(t('distributeSuccess', { count }));
    } catch (error) {
      toast.error(t('distributeError'));
    }
  };

  const handleEdit = (item: SemesterBonusResponse) => {
    setEditingItem(item);
    setFormData({
      semesterId: item.semesterId,
      bonusAmount: item.bonusAmount,
      bonusDescription: item.bonusDescription,
      isActive: item.isActive,
      distributionDate: item.distributionDate,
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
                  <Skeleton className="h-5 w-40" variant="shimmer" />
                  <Skeleton className="mt-2 h-4 w-48" variant="shimmer" />
                  <div className="mt-2 flex gap-4">
                    <Skeleton className="h-4 w-32" variant="shimmer" />
                    <Skeleton className="h-4 w-36" variant="shimmer" />
                  </div>
                  <Skeleton className="mt-2 h-3 w-40" variant="shimmer" />
                  <Skeleton className="mt-1 h-3 w-24" variant="shimmer" />
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Skeleton className="h-9 w-28 rounded" variant="shimmer" />
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
          <CardTitle>Bonus học kỳ</CardTitle>
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
              {t('addBonus')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bonuses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-white/60">
                {t('noData')}
              </p>
            ) : (
              bonuses.map(item => (
                <div
                  key={item.bonusId}
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {item.semesterName}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-white/70">
                      {item.bonusDescription}
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('amount')}:{' '}
                        {item.bonusAmount.toLocaleString('vi-VN')} VND
                      </span>
                      <span className="text-slate-600 dark:text-white/70">
                        {t('distributed')}: {item.totalDistributed}{' '}
                        {t('students')}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                      {t('distributionDateLabel')}:{' '}
                      {new Date(item.distributionDate).toLocaleDateString(
                        'vi-VN'
                      )}
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
                      variant="default"
                      size="sm"
                      onClick={() => handleDistribute(item.bonusId)}
                      disabled={distributeMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <GiftIcon className="h-4 w-4" />
                      {t('distribute')}
                    </Button>
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || Boolean(editingItem)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingItem(null);
          setFormData({
            semesterId: '',
            bonusAmount: 0,
            bonusDescription: '',
            isActive: true,
            distributionDate: '',
          });
        }}
        title={editingItem ? t('editTitle') : t('createTitle')}
        size="md"
      >
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('semesterId')}
            </label>
            <Input
              type="text"
              value={formData.semesterId}
              onChange={e =>
                setFormData({ ...formData, semesterId: e.target.value })
              }
              placeholder={t('semesterIdPlaceholder')}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('bonusAmount')}
            </label>
            <Input
              type="number"
              value={formData.bonusAmount}
              onChange={e =>
                setFormData({
                  ...formData,
                  bonusAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder={t('bonusAmountPlaceholder')}
              className="w-full"
              min="0"
              step="1000"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('bonusDescription')}
            </label>
            <Input
              type="text"
              value={formData.bonusDescription}
              onChange={e =>
                setFormData({ ...formData, bonusDescription: e.target.value })
              }
              placeholder={t('bonusDescriptionPlaceholder')}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('distributionDate')}
            </label>
            <Input
              type="date"
              value={formData.distributionDate}
              onChange={e =>
                setFormData({ ...formData, distributionDate: e.target.value })
              }
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
                !formData.semesterId ||
                !formData.bonusDescription ||
                !formData.distributionDate ||
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
                  semesterId: '',
                  bonusAmount: 0,
                  bonusDescription: '',
                  isActive: true,
                  distributionDate: '',
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
