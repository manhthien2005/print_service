'use client';

import React from 'react';
import { StaffOnly } from '@/components/auth/StaffOnly';
import { PageBackground } from '@/components/layout/PageBackground';
import AppDock from '@/components/AppDock';
import { ManagePrintHistoryContent } from './ManagePrintHistoryContent';

interface ManagePrintHistoryPageWrapperProps {
  locale: string;
  title: string;
  description: string;
}

export function ManagePrintHistoryPageWrapper({
  locale,
  title,
  description,
}: ManagePrintHistoryPageWrapperProps) {
  return (
    <StaffOnly>
      <main
        className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0b0b16] dark:text-white"
        suppressHydrationWarning
      >
        <PageBackground />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-white/70">
              {description}
            </p>
          </header>

          <div className="flex-1">
            <ManagePrintHistoryContent />
          </div>
        </div>

        <AppDock locale={locale} />
      </main>
    </StaffOnly>
  );
}
