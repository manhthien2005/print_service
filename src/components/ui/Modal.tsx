'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
  closeOnClickOutside?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className,
  closeOnClickOutside = true,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={e => {
        if (closeOnClickOutside && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" />

      {/* Modal */}
      <div
        className={cn(
          'relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-white/90 shadow-2xl backdrop-blur-xl transition-all dark:border-white/10 dark:bg-slate-900/90',
          sizeClasses[size],
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-slate-200/50 px-6 py-4 dark:border-white/10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full border border-slate-200/50 hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 text-slate-500 dark:text-slate-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="scrollbar-thin max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden">
          <div className="pr-2">{children}</div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  // Use portal to render modal outside of current DOM tree
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

Modal.displayName = 'Modal';
