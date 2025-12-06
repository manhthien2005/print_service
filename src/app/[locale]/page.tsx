import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-white p-8 text-black dark:bg-black dark:text-white"
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
      }}
    >
      <ThemeToggle />
      <div className="space-y-6 text-center">
        <h1
          className="m-0 block"
          style={{
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #2563eb, #9333ea, #db2777)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          SIU PRINTER
        </h1>
        <p
          className="m-0 block"
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: 'linear-gradient(to right, #a855f7, #ec4899, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CHANGE THE WORLD
        </p>
      </div>
    </main>
  );
}
