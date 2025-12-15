import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactQueryProvider } from '@/lib/providers/ReactQueryProvider';
import { ThemeProvider } from '@/lib/providers/ThemeProvider';
import { MusicPlayerProvider } from '@/lib/providers/MusicPlayerProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { locales } from '@/lib/i18n/config';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider>
        <ReactQueryProvider>
          <MusicPlayerProvider>
          <ToastProvider>{children}</ToastProvider>
          </MusicPlayerProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
