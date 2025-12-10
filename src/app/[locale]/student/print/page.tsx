import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { PageBackground } from '@/components/layout/PageBackground';
import AppDock from '@/components/AppDock';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function StudentPrintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await import(`@/locales/${locale}/pages.json`).then(
    m => m.default.student.print
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0b0b16] dark:text-white"
      suppressHydrationWarning
    >
      <PageBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-white/70">
            {t.description}
          </p>
        </header>

        <div className="flex-1">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <p className="text-slate-700 dark:text-white/70">
              Print Document content coming soon...
            </p>
          </div>
        </div>
      </div>

      <AppDock locale={locale} />
    </main>
  );
}
