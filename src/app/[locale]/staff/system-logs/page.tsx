import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { PageBackground } from '@/components/layout/PageBackground';
import AppDock from '@/components/AppDock';
import SystemLogsContent from './components/SystemLogsContent';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function SystemLogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await import(`@/locales/${locale}/pages.json`).then(
    m => m.default.staff.systemLogs
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0b0b16] dark:text-white"
      suppressHydrationWarning
    >
      <PageBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 pb-24">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-white/70">
            {t.description}
          </p>
        </header>

        <div className="flex-1">
          <SystemLogsContent />
        </div>
      </div>

      <AppDock locale={locale} />
    </main>
  );
}
