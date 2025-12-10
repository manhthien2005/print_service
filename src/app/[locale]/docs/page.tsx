import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import AppDock from '@/components/AppDock';
import LightPillar from '@/components/LightPillar';
import DocsNavContent from '@/components/DocsNavContent';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = {
    vi: {
      sections: [
        { id: 'intro', title: 'Giới Thiệu trang web' },
        { id: 'guide', title: 'Hướng dẫn sử dụng' },
        { id: 'info', title: 'Thông tin' },
      ] as const,
      heading: 'Đang phát triển',
      body: 'Nội dung sẽ được cập nhật sau.',
      nav: { home: 'Trang chủ', docs: 'Tài liệu' },
    },
    en: {
      sections: [
        { id: 'intro', title: 'Introduction' },
        { id: 'guide', title: 'How to use' },
        { id: 'info', title: 'Information' },
      ] as const,
      heading: 'Under development',
      body: 'Content will be updated soon.',
      nav: { home: 'Home', docs: 'Docs' },
    },
  };

  const t = locale === 'vi' ? copy.vi : copy.en;
  const sections = [...t.sections];

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0b0b16] text-white"
      suppressHydrationWarning
    >
      <div className="absolute inset-0">
        <LightPillar
          topColor="#9FA3C8"
          bottomColor="#5227FF"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3.4}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={120}
          interactive={false}
          mixBlendMode="screen"
          className="opacity-95"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-5%,rgba(255,255,255,0.10),transparent_45%),radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(148,163,184,0.14),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.62)_60%,rgba(0,0,0,0.82)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-cyan-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 8V4.8c0-.45.36-.81.81-.81h8.38c.45 0 .81.36.81.81V8M7 16H5.2A1.2 1.2 0 0 1 4 14.8V11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3.8c0 .66-.54 1.2-1.2 1.2H17M7 12.5h.01M9 16h6m-6 3h6c.55 0 1-.45 1-1v-4H8v4c0 .55.45 1 1 1Z"
                />
              </svg>
            </div>
            <div className="text-base font-semibold tracking-wide text-white/90">
              SmartPrint
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-white/80">
            <a href="/" className="transition hover:text-white">
              {t.nav.home}
            </a>
            <a href="/docs" className="transition hover:text-white">
              {t.nav.docs}
            </a>
          </nav>
        </header>

        <DocsNavContent
          sections={sections}
          contentHeading={t.heading}
          contentBody={t.body}
        />
      </div>

      <AppDock locale={locale} />
    </main>
  );
}
