'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

function FlagIcon({ locale }: { locale: Locale }) {
  const flagSrc =
    locale === 'en'
      ? '/images/flag-us-svgrepo-com.svg'
      : '/images/flag-vn-svgrepo-com.svg';

  return (
    <Image
      src={flagSrc}
      alt={locale === 'en' ? 'US Flag' : 'Vietnam Flag'}
      width={20}
      height={20}
      className="h-5 w-5 object-contain"
    />
  );
}

function LanguagePreview({
  locale,
  active,
}: {
  locale: Locale;
  active: boolean;
}) {
  const languageNames: Record<Locale, string> = {
    en: 'English',
    vi: 'Tiếng Việt',
  };

  const flags: Record<Locale, string> = {
    en: '🇺🇸',
    vi: '🇻🇳',
  };

  return (
    <div
      className={cn(
        'mt-4 h-20 w-full overflow-hidden rounded-lg border transition-all duration-200',
        active
          ? 'border-cyan-300/60 shadow-[0_20px_60px_rgba(14,165,233,0.18)] dark:border-cyan-400/40 dark:shadow-[0_20px_60px_rgba(14,165,233,0.25)]'
          : 'border-slate-200/70 dark:border-white/10'
      )}
    >
      <div
        className={cn(
          'flex h-full items-center justify-center gap-3',
          'bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900 dark:from-[#0b1020] dark:via-[#0c1328] dark:to-black dark:text-white'
        )}
      >
        <span
          className="text-xl leading-none"
          style={{
            display: 'inline-block',
            lineHeight: '1.5rem',
            verticalAlign: 'middle',
          }}
        >
          {flags[locale]}
        </span>
        <span
          className="text-lg font-semibold leading-none"
          style={{
            display: 'inline-block',
            lineHeight: '1.5rem',
            verticalAlign: 'middle',
          }}
        >
          {languageNames[locale]}
        </span>
      </div>
    </div>
  );
}

type LanguageCardProps = {
  value: Locale;
  title: string;
  description: string;
  active: boolean;
  activeLabel?: string;
  onSelect: (value: Locale) => void;
};

function LanguageCard({
  value,
  title,
  description,
  active,
  activeLabel,
  onSelect,
}: LanguageCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'group relative flex h-full flex-col rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
        active
          ? 'border-cyan-300/80 bg-cyan-50/70 shadow-[0_20px_50px_rgba(14,165,233,0.12)] ring-1 ring-cyan-200/70 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:ring-cyan-400/60'
          : 'border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.05)] hover:-translate-y-[1px] hover:border-cyan-200/80 hover:shadow-[0_15px_45px_rgba(14,165,233,0.12)] dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-400/50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {title}
            </span>
            {active ? (
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-100">
                {activeLabel ?? 'Active'}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-colors',
            active
              ? 'border-cyan-300 bg-cyan-50 dark:border-cyan-400/70 dark:bg-cyan-500/20'
              : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/10'
          )}
        >
          <FlagIcon locale={value} />
        </div>
      </div>
      <LanguagePreview locale={value} active={active} />
    </button>
  );
}

type LanguageCopy = {
  title: string;
  description: string;
  englishTitle: string;
  englishDescription: string;
  vietnameseTitle: string;
  vietnameseDescription: string;
  activeLabel?: string;
};

export function LanguageSelection({ copy }: { copy: LanguageCopy }) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] as Locale;

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    // Replace the locale in the pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300/90">
          {copy.title}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {copy.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <LanguageCard
          value="en"
          title={copy.englishTitle}
          description={copy.englishDescription}
          active={currentLocale === 'en'}
          activeLabel={copy.activeLabel}
          onSelect={handleLanguageChange}
        />
        <LanguageCard
          value="vi"
          title={copy.vietnameseTitle}
          description={copy.vietnameseDescription}
          active={currentLocale === 'vi'}
          activeLabel={copy.activeLabel}
          onSelect={handleLanguageChange}
        />
      </div>
    </section>
  );
}
