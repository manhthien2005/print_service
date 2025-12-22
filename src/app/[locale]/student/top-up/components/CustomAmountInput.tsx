'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PAYMENT_CONSTANTS } from '../constants';

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
    };
    errors: {
      minAmount: string;
      mustBeMultipleOf1000: string;
    };
  };
}

export function CustomAmountInput({
  onRecharge,
  isLoading,
  t,
}: CustomAmountInputProps) {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Format number with commas (Vietnamese format)
  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    // Add commas every 3 digits from right to left
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse formatted string to number
  const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/,/g, ''), 10) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (!inputValue) {
      setCustomAmount('');
      setError('');
      return;
    }

    // Format with commas
    const formatted = formatNumberWithCommas(inputValue);
    setCustomAmount(formatted);
    setError('');

    // Parse to number for validation
    const amount = parseFormattedNumber(formatted);

    // Validate minimum amount (only if amount > 0)
    if (amount > 0 && amount < PAYMENT_CONSTANTS.MIN_CUSTOM_AMOUNT) {
      setError(t.errors.minAmount);
      return;
    }

    // Validate must be multiple of 1,000 (only if amount > 0)
    if (amount > 0 && amount % 1000 !== 0) {
      setError(t.errors.mustBeMultipleOf1000);
      return;
    }
  };

  const handleRecharge = () => {
    const amount = parseFormattedNumber(customAmount);

    if (!customAmount || amount === 0) {
      setError(t.errors.minAmount);
      return;
    }

    if (amount < PAYMENT_CONSTANTS.MIN_CUSTOM_AMOUNT) {
      setError(t.errors.minAmount);
      return;
    }

    if (amount % 1000 !== 0) {
      setError(t.errors.mustBeMultipleOf1000);
      return;
    }

    onRecharge(amount);
  };

  const amount = parseFormattedNumber(customAmount);
  const isValid =
    amount >= PAYMENT_CONSTANTS.MIN_CUSTOM_AMOUNT && amount % 1000 === 0;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.custom.title}
        </h2>
        {t.custom.description && (
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            {t.custom.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-white">
          {t.custom.amountLabel}
        </label>
        <div className="flex flex-col gap-4 md:flex-row md:flex-nowrap md:items-start">
          <div className="min-w-0 flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={handleAmountChange}
              placeholder={t.custom.amountPlaceholder}
              className="w-full border-slate-300 bg-slate-50 font-mono focus-visible:border-slate-400 focus-visible:ring-slate-400/20 dark:border-slate-700 dark:bg-slate-900/50 dark:focus-visible:border-slate-500 dark:focus-visible:ring-slate-500/20"
              disabled={isLoading}
            />
          </div>
          <div className="flex shrink-0 items-start">
            <Button
              onClick={handleRecharge}
              disabled={!isValid || isLoading}
              className="whitespace-nowrap bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? 'Đang tạo...' : t.custom.pay}
            </Button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
