'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Header() {
  const t = useTranslations('common');

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold">
          Print Service
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost">{t('welcome')}</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
