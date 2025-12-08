import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import LightRays from '@/components/LightRays';
import AppDock from '@/components/AppDock';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function ManageStudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await import(`@/locales/${locale}/pages.json`).then(m => m.default.staff.manageStudents);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0b0b16] text-white"
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
        className="opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-5%,rgba(255,255,255,0.11),transparent_45%),radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(148,163,184,0.14),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.58)_60%,rgba(0,0,0,0.78)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white">{t.title}</h1>
          <p className="mt-2 text-white/70">{t.description}</p>
        </header>

        <div className="flex-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <p className="text-white/60">Manage Students content coming soon...</p>
          </div>
        </div>
      </div>

      <AppDock locale={locale} />
    </main>
  );
}

