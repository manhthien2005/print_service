'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useGeneralConfigs,
  useUpdateGeneralConfig,
  type GeneralConfigResponse,
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

export function GeneralConfigSection() {
  const t = useTranslations('staff.configuration.generalConfig');
  const { data, isLoading, error } = useGeneralConfigs();
  const updateMutation = useUpdateGeneralConfig();
  const [editingItem, setEditingItem] = useState<GeneralConfigResponse | null>(
    null
  );
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const configs = data?.data?.data || [];

  const handleEdit = (item: GeneralConfigResponse) => {
    setEditingItem(item);
    setEditValue(item.configValue);
    setEditDescription(item.description);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      await updateMutation.mutateAsync({
        configKey: editingItem.configKey,
        configValue: editValue,
        description: editDescription,
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="flex flex-col rounded-lg border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" variant="shimmer" />
                    <Skeleton className="mt-2 h-3 w-40" variant="shimmer" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                </div>
                <Skeleton className="mt-2 h-6 w-24" variant="shimmer" />
                <Skeleton className="mt-2 h-3 w-36" variant="shimmer" />
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {configs.length === 0 ? (
              <p className="col-span-full text-sm text-slate-500 dark:text-white/60">
                {t('noData')}
              </p>
            ) : (
              configs.map(item => (
                <div
                  key={item.configId}
                  className="flex flex-col rounded-lg border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.configKey}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                          {item.description}
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
                    <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                      {item.configValue}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                      {t('updated')}:{' '}
                      {new Date(item.updatedAt).toLocaleString('vi-VN')}{' '}
                      {t('by')} {item.updatedByName || item.updatedByEmail}
                    </div>
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
                {t('key')}
              </div>
              <div className="mt-2 font-mono text-sm font-semibold text-slate-900 dark:text-white">
                {editingItem.configKey}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
                {t('value')}
              </label>
              <Input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                placeholder={t('valuePlaceholder')}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
                {t('description')}
              </label>
              <Input
                type="text"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={!editValue || updateMutation.isPending}
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
