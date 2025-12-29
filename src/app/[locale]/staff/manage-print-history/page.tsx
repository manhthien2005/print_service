import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { ManagePrintHistoryPageWrapper } from './components/ManagePrintHistoryPageWrapper';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function ManagePrintHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await import(`@/locales/${locale}/pages.json`).then(
    m => m.default.staff.managePrintHistory
  );

  return (
    <ManagePrintHistoryPageWrapper
      locale={locale}
      title={t.title}
      description={t.description}
    />
  );
}
