'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { usePrintProgressStore } from '@/lib/stores/usePrintProgressStore';

interface NavigationGuardContextType {
  showWarning: boolean;
  attemptNavigation: (navigateFn: () => void) => void;
  handleConfirmNavigation: () => void;
  handleCancelNavigation: () => void;
  shouldGuard: boolean;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | null>(
  null
);

interface NavigationGuardProviderProps {
  children: React.ReactNode;
  enabled: boolean;
  currentStep: number;
  hasUploadedFile: boolean;
}

export function NavigationGuardProvider({
  children,
  enabled,
  currentStep,
  hasUploadedFile,
}: NavigationGuardProviderProps) {
  const { hasProgress, clearProgress } = usePrintProgressStore();
  const [showWarning, setShowWarning] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);

  // Check if we should guard navigation
  const shouldGuard = enabled && (currentStep > 1 || hasUploadedFile);

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

  return (
    <NavigationGuardContext.Provider
      value={{
        showWarning,
        attemptNavigation,
        handleConfirmNavigation,
        handleCancelNavigation,
        shouldGuard,
      }}
    >
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuardContext() {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    // Return a no-op implementation when context is not available
    // This allows AppDock to work even when not wrapped in provider
    return {
      showWarning: false,
      attemptNavigation: (navigateFn: () => void) => navigateFn(),
      handleConfirmNavigation: () => {},
      handleCancelNavigation: () => {},
      shouldGuard: false,
    };
  }
  return context;
}
