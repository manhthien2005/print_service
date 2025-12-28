'use client';

import React, { useState } from 'react';
import {
  usePermittedFileTypes,
  useCreatePermittedFileType,
  useUpdatePermittedFileType,
  useDeletePermittedFileType,
  type PermittedFileTypeResponse,
  type CreatePermittedFileTypeRequest,
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

export function PermittedFileTypesSection() {
  const t = useTranslations('staff.configuration.permittedFileTypes');
  const { data, isLoading, error } = usePermittedFileTypes();
  const createMutation = useCreatePermittedFileType();
  const updateMutation = useUpdatePermittedFileType();
  const deleteMutation = useDeletePermittedFileType();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<PermittedFileTypeResponse | null>(null);
  const [formData, setFormData] = useState<CreatePermittedFileTypeRequest>({
    fileExtension: '',
    mimeType: '',
    description: '',
    isPermitted: true,
  });

  const fileTypes = data?.data?.data || [];

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success(t('createSuccess'));
      setIsCreateModalOpen(false);
      setFormData({
        fileExtension: '',
        mimeType: '',
        description: '',
        isPermitted: true,
      });
    } catch (error) {
      toast.error(t('createError'));
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await updateMutation.mutateAsync({
        fileTypeId: editingItem.fileTypeId,
        data: formData,
      });
      toast.success(t('updateSuccess'));
      setEditingItem(null);
    } catch (error) {
      toast.error(t('updateError'));
    }
  };

  const handleDelete = async (fileTypeId: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      await deleteMutation.mutateAsync(fileTypeId);
      toast.success(t('deleteSuccess'));
    } catch (error) {
      toast.error(t('deleteError'));
    }
  };

  const handleEdit = (item: PermittedFileTypeResponse) => {
    setEditingItem(item);
    setFormData({
      fileExtension: item.fileExtension,
      mimeType: item.mimeType,
      description: item.description,
      isPermitted: item.isPermitted,
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
            <Skeleton className="h-9 w-32 rounded" variant="shimmer" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="flex flex-col rounded-lg border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-16" variant="shimmer" />
                    <Skeleton className="mt-2 h-4 w-32" variant="shimmer" />
                    <Skeleton className="mt-2 h-3 w-40" variant="shimmer" />
                  </div>
                  <div className="ml-2 flex flex-col gap-1">
                    <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                    <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                  </div>
                </div>
                <Skeleton className="h-3 w-20" variant="shimmer" />
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
          <CardTitle>Loại file được phép</CardTitle>
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
              {t('addFileType')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {fileTypes.length === 0 ? (
              <p className="col-span-full text-sm text-slate-500 dark:text-white/60">
                {t('noData')}
              </p>
            ) : (
              fileTypes.map(item => (
                <div
                  key={item.fileTypeId}
                  className="flex flex-col rounded-lg border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        .{item.fileExtension}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-white/70">
                        {item.description}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                        {item.mimeType}
                      </div>
                    </div>
                    <div className="ml-2 flex flex-col gap-1">
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
                        onClick={() => handleDelete(item.fileTypeId)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div
                    className={`text-xs ${
                      item.isPermitted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.isPermitted ? t('permitted') : t('notPermitted')}
                  </div>
                  {item.updatedAt && (
                    <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
                      {t('updated')}:{' '}
                      {new Date(item.updatedAt).toLocaleString('vi-VN')}
                      {(item.updatedByName || item.updatedByEmail) && (
                        <>
                          {' '}
                          {t('by')} {item.updatedByName || item.updatedByEmail}
                        </>
                      )}
                    </div>
                  )}
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
            fileExtension: '',
            mimeType: '',
            description: '',
            isPermitted: true,
          });
        }}
        title={editingItem ? t('editTitle') : t('createTitle')}
        size="md"
      >
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('fileExtension')}
            </label>
            <Input
              type="text"
              value={formData.fileExtension}
              onChange={e =>
                setFormData({ ...formData, fileExtension: e.target.value })
              }
              placeholder={t('fileExtensionPlaceholder')}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('mimeType')}
            </label>
            <Input
              type="text"
              value={formData.mimeType}
              onChange={e =>
                setFormData({ ...formData, mimeType: e.target.value })
              }
              placeholder={t('mimeTypePlaceholder')}
              className="w-full"
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
                checked={formData.isPermitted}
                onChange={e =>
                  setFormData({ ...formData, isPermitted: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-white/70">
                {t('isPermitted')}
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={editingItem ? handleUpdate : handleCreate}
              disabled={
                !formData.fileExtension ||
                !formData.mimeType ||
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
                  fileExtension: '',
                  mimeType: '',
                  description: '',
                  isPermitted: true,
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
