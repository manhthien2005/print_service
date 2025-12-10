import React from 'react';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import LightRays from '@/components/LightRays';
import ShinyText from '@/components/ShinyText';
import TextType from '@/components/TextType';

const copy = {
  en: {
    badge: 'Enjoy Our Service! :)',
    titles: [
      'Student printing made fast and simple',
      'Print anywhere, anytime',
      'Your documents, ready in seconds',
      'Smart printing for smart students',
    ],
    ctaPrimary: 'Start printing',
    ctaSecondary: 'View guide',
    home: 'Home',
    docs: 'Docs',
  },
  vi: {
    badge: 'Enjoy Our Service! :)',
    titles: [
      'Dịch vụ in cho sinh viên, nhanh và gọn',
      'In mọi lúc, mọi nơi',
      'Tài liệu của bạn, sẵn sàng trong vài giây',
      'In thông minh cho sinh viên thông minh',
    ],
    ctaPrimary: 'Bắt đầu in',
    ctaSecondary: 'Xem hướng dẫn',
    home: 'Trang chủ',
    docs: 'Tài liệu',
  },
};

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = locale in copy ? copy[locale as 'en' | 'vi'] : copy.en;

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0b0b16] text-white"
      suppressHydrationWarning
    >
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.5}
        lightSpread={0.85}
        rayLength={1.6}
        fadeDistance={1.25}
        saturation={1.1}
        followMouse
        mouseInfluence={0.2}
        noiseAmount={0}
        distortion={0.05}
        asBackground
        className="opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-5%,rgba(255,255,255,0.11),transparent_45%),radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(148,163,184,0.14),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.58)_60%,rgba(0,0,0,0.78)_100%)]" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img
          src="/images/printer.png"
          alt=""
          aria-hidden
          className="w-[760px] max-w-[82vw] translate-y-6 opacity-[0.28] mix-blend-screen drop-shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white backdrop-blur-md">
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
            <Link href="/" className="transition hover:text-white">
              {t.home}
            </Link>
            <Link href="/docs" className="transition hover:text-white">
              {t.docs}
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-sm">
            <ShinyText text={t.badge} speed={3} className="text-cyan-100/80" />
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            <TextType
              text={t.titles}
              typingSpeed={100}
              pauseDuration={2800}
              deletingSpeed={30}
              showCursor
              cursorCharacter="|"
              loop
              startOnVisible
            />
          </h1>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-slate-900 shadow-[0_12px_35px_rgba(255,255,255,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 text-sm font-semibold text-white shadow-none transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
