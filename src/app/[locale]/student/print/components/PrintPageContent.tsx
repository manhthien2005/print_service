'use client';

import { useRef } from 'react';
import { PrintWizard, PrintWizardRef } from './PrintWizard';
import { UploadedFilesTable } from './UploadedFilesTable';
import { UploadedFileItem } from '@/data/uploadedFilesMock';

export function PrintPageContent() {
  const printWizardRef = useRef<PrintWizardRef>(null);
  const printWizardContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex-1 space-y-6">
      <div ref={printWizardContainerRef}>
        <PrintWizard ref={printWizardRef} />
      </div>
      <UploadedFilesTable onStartPrint={handleStartPrint} />
    </div>
  );
}
