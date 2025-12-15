import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import LightRays from '@/components/LightRays';
import AppDock from '@/components/AppDock';
import { ThemeSelection } from '@/components/settings/ThemeSelection';
import { LanguageSelection } from '@/components/settings/LanguageSelection';
import { DockPositionSelection } from '@/components/settings/DockPositionSelection';
import { MusicPlayer } from '@/components/settings/MusicPlayer';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await import(`@/locales/${locale}/pages.json`).then(
    m => m.default.staff.settings
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0b0b16] dark:text-white"
      suppressHydrationWarning
    >
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.2}
        lightSpread={0.6}
        rayLength={1.2}
        followMouse
        mouseInfluence={0.2}
        noiseAmount={0}
        distortion={0}
        asBackground
        className="hidden opacity-100 dark:block"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_80%_5%,rgba(14,165,233,0.09),transparent_32%)] dark:hidden" />
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_50%_-5%,rgba(255,255,255,0.11),transparent_45%),radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(148,163,184,0.14),transparent_32%)] dark:block" />
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.58)_60%,rgba(0,0,0,0.78)_100%)] dark:block" />

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
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <ThemeSelection copy={t.appearance} />
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <LanguageSelection copy={t.language} />
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <DockPositionSelection copy={t.dockPosition} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              {t.musicPlayer ? (
                <MusicPlayer copy={t.musicPlayer} />
              ) : (
                <p className="text-sm text-slate-600 dark:text-white/70">
                  {t.comingSoon}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AppDock locale={locale} />
    </main>
  );
}
