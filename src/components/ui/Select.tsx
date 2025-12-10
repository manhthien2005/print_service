'use client';

import {
  SelectHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const internalRef = useRef<HTMLSelectElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Expose ref to parent
    useImperativeHandle(
      ref,
      () => internalRef.current as HTMLSelectElement,
      []
    );

    useEffect(() => {
      const selectElement = internalRef.current;
      if (!selectElement) return;

      const handleMouseDown = () => {
        // Clear any pending timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Toggle open state
        setIsOpen(prev => !prev);
      };

      const handleBlur = () => {
        // Delay to allow option selection
        timeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 150);
      };

      const handleChange = () => {
        setIsOpen(false);
      };

      selectElement.addEventListener('mousedown', handleMouseDown);
      selectElement.addEventListener('blur', handleBlur);
      selectElement.addEventListener('change', handleChange);

      return () => {
        selectElement.removeEventListener('mousedown', handleMouseDown);
        selectElement.removeEventListener('blur', handleBlur);
        selectElement.removeEventListener('change', handleChange);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-10 w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 pr-8 text-sm text-slate-900 ring-offset-background transition-all hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:border-white/30 dark:hover:bg-white/5',
            error &&
              'border-red-500 focus-visible:ring-red-500 dark:border-red-500',
            isOpen && 'ring-2 ring-blue-500 ring-offset-2',
            className
          )}
          ref={internalRef}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
