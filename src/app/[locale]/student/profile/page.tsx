import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { PageBackground } from '@/components/layout/PageBackground';
import { StudentHeader } from '@/components/layout/StudentHeader';
import AppDock from '@/components/AppDock';
import StudentProfileContent from './components/StudentProfileContent';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await import(`@/locales/${locale}/pages.json`).then(
    m => m.default.student.profile
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0b0b16] dark:text-white"
      suppressHydrationWarning
    >
      <PageBackground />
      <StudentHeader />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-20 pt-10">
        <div className="flex-1">
          <StudentProfileContent locale={locale} t={t} />
        </div>
      </div>

      <AppDock locale={locale} />
    </main>
  );
}
