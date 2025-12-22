'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';

function applyTheme(theme: 'light' | 'dark') {
  const root = globalThis.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
}
