'use client';

import { useState, useEffect } from 'react';
import { NavigationGuardProvider } from '@/lib/providers/NavigationGuardProvider';

interface NavigationGuardProviderWrapperProps {
  children: React.ReactNode;
}

export function NavigationGuardProviderWrapper({
  children,
}: NavigationGuardProviderWrapperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  // Listen for step changes from PrintPageContent
  useEffect(() => {
    const handleStepChange = (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      setCurrentStep(customEvent.detail);
    };

    const handleHasFileChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setHasUploadedFile(customEvent.detail);
    };

    window.addEventListener('print-wizard-step-change', handleStepChange);
    window.addEventListener(
      'print-wizard-has-file-change',
      handleHasFileChange
    );

    return () => {
      window.removeEventListener('print-wizard-step-change', handleStepChange);
      window.removeEventListener(
        'print-wizard-has-file-change',
        handleHasFileChange
      );
    };
  }, []);

  return (
    <NavigationGuardProvider
      enabled={true}
      currentStep={currentStep}
      hasUploadedFile={hasUploadedFile}
    >
      {children}
    </NavigationGuardProvider>
  );
}
