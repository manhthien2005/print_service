'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useZodForm } from '@/lib/hooks/useZodForm';
import { createUpdateAllocationSchema } from '../schemas';
import { useUpdateAllocation } from '@/lib/api/services/pageAllocation';
import { toast } from '@/components/ui/Toast';
import type { PageAllocation } from '@/lib/api/services/pageAllocation';

interface UpdateAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: PageAllocation | null;
}

export default function UpdateAllocationModal({
  isOpen,
  onClose,
  allocation,
}: UpdateAllocationModalProps) {
  const t = useTranslations('staff.pageAllocation.modals.update');
  const tValidation = useTranslations('staff.pageAllocation.validation');
  const tCommon = useTranslations('common');
  const updateMutation = useUpdateAllocation();

  const schema = createUpdateAllocationSchema((key: string) => tValidation(key));
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useZodForm(schema, {
    defaultValues: {
      quantity: 0,
      lowStockThreshold: undefined,
      note: '',
    },
  });

  useEffect(() => {
    if (allocation && isOpen) {
      setValue('quantity', allocation.quantity);
      setValue('lowStockThreshold', allocation.lowStockThreshold);
      setValue('note', '');
    }
  }, [allocation, isOpen, setValue]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: {
    quantity: number;
    lowStockThreshold?: number;
    note?: string;
  }) => {
    if (!allocation) return;

    try {
      await updateMutation.mutateAsync({
        pageSizeId: allocation.pageSizeId,
        data: {
          quantity: data.quantity,
          lowStockThreshold: data.lowStockThreshold,
          note: data.note,
        },
      });

      toast.success(t('success').replace('{sizeName}', allocation.sizeName));
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      toast.error(errorMessage);
    }
  };

  if (!allocation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="space-y-6">
          {/* Quantity */}
          <div className="space-y-2">
            <label
              htmlFor="quantity"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('quantity')} <span className="text-red-500">*</span>
            </label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="1"
              placeholder={t('quantity')}
              {...register('quantity', { valueAsNumber: true })}
              error={!!errors.quantity}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Low Stock Threshold */}
          <div className="space-y-2">
            <label
              htmlFor="threshold"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('threshold')}
            </label>
            <Input
              id="threshold"
              type="number"
              min="0"
              step="1"
              placeholder={t('thresholdPlaceholder')}
              {...register('lowStockThreshold', { valueAsNumber: true })}
              error={!!errors.lowStockThreshold}
            />
            {errors.lowStockThreshold && (
              <p className="text-xs text-red-500">
                {errors.lowStockThreshold.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label
              htmlFor="note"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('note')}
            </label>
            <textarea
              id="note"
              rows={3}
              placeholder={t('notePlaceholder')}
              {...register('note')}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:border-blue-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

