'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useZodForm } from '@/lib/hooks/useZodForm';
import { createCheckAvailabilitySchema } from '@/app/[locale]/staff/page-allocation/schemas';
import {
  useCheckAvailability,
  type CheckAvailabilityResponse,
} from '@/lib/api/services/pageAllocation';
import { formatNumber } from '@/lib/utils/format';
import type { PageAllocation } from '@/lib/api/services/pageAllocation';
import { Card, CardContent } from '@/components/ui/Card';

interface CheckAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: PageAllocation | null;
}

export default function CheckAvailabilityModal({
  isOpen,
  onClose,
  allocation,
}: CheckAvailabilityModalProps) {
  const t = useTranslations('staff.pageAllocation.modals.checkAvailability');
  const tValidation = useTranslations('staff.pageAllocation.validation');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('staff.pageAllocation.errors');
  const [pagesNeeded, setPagesNeeded] = useState<number | null>(null);
  const [shouldCheck, setShouldCheck] = useState(false);

  const schema = createCheckAvailabilitySchema((key: string) =>
    tValidation(key)
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useZodForm(schema);

  const { data, isLoading, error } = useCheckAvailability(
    allocation?.pageSizeId || '',
    pagesNeeded || 0,
    shouldCheck && !!allocation && !!pagesNeeded
  );

  useEffect(() => {
    if (!isOpen) {
      reset();
      setPagesNeeded(null);
      setShouldCheck(false);
    }
  }, [isOpen, reset]);

  const onSubmit = (data: { pagesNeeded: number }) => {
    setPagesNeeded(data.pagesNeeded);
    setShouldCheck(true);
  };

  const checkResult: CheckAvailabilityResponse | null =
    data?.data?.data || null;

  if (!allocation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Pages Needed */}
          <div className="space-y-2">
            <label
              htmlFor="pagesNeeded"
              className="text-sm font-medium text-slate-900 dark:text-white"
            >
              {t('pagesNeeded')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="pagesNeeded"
              type="number"
              min="1"
              step="1"
              placeholder={t('pagesNeededPlaceholder')}
              {...register('pagesNeeded', { valueAsNumber: true })}
              error={!!errors.pagesNeeded}
            />
            {errors.pagesNeeded && (
              <p className="text-xs text-destructive">
                {errors.pagesNeeded.message}
              </p>
            )}
          </div>

          {/* Check Button */}
          <div className="flex justify-end gap-3 border-t border-slate-200/50 pt-4 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border border-slate-300 bg-slate-200 text-slate-900 hover:border-slate-400 hover:bg-slate-300 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {isLoading ? t('checking') : t('check')}
            </Button>
          </div>
        </form>

        {/* Result */}
        {checkResult && (
          <div className="mt-6">
            <Card
              className={`border ${
                checkResult.available
                  ? 'border-green-400/30 bg-green-500/10'
                  : 'border-red-400/30 bg-red-500/10'
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div
                    className={`text-lg font-semibold ${
                      checkResult.available
                        ? 'text-green-300' // Success color - keep specific
                        : 'text-destructive'
                    }`}
                  >
                    {checkResult.available
                      ? t('result.available')
                      : t('result.notAvailable')}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('result.currentQuantity')}:
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        {formatNumber(checkResult.currentQuantity)}
                      </span>
                    </div>
                    {!checkResult.available && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t('result.shortage')}:
                        </span>
                        <span className="text-destructive">
                          {formatNumber(checkResult.shortage)}
                        </span>
                      </div>
                    )}
                    <div className="bg-background/5 mt-3 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">
                        {t('result.message')}:
                      </div>
                      <div className="mt-1 text-sm text-slate-900 dark:text-white">
                        {checkResult.message}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border-destructive/30 bg-destructive/10 mt-4 rounded-lg border p-4">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : tErrors('checkFailed')}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
