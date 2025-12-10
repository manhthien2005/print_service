import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { PageBackground } from '@/components/layout/PageBackground';
import AppDock from '@/components/AppDock';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function StaffDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await import(`@/locales/${locale}/pages.json`).then(
    m => m.default.dashboard
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0b0b16] dark:text-white"
      suppressHydrationWarning
    >
      <PageBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white">{t.title}</h1>
          <p className="mt-2 text-white/70">{t.welcome}</p>
        </header>

        <div className="flex-1">
          {/* Dashboard content will be added here */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <p className="text-white/60">
              Staff Dashboard content coming soon...
            </p>
          </div>
        </div>
      </div>

      <AppDock locale={locale} />
    </main>
  );
}
