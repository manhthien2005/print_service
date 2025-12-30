'use client';

import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { StepIndicator } from './StepIndicator';
import { Step1UploadDocument } from './Step1UploadDocument';
import { Step2ChoosePrinter } from './Step2ChoosePrinter';
import { Step3Configuration } from './Step3Configuration';
import { Step4ConfirmPrint } from './Step4ConfirmPrint';
import {
  MockUploadedFile,
  MockPrinter,
  MockPrintConfig,
  defaultPrintConfig,
  UploadedFileItem,
} from '@/app/[locale]/student/print/types';
import { Card, CardContent } from '@/components/ui/Card';
import { usePrintProgressStore } from '@/lib/stores/usePrintProgressStore';

export interface PrintWizardRef {
  startPrintWithFile: (file: UploadedFileItem) => void;
  getCurrentStep: () => number;
}

interface PrintWizardProps {
  onStepChange?: (step: number) => void;
}

export const PrintWizard = forwardRef<PrintWizardRef, PrintWizardProps>(
  ({ onStepChange }, ref) => {
    const t = useTranslations('student.print');
    const { saveProgress, loadProgress, clearProgress } =
      usePrintProgressStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFile, setUploadedFile] = useState<MockUploadedFile>({
      file: null,
      file_name: '',
      file_type: '',
      file_size_kb: 0,
    });
    const [selectedPrinter, setSelectedPrinter] = useState<MockPrinter | null>(
      null
    );
    const [config, setConfig] = useState<MockPrintConfig>(defaultPrintConfig);
    const [isRestored, setIsRestored] = useState(false);
    const [pricingSummary, setPricingSummary] = useState<{
      estimatedPages: number;
      totalPrice: number;
      discountAmount: number;
      discountPercentage: number;
      subtotalBeforeDiscount: number;
    } | null>(null);

    // Restore progress on mount
    useEffect(() => {
      const savedProgress = loadProgress();
      if (savedProgress && !isRestored) {
        setCurrentStep(savedProgress.currentStep);
        setUploadedFile(
          savedProgress.uploadedFile || {
            file: null,
            file_name: '',
            file_type: '',
            file_size_kb: 0,
          }
        );
        setSelectedPrinter(savedProgress.selectedPrinter);
        setConfig(savedProgress.config);
        // pricingSummary sẽ được tính lại ở Step 3 khi người dùng quay lại cấu hình
        setIsRestored(true);
        onStepChange?.(savedProgress.currentStep);
      } else {
        setIsRestored(true);
      }
    }, [loadProgress, onStepChange, isRestored]);

    // Save progress whenever state changes
    useEffect(() => {
      if (!isRestored) return; // Don't save during initial restore

      saveProgress(currentStep, uploadedFile, selectedPrinter, config);
    }, [
      currentStep,
      uploadedFile,
      selectedPrinter,
      config,
      saveProgress,
      isRestored,
    ]);

    const steps = [
      { label: t('steps.upload') },
      { label: t('steps.choosePrinter') },
      { label: t('steps.configuration') },
      { label: t('steps.confirm') },
    ];

    const handleBack = () => {
      if (currentStep > 1) {
        const newStep = currentStep - 1;
        setCurrentStep(newStep);
        onStepChange?.(newStep);
      }
    };

    const handleNext = () => {
      // Validate before moving to next step
      if (currentStep === 1 && !uploadedFile.uploaded_file_id) {
        return; // Don't proceed if file not uploaded
      }
      if (currentStep === 2 && !selectedPrinter) {
        return; // Don't proceed if printer not selected
      }

      if (currentStep < 4) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        onStepChange?.(newStep);
      }
    };

    const handleConfirm = (_jobId: string) => {
      // Job created successfully, reset wizard
      // Reset wizard after successful print job creation
      clearProgress(); // Clear saved progress
      setCurrentStep(1);
      onStepChange?.(1);
      setUploadedFile({
        file: null,
        file_name: '',
        file_type: '',
        file_size_kb: 0,
        page_count: undefined,
        uploaded_file_id: undefined,
      });
      setSelectedPrinter(null);
      setConfig(defaultPrintConfig);
      setPricingSummary(null);
    };

    // Expose method to start print with existing file
    useImperativeHandle(ref, () => ({
      startPrintWithFile: (file: UploadedFileItem) => {
        // Convert UploadedFileItem to MockUploadedFile format
        // file_url is added in UploadedFilesTable from API response
        const fileWithUrl = file as UploadedFileItem & { file_url?: string };
        setUploadedFile({
          file: null, // File object not available from stored file
          file_name: file.file_name,
          file_type: file.file_type,
          file_size_kb: file.file_size_kb,
          page_count: file.page_count,
          uploaded_file_id: file.id, // Use file ID as uploaded_file_id
          preview_url: fileWithUrl.file_url, // Use fileUrl from API for preview
        });
        const newStep = 2; // Jump to step 2 (Choose Printer)
        setCurrentStep(newStep);
        onStepChange?.(newStep);
      },
      getCurrentStep: () => currentStep,
    }));

    return (
      <div className="w-full">
        <StepIndicator currentStep={currentStep} steps={steps} />

        <Card className="border-slate-200/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <Step1UploadDocument
                uploadedFile={uploadedFile}
                onFileSelect={setUploadedFile}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <Step2ChoosePrinter
                selectedPrinter={selectedPrinter}
                onPrinterSelect={setSelectedPrinter}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 3 && (
              <Step3Configuration
                config={config}
                selectedPrinter={selectedPrinter}
                uploadedFile={uploadedFile}
                onConfigChange={setConfig}
                onPricingChange={setPricingSummary}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 4 && (
              <Step4ConfirmPrint
                uploadedFile={uploadedFile}
                selectedPrinter={selectedPrinter}
                config={config}
                pricingSummary={pricingSummary}
                onConfirm={handleConfirm}
                onBack={handleBack}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);

PrintWizard.displayName = 'PrintWizard';
