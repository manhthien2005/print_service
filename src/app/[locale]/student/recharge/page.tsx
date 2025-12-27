import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { PageBackground } from '@/components/layout/PageBackground';
import { StudentHeader } from '@/components/layout/StudentHeader';
import AppDock from '@/components/AppDock';
import { RechargeContent } from './components/RechargeContent';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function StudentRechargePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  let t;
  try {
    const pagesModule = await import(`@/locales/${locale}/pages.json`);
    t =
      pagesModule.default?.student?.recharge ||
      pagesModule.default?.student?.buyPages;
  } catch {
    t = null;
  }
  if (!t) {
    t = { title: 'Recharge', description: 'Recharge money into your account' };
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0b0b16] dark:text-white"
      suppressHydrationWarning
    >
      <PageBackground />
      <StudentHeader />

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
          <RechargeContent locale={locale} t={t} />
        </div>
      </div>

      <AppDock locale={locale} />
    </main>
  );
}
