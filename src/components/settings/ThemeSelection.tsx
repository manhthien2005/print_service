'use client';

import React from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';
import { cn } from '@/lib/utils/cn';

type ThemeOption = 'light' | 'dark';

type AppearanceCopy = {
  title: string;
  description: string;
  lightTitle: string;
  lightDescription: string;
  darkTitle: string;
  darkDescription: string;
  activeLabel?: string;
};

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path
        strokeLinecap="round"
        d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.5 14.5a8.5 8.5 0 0 1-11-11 8.5 8.5 0 1 0 11 11Z"
      />
    </svg>
  );
}

function ThemePreview({
  variant,
  active,
}: {
  variant: ThemeOption;
  active: boolean;
}) {
  const sharedCard =
    'rounded-lg border bg-gradient-to-br shadow-sm transition-all duration-200';

  return (
    <div
      className={cn(
        'mt-4 h-28 w-full overflow-hidden rounded-lg border transition-all duration-200',
        active
          ? 'border-cyan-300/60 shadow-[0_20px_60px_rgba(14,165,233,0.18)] dark:border-cyan-400/40 dark:shadow-[0_20px_60px_rgba(14,165,233,0.25)]'
          : 'border-slate-200/70 dark:border-white/10'
      )}
    >
      <div
        className={cn(
          'flex h-full items-center justify-between px-4',
          variant === 'light'
            ? 'bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900'
            : 'bg-gradient-to-br from-[#0b1020] via-[#0c1328] to-black text-white'
        )}
      >
        <div className="flex flex-1 items-center gap-3">
          <div
            className={cn(
              sharedCard,
              variant === 'light'
                ? 'border-slate-200/80 from-white to-slate-100 text-slate-900'
                : 'border-white/10 from-[#0f172a] to-[#0b1221] text-white'
            )}
          >
            <div className="rounded-lg px-4 py-3 text-sm font-semibold">Aa</div>
          </div>
          <div className="space-y-1">
            <div
              className={cn(
                'h-2.5 w-24 rounded-full',
                variant === 'light' ? 'bg-slate-200' : 'bg-white/30'
              )}
            />
            <div
              className={cn(
                'h-2 w-16 rounded-full',
                variant === 'light' ? 'bg-slate-200/80' : 'bg-white/25'
              )}
            />
          </div>
        </div>
        <div
          className={cn(
            sharedCard,
            'h-14 w-16',
            variant === 'light'
              ? 'border-slate-200/80 from-white to-slate-100 text-slate-900'
              : 'border-white/10 from-[#0f172a] to-[#0b1221] text-white'
          )}
        >
          <div className="flex h-full items-center justify-center">
            {variant === 'light' ? <SunIcon /> : <MoonIcon />}
          </div>
        </div>
      </div>
    </div>
  );
}

type ThemeCardProps = {
  value: ThemeOption;
  title: string;
  description: string;
  active: boolean;
  activeLabel?: string;
  onSelect: (value: ThemeOption) => void;
};

function ThemeCard({
  value,
  title,
  description,
  active,
  activeLabel,
  onSelect,
}: ThemeCardProps) {
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
            'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
            active
              ? 'border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-400/70 dark:bg-cyan-500/20 dark:text-cyan-50'
              : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-white/70'
          )}
        >
          {value === 'light' ? <SunIcon /> : <MoonIcon />}
        </div>
      </div>
      <ThemePreview variant={value} active={active} />
    </button>
  );
}

export function ThemeSelection({ copy }: { copy: AppearanceCopy }) {
  const { theme, setTheme } = useThemeStore();

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
        <ThemeCard
          value="light"
          title={copy.lightTitle}
          description={copy.lightDescription}
          active={theme === 'light'}
          activeLabel={copy.activeLabel}
          onSelect={setTheme}
        />
        <ThemeCard
          value="dark"
          title={copy.darkTitle}
          description={copy.darkDescription}
          active={theme === 'dark'}
          activeLabel={copy.activeLabel}
          onSelect={setTheme}
        />
      </div>
    </section>
  );
}

