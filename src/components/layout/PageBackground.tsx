'use client';

import React from 'react';
import LightRays from '@/components/LightRays';

type PageBackgroundProps = {
  /** Customize light mode accent color */
  lightAccent?: string;
  /** Customize dark mode ray color */
  darkRaysColor?: string;
};

/**
 * Shared background treatment that supports both light and dark themes.
 * - Light: subtle blue radial accents on a pale background.
 * - Dark: animated light rays with layered gradients.
 */
export function PageBackground({
  lightAccent = 'rgba(59,130,246,0.08)',
  darkRaysColor = '#ffffff',
}: PageBackgroundProps) {
  return (
    <>
      <LightRays
        raysOrigin="top-center"
        raysColor={darkRaysColor}
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
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,var(--light-accent,rgba(59,130,246,0.08)),transparent_35%),radial-gradient(circle_at_80%_5%,var(--light-accent-2,rgba(14,165,233,0.09)),transparent_32%)] dark:hidden"
        style={
          {
            '--light-accent': lightAccent,
            '--light-accent-2': lightAccent.replace('0.08', '0.09'),
          } as React.CSSProperties
        }
      />
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_50%_-5%,rgba(255,255,255,0.11),transparent_45%),radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(148,163,184,0.14),transparent_32%)] dark:block" />
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.58)_60%,rgba(0,0,0,0.78)_100%)] dark:block" />
    </>
  );
}
