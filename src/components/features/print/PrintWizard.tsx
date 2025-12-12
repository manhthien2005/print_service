'use client';

import { useState } from 'react';
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
  mockPrinters,
  mockPageSizes,
  defaultPrintConfig,
} from '@/data/printMock';
import { Card, CardContent } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

export function PrintWizard() {
  const t = useTranslations('student.print');
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

  const steps = [
    { label: t('steps.upload'), description: 'Upload Document' },
    { label: t('steps.choosePrinter'), description: 'Choose Printer' },
    { label: t('steps.configuration'), description: 'Configuration' },
    { label: t('steps.confirm'), description: 'Confirm Print' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    // TODO: Replace with actual API call
    console.log('Print job submitted:', {
      file: uploadedFile,
      printer: selectedPrinter,
      config: config,
    });

    // Show success message with toast
    toast.success(t('step4.success'));

    // Reset wizard
    setTimeout(() => {
      setCurrentStep(1);
      setUploadedFile({
        file: null,
        file_name: '',
        file_type: '',
        file_size_kb: 0,
        page_count: undefined,
      });
      setSelectedPrinter(null);
      setConfig(defaultPrintConfig);
    }, 1500);
  };

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
              printers={mockPrinters}
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
              pageSizes={mockPageSizes}
              uploadedFile={uploadedFile}
              onConfigChange={setConfig}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <Step4ConfirmPrint
              uploadedFile={uploadedFile}
              selectedPrinter={selectedPrinter}
              config={config}
              onConfirm={handleConfirm}
              onBack={handleBack}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
