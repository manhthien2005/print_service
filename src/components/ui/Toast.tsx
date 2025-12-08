'use client';

import { ReactNode, useEffect } from 'react';
import { Toaster, toast as sonnerToast } from 'sonner';

const MAX_TOASTS = 3;
const toastQueue: string[] = [];

function manageToastLimit(): string | undefined {
  // Dismiss oldest toast if queue is full
  if (toastQueue.length >= MAX_TOASTS) {
    const oldestId = toastQueue.shift();
    if (oldestId) {
      sonnerToast.dismiss(oldestId);
    }
  }
  return undefined;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Clear queue on mount
    toastQueue.length = 0;
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          classNames: {
            toast: 'border shadow-lg',
            success:
              'bg-emerald-50/95 text-emerald-800 border-emerald-300/60 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-700/40',
            error:
              'bg-red-50/95 text-red-800 border-red-300/60 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700/40',
          },
        }}
      />
      <style jsx global>{`
        @keyframes toast-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        [data-sonner-toast][data-type='success'] {
          background-color: rgb(236 253 245 / 0.95) !important;
          color: rgb(6 78 59) !important;
          border-color: rgb(110 231 183 / 0.6) !important;
        }
        [data-sonner-toast][data-type='error'] {
          background-color: rgb(254 242 242 / 0.95) !important;
          color: rgb(153 27 27) !important;
          border-color: rgb(252 165 165 / 0.6) !important;
        }
        [data-sonner-toaster] {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        [data-sonner-toast] {
          animation: toast-slide-up 0.3s ease-out !important;
        }
        [data-sonner-toaster] [data-sonner-toast]:nth-child(n + 4) {
          display: none !important;
        }
      `}</style>
    </>
  );
}

// Custom toast functions with limit management
export const toast = {
  success: (message: string) => {
    manageToastLimit();
    const toastId = sonnerToast.success(message);
    if (toastId) {
      toastQueue.push(String(toastId));
    }
    return toastId;
  },
  error: (message: string) => {
    manageToastLimit();
    const toastId = sonnerToast.error(message);
    if (toastId) {
      toastQueue.push(String(toastId));
    }
    return toastId;
  },
  info: (message: string) => {
    manageToastLimit();
    const toastId = sonnerToast.info(message);
    if (toastId) {
      toastQueue.push(String(toastId));
    }
    return toastId;
  },
  warning: (message: string) => {
    manageToastLimit();
    const toastId = sonnerToast.warning(message);
    if (toastId) {
      toastQueue.push(String(toastId));
    }
    return toastId;
  },
  dismiss: sonnerToast.dismiss,
};
