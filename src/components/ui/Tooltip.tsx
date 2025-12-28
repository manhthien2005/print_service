'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  children: React.ReactElement;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-blue-50/95 dark:border-t-blue-500/20',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-b-blue-50/95 dark:border-b-blue-500/20',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-blue-50/95 dark:border-l-blue-500/20',
    right:
      'right-full top-1/2 -translate-y-1/2 border-r-blue-50/95 dark:border-r-blue-500/20',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-blue-50/95 px-2 py-1 text-xs font-medium text-blue-700 shadow-lg backdrop-blur-sm transition-opacity dark:bg-blue-500/20 dark:text-blue-200',
            sideClasses[side],
            className
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              'absolute h-0 w-0 border-4 border-transparent',
              arrowClasses[side]
            )}
          />
        </div>
      )}
    </div>
  );
}
