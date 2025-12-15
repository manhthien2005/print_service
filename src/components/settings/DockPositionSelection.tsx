'use client';

import React from 'react';
import {
  useDockPositionStore,
  type DockPosition,
} from '@/lib/stores/useDockPositionStore';
import { cn } from '@/lib/utils/cn';

type DockPositionCopy = {
  title: string;
  description: string;
  leftTitle: string;
  leftDescription: string;
  rightTitle: string;
  rightDescription: string;
  bottomTitle: string;
  bottomDescription: string;
  activeLabel?: string;
};

function LeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
      <path d="M3 3v18" />
    </svg>
  );
}

function RightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
      <path d="M21 3v18" />
    </svg>
  );
}

function BottomIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h18M6 12h12M9 12h6" />
      <path d="M3 21h18" />
    </svg>
  );
}

function DockPreview({
  position,
  active,
}: {
  position: DockPosition;
  active: boolean;
}) {
  const getPreviewContent = () => {
    switch (position) {
      case 'left':
        return (
          <div className="relative h-full w-full">
            {/* Dock bar on the left, centered vertically */}
            <div className="absolute left-2 top-1/2 flex h-16 w-8 -translate-y-1/2 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-black/40 p-1">
              <div className="h-2 w-2 rounded-full bg-white/60" />
              <div className="h-2 w-2 rounded-full bg-white/60" />
              <div className="h-2 w-2 rounded-full bg-white/60" />
            </div>
          </div>
        );
      case 'right':
        return (
          <div className="relative h-full w-full">
            {/* Dock bar on the right, centered vertically */}
            <div className="absolute right-2 top-1/2 flex h-16 w-8 -translate-y-1/2 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-black/40 p-1">
              <div className="h-2 w-2 rounded-full bg-white/60" />
              <div className="h-2 w-2 rounded-full bg-white/60" />
              <div className="h-2 w-2 rounded-full bg-white/60" />
            </div>
          </div>
        );
      case 'bottom':
      default:
        return (
          <div className="relative flex h-full w-full items-end justify-center">
            {/* Dock bar at the bottom, centered horizontally */}
            <div className="mb-2 flex h-8 w-32 items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-black/40 p-1">
              <div className="h-2 w-2 rounded-full bg-white/60" />
              <div className="h-2 w-2 rounded-full bg-white/60" />
              <div className="h-2 w-2 rounded-full bg-white/60" />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'mt-4 h-28 w-full overflow-hidden rounded-lg border transition-all duration-200',
        active
          ? 'border-cyan-300/60 shadow-[0_20px_60px_rgba(14,165,233,0.18)] dark:border-cyan-400/40 dark:shadow-[0_20px_60px_rgba(14,165,233,0.25)]'
          : 'border-slate-200/70 dark:border-white/10'
      )}
    >
      <div className="flex h-full items-center bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900 dark:from-[#0b1020] dark:via-[#0c1328] dark:to-black dark:text-white">
        {getPreviewContent()}
      </div>
    </div>
  );
}

type DockPositionCardProps = {
  value: DockPosition;
  title: string;
  description: string;
  active: boolean;
  activeLabel?: string;
  onSelect: (value: DockPosition) => void;
};

function DockPositionCard({
  value,
  title,
  description,
  active,
  activeLabel,
  onSelect,
}: DockPositionCardProps) {
  const getIcon = () => {
    switch (value) {
      case 'left':
        return <LeftIcon />;
      case 'right':
        return <RightIcon />;
      case 'bottom':
      default:
        return <BottomIcon />;
    }
  };

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
          {getIcon()}
        </div>
      </div>
      <DockPreview position={value} active={active} />
    </button>
  );
}

export function DockPositionSelection({ copy }: { copy: DockPositionCopy }) {
  const { position, setPosition } = useDockPositionStore();

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

      <div className="grid gap-4 md:grid-cols-3">
        <DockPositionCard
          value="left"
          title={copy.leftTitle}
          description={copy.leftDescription}
          active={position === 'left'}
          activeLabel={copy.activeLabel}
          onSelect={setPosition}
        />
        <DockPositionCard
          value="bottom"
          title={copy.bottomTitle}
          description={copy.bottomDescription}
          active={position === 'bottom'}
          activeLabel={copy.activeLabel}
          onSelect={setPosition}
        />
        <DockPositionCard
          value="right"
          title={copy.rightTitle}
          description={copy.rightDescription}
          active={position === 'right'}
          activeLabel={copy.activeLabel}
          onSelect={setPosition}
        />
      </div>
    </section>
  );
}
