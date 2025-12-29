import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { ManageTransactionsPageWrapper } from './components/ManageTransactionsPageWrapper';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function ManageTransactionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await import(`@/locales/${locale}/pages.json`).then(
    m => m.default.staff.manageTransactions
  );

  return (
    <ManageTransactionsPageWrapper
      locale={locale}
      title={t.title}
      description={t.description}
    />
  );
}
