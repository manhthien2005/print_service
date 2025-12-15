'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import {
  MockUploadedFile,
  MockPrinter,
  MockPrintConfig,
} from '@/data/printMock';
import { FileIcon } from './FileIcon';
import { PrintPreviewModal } from './PrintPreviewModal';

interface Step4ConfirmPrintProps {
  uploadedFile: MockUploadedFile;
  selectedPrinter: MockPrinter | null;
  config: MockPrintConfig;
  onConfirm: () => void;
  onBack: () => void;
}

export function Step4ConfirmPrint({
  uploadedFile,
  selectedPrinter,
  config,
  onConfirm,
  onBack,
}: Step4ConfirmPrintProps) {
  const t = useTranslations('student.print.step4');
  const t3 = useTranslations('student.print.step3');
  const t2 = useTranslations('student.print.step2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onConfirm();
  };

  const calculateTotalPages = () => {
    // Use actual page count if available, otherwise estimate
    const basePages = uploadedFile.page_count || 1;
    const totalPages = basePages * config.number_of_copy;

    // For double-sided printing, divide by 2 (rounded up)
    if (config.print_side === 'double-sided') {
      return Math.ceil(totalPages / 2);
    }

    return totalPages;
  };

  const calculateEstimatedCost = () => {
    const baseCostPerPage = config.color_mode === 'color' ? 500 : 100;
    const pages = calculateTotalPages();
    const sides = config.print_side === 'double-sided' ? 0.7 : 1;
    return Math.round(pages * baseCostPerPage * sides);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {t('title')}
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - File & Printer */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <FileIcon fileName={uploadedFile.file_name} size={64} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {uploadedFile.file_name}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowPreview(true)}
                    disabled={!uploadedFile.file && !uploadedFile.preview_url}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {t('preview')}
                  </Button>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-white/60">
                  <span>
                    {(uploadedFile.file_size_kb / 1024).toFixed(2)} MB
                  </span>
                  {uploadedFile.page_count !== undefined && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {uploadedFile.page_count}{' '}
                        {uploadedFile.page_count === 1 ? 'trang' : 'trang'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
              {t('selectedPrinter')}
            </h4>
            {selectedPrinter && (
              <div className="space-y-2">
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedPrinter.brand_name} {selectedPrinter.model_name}
                </p>
                <p className="text-sm text-slate-600 dark:text-white/70">
                  Serial: {selectedPrinter.serial_number}
                </p>
                <p className="text-sm text-slate-600 dark:text-white/70">
                  {selectedPrinter.building_name} - {selectedPrinter.room_code}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {t2('status.online')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Configuration */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
              {t('printConfig')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  {t3('paperSize')}:
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {config.paper_size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  {t3('orientation')}:
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {config.orientation === 'portrait'
                    ? t3('portrait')
                    : t3('landscape')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  {t3('printSide')}:
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {config.print_side === 'one-sided'
                    ? t3('oneSided')
                    : t3('doubleSided')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  {t3('colorMode')}:
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {config.color_mode === 'color'
                    ? t3('color')
                    : config.color_mode === 'grayscale'
                      ? t3('grayscale')
                      : t3('blackWhite')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  {t3('numberOfCopies')}:
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {config.number_of_copy}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost separate full width */}
      <div className="relative mt-2 overflow-hidden rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-6 shadow-xl dark:border-blue-500/50 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-500/10">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0" />
        <div className="relative z-10">
          <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-100">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t('estimatedCost')}
          </h4>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {calculateEstimatedCost().toLocaleString('vi-VN')} VNĐ
          </div>
          <p className="mt-3 text-xs font-medium text-blue-700 dark:text-blue-300">
            {t('costNote')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('back')}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="min-w-32 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          {isSubmitting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('processing')}
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t('confirm')}
            </>
          )}
        </Button>
      </div>

      <PrintPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        uploadedFile={uploadedFile}
      />
    </div>
  );
}
