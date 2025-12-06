'use client';

import React from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '💻';
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed right-4 top-4 z-50 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30"
      aria-label="Toggle theme"
      title={`Current: ${theme}`}
    >
      <span className="text-2xl">{getThemeIcon()}</span>
    </button>
  );
}
