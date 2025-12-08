import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  const [commonMessages, pagesMessages] = await Promise.all([
    import(`../../locales/${locale}/common.json`),
    import(`../../locales/${locale}/pages.json`),
  ]);

  return {
    locale,
    messages: {
      ...commonMessages.default,
      ...pagesMessages.default,
    },
  };
});
