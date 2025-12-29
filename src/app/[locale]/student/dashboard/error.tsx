'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h2 className="mb-4 text-2xl font-bold text-destructive">{t('error')}</h2>
      <p className="mb-4 text-muted-foreground">
        {error.message || t('error')}
      </p>
      <Button onClick={reset}>{t('tryAgain')}</Button>
    </div>
  );
}
