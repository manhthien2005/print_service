import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { PageBackground } from '@/components/layout/PageBackground';
import AppDock from '@/components/AppDock';
import StaffDashboard from './components/StaffDashboard';

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
        <StaffDashboard locale={locale} t={t} />
      </div>

      <AppDock locale={locale} />
    </main>
  );
}
