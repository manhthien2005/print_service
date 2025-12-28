'use client';

import { useRef, useState, useEffect } from 'react';
import {
  PrintWizard,
  PrintWizardRef,
} from '@/app/[locale]/student/print/components/PrintWizard';
import { UploadedFilesTable } from '@/app/[locale]/student/print/components/UploadedFilesTable';
import { UploadedFileItem } from '@/app/[locale]/student/print/types';
import { NavigationWarningModal } from '@/app/[locale]/student/print/components/NavigationWarningModal';
import { usePrintProgressStore } from '@/lib/stores/usePrintProgressStore';
import { useNavigationGuardContext } from '@/lib/providers/NavigationGuardProvider';

export function PrintPageContent() {
  const printWizardRef = useRef<PrintWizardRef>(null);
  const printWizardContainerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { progress } = usePrintProgressStore();

  // Check if there's an uploaded file from progress store
  const hasUploadedFile = !!(
    progress?.uploadedFile?.uploaded_file_id ||
    (currentStep > 1 && progress?.uploadedFile)
  );

  // Dispatch step change event for NavigationGuardProviderWrapper
  useEffect(() => {
    const event = new CustomEvent('print-wizard-step-change', {
      detail: currentStep,
    });
    window.dispatchEvent(event);
  }, [currentStep]);

  // Dispatch hasUploadedFile change event
  useEffect(() => {
    const event = new CustomEvent('print-wizard-has-file-change', {
      detail: hasUploadedFile,
    });
    window.dispatchEvent(event);
  }, [hasUploadedFile]);

  // Navigation guard from context
  const { showWarning, handleConfirmNavigation, handleCancelNavigation } =
    useNavigationGuardContext();

  const handleStartPrint = (file: UploadedFileItem) => {
    if (printWizardRef.current) {
      printWizardRef.current.startPrintWithFile(file);
      // Scroll to PrintWizard
      setTimeout(() => {
        printWizardContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // Only show UploadedFilesTable on step 1
  const showUploadedFilesTable = currentStep === 1;

  return (
    <>
      <div className="flex-1 space-y-6">
        <div ref={printWizardContainerRef}>
          <PrintWizard ref={printWizardRef} onStepChange={handleStepChange} />
        </div>
        {showUploadedFilesTable && (
          <UploadedFilesTable onStartPrint={handleStartPrint} />
        )}
      </div>
      <NavigationWarningModal
        isOpen={showWarning}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </>
  );
}
