'use client';

import React, { useState } from 'react';
import {
  useSemesterBonus,
  useSemesters,
  useCreateSemesterBonus,
  useUpdateSemesterBonus,
  useDistributeSemesterBonus,
  type SemesterBonusResponse,
  type CreateSemesterBonusRequest,
} from '@/lib/api/services/systemConfig';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
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
import { useTranslations, useLocale } from 'next-intl';

export function SemesterBonusSection() {
  const t = useTranslations('staff.configuration.semesterBonus');
  const locale = useLocale();
  const { data, isLoading, error } = useSemesterBonus();
  const {
    data: semestersData,
    isLoading: isLoadingSemesters,
    error: semestersError,
  } = useSemesters();
  const createMutation = useCreateSemesterBonus();
  const updateMutation = useUpdateSemesterBonus();
  const distributeMutation = useDistributeSemesterBonus();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SemesterBonusResponse | null>(
    null
  );
  const [formData, setFormData] = useState<
    CreateSemesterBonusRequest & { distributionDate?: string }
  >({
    semesterId: '',
    bonusAmount: 0,
    description: '',
  });

  const semesters = semestersData?.data?.data || [];
  const availableSemesters = semesters.filter(s => !s.hasBonus);

  // Helper function to format semester name: "Fall 2024-2025"
  const formatSemesterName = (termName: string, academicYearName: string) => {
    const capitalizedTerm =
      termName.charAt(0).toUpperCase() + termName.slice(1);
    return `${capitalizedTerm} ${academicYearName}`;
  };

  const bonuses = data?.data?.data || [];

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success(t('createSuccess'));
      setIsCreateModalOpen(false);
      setFormData({
        semesterId: '',
        bonusAmount: 0,
        description: '',
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
      const data = result.data?.data;
      if (data) {
        const { newlyDistributed, alreadyReceived, failed, bonusAmount } = data;
        if (failed > 0) {
          toast.warning(
            t('distributeToast.successWithFailed', {
              newlyDistributed,
              failed,
            })
          );
        } else if (newlyDistributed === 0) {
          toast.info(
            t('distributeToast.noNewStudents', {
              alreadyReceived,
            })
          );
        } else {
          const amount = parseFloat(bonusAmount) || 0;
          toast.success(
            t('distributeToast.success', {
              amount: amount.toLocaleString(
                locale === 'vi' ? 'vi-VN' : 'en-US'
              ),
              count: newlyDistributed,
            })
          );
        }
      }
    } catch (error) {
      toast.error(t('distributeError'));
    }
  };

  const handleEdit = (item: SemesterBonusResponse) => {
    setEditingItem(item);
    setFormData({
      semesterId: item.semesterId,
      bonusAmount: item.bonusAmount,
      description: item.bonusDescription,
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
          <CardTitle>{t('title')}</CardTitle>
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
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.semesterName}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.isDistributed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}
                      >
                        {item.isDistributed
                          ? t('status.distributed')
                          : t('status.notDistributed', {
                              date: new Date(
                                item.distributionDate
                              ).toLocaleDateString(
                                locale === 'vi' ? 'vi-VN' : 'en-US'
                              ),
                            })}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-white/70">
                      {item.bonusDescription}
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('amount')}:{' '}
                        {item.bonusAmount.toLocaleString(
                          locale === 'vi' ? 'vi-VN' : 'en-US'
                        )}{' '}
                        {t('currency')}
                      </span>
                      <span className="text-slate-600 dark:text-white/70">
                        {t('status.distributedCount', {
                          received: item.studentsReceived || 0,
                          total: item.totalEligibleStudents || 0,
                        })}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                      {t('distributionDateLabel')}:{' '}
                      {new Date(item.distributionDate).toLocaleDateString(
                        locale === 'vi' ? 'vi-VN' : 'en-US'
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDistribute(item.bonusId)}
                      disabled={
                        distributeMutation.isPending ||
                        (item.isDistributed &&
                          item.studentsReceived === item.totalEligibleStudents)
                      }
                      className="flex items-center gap-2"
                    >
                      <GiftIcon className="h-4 w-4" />
                      {item.isDistributed
                        ? t('distributeButton.redistribute')
                        : t('distributeButton.distribute')}
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
            description: '',
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
            {editingItem ? (
              <Input
                type="text"
                value={formData.semesterId}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800"
              />
            ) : (
              <Select
                value={formData.semesterId}
                onChange={e =>
                  setFormData({ ...formData, semesterId: e.target.value })
                }
                isLoading={isLoadingSemesters}
                className="w-full"
              >
                <option value="">{t('selectSemester')}</option>
                {availableSemesters.map(semester => (
                  <option key={semester.semesterId} value={semester.semesterId}>
                    {formatSemesterName(
                      semester.termName,
                      semester.academicYearName
                    )}
                  </option>
                ))}
              </Select>
            )}
            {!editingItem && isLoadingSemesters && (
              <p className="text-xs text-slate-500 dark:text-white/60">
                {t('loadingSemesters')}
              </p>
            )}
            {!editingItem && !isLoadingSemesters && semestersError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {t('errorLoadingSemesters')}
              </p>
            )}
            {!editingItem &&
              !isLoadingSemesters &&
              !semestersError &&
              availableSemesters.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-white/60">
                  {t('allSemestersHaveBonus')}
                </p>
              )}
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
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t('bonusDescriptionPlaceholder')}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('distributionDate')} {t('optional')}
            </label>
            <Input
              type="date"
              value={formData.distributionDate || ''}
              onChange={e =>
                setFormData({ ...formData, distributionDate: e.target.value })
              }
              disabled={editingItem?.isDistributed}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-white/60">
              {editingItem?.isDistributed
                ? t('distributionDateHint.distributed')
                : t('distributionDateHint.notDistributed')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={editingItem ? handleUpdate : handleCreate}
              disabled={
                !formData.semesterId ||
                !formData.description ||
                !formData.bonusAmount ||
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
                  description: '',
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
