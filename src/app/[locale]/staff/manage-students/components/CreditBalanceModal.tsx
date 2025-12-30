'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useCreditBalance,
  type BalanceTransactionRequest,
} from '@/lib/api/services/adminUsers';
import { toast } from '@/components/ui/Toast';

interface CreditBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName?: string;
  currentBalance?: number;
}

export const CreditBalanceModal: React.FC<CreditBalanceModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  currentBalance,
}) => {
  const t = useTranslations('staff.manageStudents.modal.creditBalance');
  const tCommon = useTranslations('Balance');
  const creditBalance = useCreditBalance();

  const [formData, setFormData] = useState<BalanceTransactionRequest>({
    amount: 0,
    reason: '',
    referenceCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        amount: 0,
        reason: '',
        referenceCode: '',
      });
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleInputChange = (
    field: keyof BalanceTransactionRequest,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = t('validation.amountRequired');
    } else if (formData.amount < 0.01) {
      newErrors.amount = t('validation.amountMin');
    }

    if (!formData.reason.trim()) {
      newErrors.reason = t('validation.reasonRequired');
    } else if (formData.reason.length > 500) {
      newErrors.reason = t('validation.reasonMaxLength');
    }

    if (formData.referenceCode && formData.referenceCode.length > 100) {
      newErrors.referenceCode = t('validation.referenceCodeMaxLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !userId) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await creditBalance.mutateAsync({
        userId,
        data: {
          amount: formData.amount,
          reason: formData.reason.trim(),
          referenceCode: formData.referenceCode?.trim() || undefined,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message || t('successMessage'));
        onClose();
      }
    } catch (error: any) {
      console.error('Error crediting balance:', error);
      const errorMessage =
        error.response?.data?.message || error.message || t('errorMessage');
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('title', { userName: userName || tCommon('defaultUserName') })}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Current Balance Display */}
          {currentBalance !== undefined && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {t('currentBalance')}:{' '}
                <span className="font-bold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(currentBalance)}
                </span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('amountLabel')} <span className="text-red-500">*</span>
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount || ''}
              onChange={e =>
                handleInputChange('amount', parseFloat(e.target.value) || 0)
              }
              placeholder={t('amountPlaceholder')}
              error={!!errors.amount}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label
              htmlFor="reason"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('reasonLabel')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              value={formData.reason}
              onChange={e => handleInputChange('reason', e.target.value)}
              placeholder={t('reasonPlaceholder')}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                errors.reason
                  ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                  : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
              } text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white dark:placeholder-slate-500`}
            />
            {errors.reason && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.reason}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formData.reason.length}/500 {t('characters')}
            </p>
          </div>

          {/* Reference Code */}
          <div className="space-y-2">
            <label
              htmlFor="referenceCode"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('referenceCodeLabel')}
            </label>
            <Input
              id="referenceCode"
              value={formData.referenceCode}
              onChange={e => handleInputChange('referenceCode', e.target.value)}
              placeholder={t('referenceCodePlaceholder')}
              error={!!errors.referenceCode}
            />
            {errors.referenceCode && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.referenceCode}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('referenceCodeHint')}
            </p>
          </div>

          {errors.submit && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200/50 pt-4 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border border-red-500 bg-red-50 text-red-600 hover:border-red-600 hover:bg-red-100 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-900/30"
            >
              {t('cancelButton')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {isLoading ? t('processingButton') : t('confirmButton')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
