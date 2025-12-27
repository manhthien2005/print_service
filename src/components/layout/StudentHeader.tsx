'use client';

import React from 'react';
import { NotificationContainer } from '@/components/notifications';

/**
 * Header component for student pages
 * Displays notification icon in the top right corner
 * Fixed positioning with proper spacing to avoid covering content
 */
export function StudentHeader() {
  return (
    <header className="fixed right-0 top-0 z-50 p-4 sm:p-6">
      <div className="flex items-center justify-end">
        <NotificationContainer />
      </div>
    </header>
  );
}
