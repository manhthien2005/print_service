'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

// Fallback translations for error boundary
// Since error.tsx is at root level and doesn't have NextIntlClientProvider context,
// we use fallback translations based on URL locale
const translations: Record<string, Record<string, string>> = {
  en: {
    error: 'Error',
    reset: 'Reset',
  },
  vi: {
    error: 'Lỗi',
    reset: 'Đặt lại',
  },
};

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const possibleLocale = segments[0];
  return possibleLocale === 'vi' || possibleLocale === 'en'
    ? possibleLocale
    : 'en';
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = translations[locale] || translations.en;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h2 className="mb-4 text-2xl font-bold text-destructive">{t.error}</h2>
      <p className="mb-4 text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>{t.reset}</Button>
    </div>
  );
}
