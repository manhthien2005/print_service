'use client';

import { useRef, useState } from 'react';
import { PrintWizard, PrintWizardRef } from './PrintWizard';
import { UploadedFilesTable } from './UploadedFilesTable';
import { UploadedFileItem } from '../types';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
import { NavigationWarningModal } from './NavigationWarningModal';
import { usePrintProgressStore } from '@/lib/stores/usePrintProgressStore';

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

  // Navigation guard - enabled when on print page
  const { showWarning, handleConfirmNavigation, handleCancelNavigation } =
    useNavigationGuard({
      enabled: true,
      currentStep,
      hasUploadedFile,
    });

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
