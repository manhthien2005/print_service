'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

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
      <h2 className="text-2xl font-bold text-destructive mb-4">
        {t('error')}
      </h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>{t('reset')}</Button>
    </div>
  );
}

