'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePrintProgressStore } from '@/lib/stores/usePrintProgressStore';

interface UseNavigationGuardOptions {
  enabled: boolean;
  currentStep: number;
  hasUploadedFile: boolean;
}

export function useNavigationGuard({
  enabled,
  currentStep,
  hasUploadedFile,
}: UseNavigationGuardOptions) {
  const { hasProgress, clearProgress } = usePrintProgressStore();
  const [showWarning, setShowWarning] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);

  // Check if we should guard navigation
  const shouldGuard = enabled && (currentStep > 1 || hasUploadedFile);

  // Handle beforeunload (browser close/refresh)
  useEffect(() => {
    if (!shouldGuard) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // For reload (F5), we allow it and let the store save progress automatically
      // The store's persist middleware will handle saving on beforeunload
      // We only show browser warning for closing tab/window

      // Note: Modern browsers ignore custom messages and show their own
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldGuard]);

  const handleConfirmNavigation = useCallback(() => {
    clearProgress();
    setShowWarning(false);
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, [clearProgress]);

  const handleCancelNavigation = useCallback(() => {
    setShowWarning(false);
    pendingNavigationRef.current = null;
  }, []);

  const attemptNavigation = useCallback(
    (navigateFn: () => void) => {
      if (!shouldGuard || !hasProgress()) {
        // No progress or guard disabled, navigate immediately
        navigateFn();
        return;
      }

      // Store navigation function and show warning
      pendingNavigationRef.current = navigateFn;
      setShowWarning(true);
    },
    [shouldGuard, hasProgress]
  );

  return {
    showWarning,
    handleConfirmNavigation,
    handleCancelNavigation,
    attemptNavigation,
  };
}
