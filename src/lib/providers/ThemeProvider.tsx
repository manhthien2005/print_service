'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  let effectiveTheme: 'light' | 'dark';
  if (theme === 'system') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } else {
    effectiveTheme = theme;
  }

  root.classList.add(effectiveTheme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return <>{children}</>;
}
