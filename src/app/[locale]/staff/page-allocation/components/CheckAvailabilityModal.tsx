'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useZodForm } from '@/lib/hooks/useZodForm';
import { createCheckAvailabilitySchema } from '../schemas';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="md"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Pages Needed */}
          <div className="space-y-2">
            <label
              htmlFor="pagesNeeded"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('pagesNeeded')} <span className="text-red-500">*</span>
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
              <p className="text-xs text-red-500">
                {errors.pagesNeeded.message}
              </p>
            )}
          </div>

          {/* Check Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
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
                        ? 'text-green-300'
                        : 'text-red-300'
                    }`}
                  >
                    {checkResult.available
                      ? t('result.available')
                      : t('result.notAvailable')}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {t('result.currentQuantity')}:
                      </span>
                      <span className="text-white">
                        {formatNumber(checkResult.currentQuantity)}
                      </span>
                    </div>
                    {!checkResult.available && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          {t('result.shortage')}:
                        </span>
                        <span className="text-red-300">
                          {formatNumber(checkResult.shortage)}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 rounded-lg bg-white/5 p-3">
                      <div className="text-xs text-slate-400">
                        {t('result.message')}:
                      </div>
                      <div className="mt-1 text-sm text-white">
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
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">
              {error instanceof Error
                ? error.message
                : 'An error occurred while checking availability'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

