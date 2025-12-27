'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export type TabItem<T extends string = string> = {
  value: T;
  label: string;
};

type TabsProps<T extends string = string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  const [activeRect, setActiveRect] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  }>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = useMemo(
    () => items.findIndex(item => item.value === value),
    [items, value]
  );

  // Recalculate active background position on mount, tab change, or resize
  useEffect(() => {
    const updateActiveRect = () => {
      const btn = buttonsRef.current[activeIndex];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const parentRect = btn.parentElement?.getBoundingClientRect();
        if (parentRect) {
          setActiveRect({
            width: rect.width,
            height: rect.height,
            left: rect.left - parentRect.left,
            top: rect.top - parentRect.top,
          });
        }
      }
    };

    updateActiveRect();
    window.addEventListener('resize', updateActiveRect);
    return () => window.removeEventListener('resize', updateActiveRect);
  }, [activeIndex, items.length]);

  return (
    <div className={cn('relative flex w-full items-center gap-0', className)}>
      <div
        className="pointer-events-none absolute left-0 top-0 rounded-lg border border-blue-500/50 bg-blue-500/30 transition-all duration-300 ease-out dark:border-blue-400/50 dark:bg-blue-400/20"
        style={{
          width: activeRect.width,
          height: activeRect.height,
          transform: `translate(${activeRect.left}px, ${activeRect.top}px)`,
        }}
      />
      {items.map((item, index) => {
        const isActive = value === item.value;
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.value}>
            <button
              type="button"
              onClick={() => onChange(item.value)}
              ref={el => {
                buttonsRef.current[index] = el;
              }}
              className={cn(
                'relative z-10 flex-1 px-5 py-2.5 text-center text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                isActive
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white/80'
              )}
            >
              {item.label}
            </button>
            {!isLast && (
              <div className="mx-1 h-5 w-px bg-slate-200/20 dark:bg-white/10" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
