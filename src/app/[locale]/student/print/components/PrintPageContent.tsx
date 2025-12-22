'use client';

import { useRef, useState } from 'react';
import { PrintWizard, PrintWizardRef } from './PrintWizard';
import { UploadedFilesTable } from './UploadedFilesTable';
import { UploadedFileItem } from '../types';

export function PrintPageContent() {
  const printWizardRef = useRef<PrintWizardRef>(null);
  const printWizardContainerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);

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
    <div className="flex-1 space-y-6">
      <div ref={printWizardContainerRef}>
        <PrintWizard ref={printWizardRef} onStepChange={handleStepChange} />
      </div>
      {showUploadedFilesTable && (
        <UploadedFilesTable onStartPrint={handleStartPrint} />
      )}
    </div>
  );
}
