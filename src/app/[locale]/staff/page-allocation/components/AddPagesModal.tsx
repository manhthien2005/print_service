'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useZodForm } from '@/lib/hooks/useZodForm';
import { createAddPagesSchema } from '@/app/[locale]/staff/page-allocation/schemas';
import { useAddPages } from '@/lib/api/services/pageAllocation';
import { toast } from '@/components/ui/Toast';
import { formatNumber } from '@/lib/utils/format';
import type { PageAllocation } from '@/lib/api/services/pageAllocation';

interface AddPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: PageAllocation | null;
}

export default function AddPagesModal({
  isOpen,
  onClose,
  allocation,
}: AddPagesModalProps) {
  const t = useTranslations('staff.pageAllocation.modals.addPages');
  const tValidation = useTranslations('staff.pageAllocation.validation');
  const tCommon = useTranslations('common');
  const addPagesMutation = useAddPages();

  const schema = createAddPagesSchema((key: string) => tValidation(key));
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useZodForm(schema);

  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: { quantity: number; note?: string }) => {
    if (!allocation) return;

    try {
      await addPagesMutation.mutateAsync({
        pageSizeId: allocation.pageSizeId,
        data: {
          quantity: data.quantity,
          note: data.note,
        },
      });

      toast.success(
        t('success')
          .replace('{quantity}', formatNumber(data.quantity))
          .replace('{sizeName}', allocation.sizeName)
      );
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      toast.error(errorMessage);
    }
  };

  if (!allocation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="space-y-6">
          {/* Quantity */}
          <div className="space-y-2">
            <label
              htmlFor="quantity"
              className="text-sm font-medium text-foreground dark:text-foreground"
            >
              {t('quantity')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              placeholder={t('quantityPlaceholder')}
              {...register('quantity', { valueAsNumber: true })}
              error={!!errors.quantity}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label
              htmlFor="note"
              className="text-sm font-medium text-foreground dark:text-foreground"
            >
              {t('note')}
            </label>
            <textarea
              id="note"
              rows={3}
              placeholder={t('notePlaceholder')}
              {...register('note')}
              className="focus:ring-primary/20 dark:bg-background/5 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 dark:border-input dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-primary"
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
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
