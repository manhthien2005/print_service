'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PAYMENT_CONSTANTS } from '@/app/[locale]/student/recharge/constants';
import { useLocale } from 'next-intl';

interface CustomAmountInputProps {
  onRecharge: (amount: number) => void;
  isLoading?: boolean;
  t: {
    custom: {
      title: string;
      description: string;
      minAmount: string;
      amountLabel: string;
      amountPlaceholder: string;
      depositAmount: string;
      pay: string;
      creating?: string;
    };
    errors: {
      minAmount: string;
    };
  };
}

export function CustomAmountInput({
  onRecharge,
  isLoading,
  t,
}: CustomAmountInputProps) {
  const locale = useLocale();
  const [customAmount, setCustomAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setError('');

    const amount = parseInt(value, 10);
    if (
      value &&
      (isNaN(amount) || amount < PAYMENT_CONSTANTS.MIN_CUSTOM_AMOUNT)
    ) {
      setError(t.errors.minAmount);
    }
  };

  const handleRecharge = () => {
    const amount = parseInt(customAmount, 10);
    if (
      !customAmount ||
      isNaN(amount) ||
      amount < PAYMENT_CONSTANTS.MIN_CUSTOM_AMOUNT
    ) {
      setError(t.errors.minAmount);
      return;
    }
    onRecharge(amount);
  };

  const amount = parseInt(customAmount, 10);
  const isValid =
    !isNaN(amount) && amount >= PAYMENT_CONSTANTS.MIN_CUSTOM_AMOUNT;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.custom.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
          {t.custom.description}
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-white">
            {t.custom.amountLabel}
          </label>
          <Input
            type="number"
            min={PAYMENT_CONSTANTS.MIN_CUSTOM_AMOUNT}
            step="1000"
            value={customAmount}
            onChange={handleAmountChange}
            placeholder={t.custom.amountPlaceholder}
            className="w-full"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {customAmount && isValid && (
            <div className="mt-2 text-sm text-slate-600 dark:text-white/70">
              <div>
                {t.custom.depositAmount}:{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatPrice(amount)}
                </span>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={handleRecharge}
          disabled={!isValid || isLoading}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? t.custom.creating : t.custom.pay}
        </Button>
      </div>
    </div>
  );
}
