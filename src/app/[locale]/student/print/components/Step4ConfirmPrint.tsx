'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { MockUploadedFile, MockPrinter, MockPrintConfig } from '../types';
import { FileIcon } from './FileIcon';
import { PrintPreviewModal } from './PrintPreviewModal';
import {
  useCreatePrintJob,
  useStudentPageSizes,
  useColorModes,
  useStudentBalance,
  useCalculateCost,
} from '../api';
import {
  mapPageSizesResponse,
  mapColorModesResponse,
  mapCreatePrintJobResponse,
  mapStudentBalanceResponse,
} from '@/lib/utils/mappers/studentPrintMapper';
import { toast } from '@/components/ui/Toast';
import {
  paymentOptions,
  type PaymentMethod,
  generateQRPayment,
  type QRPaymentData,
} from '../types';
import { cn } from '@/lib/utils/cn';

interface Step4ConfirmPrintProps {
  uploadedFile: MockUploadedFile;
  selectedPrinter: MockPrinter | null;
  config: MockPrintConfig;
  onConfirm: (_jobId: string) => void; // Updated to pass jobId
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
  const [error, setError] = useState<string | null>(null);

  // Load page sizes and color modes to get IDs
  const { data: pageSizesData } = useStudentPageSizes(
    selectedPrinter?.printer_id
  );
  const { data: colorModesData } = useColorModes();
  const { data: balanceData } = useStudentBalance();
  const calculateCostMutation = useCalculateCost();

  const pageSizes = useMemo(() => {
    if (pageSizesData?.data?.data) {
      return mapPageSizesResponse(pageSizesData.data.data);
    }
    return [];
  }, [pageSizesData]);

  const colorModes = useMemo(() => {
    if (colorModesData?.data?.data) {
      return mapColorModesResponse(colorModesData.data.data);
    }
    return [];
  }, [colorModesData]);

  const balance = useMemo(() => {
    if (balanceData?.data?.data) {
      return mapStudentBalanceResponse(balanceData.data.data);
    }
    return { balanceAmount: 0, balanceInPages: 0 };
  }, [balanceData]);

  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [isCalculatingCost, setIsCalculatingCost] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('balance');
  const [qrPaymentData, setQrPaymentData] = useState<QRPaymentData | null>(
    null
  );
  const [showQRModal, setShowQRModal] = useState(false);

  // Calculate cost when config changes
  useEffect(() => {
    if (!uploadedFile.uploaded_file_id || !selectedPrinter?.printer_id) {
      setCalculatedCost(null);
      return;
    }

    // Find page size ID and color mode ID
    const pageSize = pageSizes.find(ps => ps.size_name === config.paper_size);
    const colorMode = colorModes.find(cm => {
      const modeMap: Record<string, string> = {
        'black-white': 'black_white',
        grayscale: 'grayscale',
        color: 'color',
      };
      return (
        cm.colorModeName === modeMap[config.color_mode] ||
        cm.colorModeName === config.color_mode
      );
    });

    if (!pageSize || !colorMode) {
      setCalculatedCost(null);
      return;
    }

    setIsCalculatingCost(true);
    calculateCostMutation.mutate(
      {
        uploadedFileId: uploadedFile.uploaded_file_id!,
        printerId: selectedPrinter.printer_id,
        paperSize: config.paper_size,
        colorMode: colorMode.colorModeName,
        printSide:
          config.print_side === 'double-sided' ? 'double_sided' : 'one_sided',
        orientation: config.orientation,
        numberOfCopy: config.number_of_copy,
      },
      {
        onSuccess: response => {
          setCalculatedCost(response.data.data.estimatedCost);
          setIsCalculatingCost(false);
        },
        onError: () => {
          setCalculatedCost(null);
          setIsCalculatingCost(false);
        },
      }
    );
  }, [
    uploadedFile.uploaded_file_id,
    selectedPrinter?.printer_id,
    config.paper_size,
    config.color_mode,
    config.print_side,
    config.orientation,
    config.number_of_copy,
    pageSizes,
    colorModes,
  ]);

  const createPrintJobMutation = useCreatePrintJob();

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
    // Use calculated cost from API if available
    if (calculatedCost !== null) {
      return calculatedCost;
    }

    // Fallback calculation if API call hasn't completed yet
    const baseCostPerPage = config.color_mode === 'color' ? 500 : 100;
    const pages = calculateTotalPages();
    const sides = config.print_side === 'double-sided' ? 0.7 : 1;
    return Math.round(pages * baseCostPerPage * sides);
  };

  const totalCost = calculateEstimatedCost();
  const balanceAmount = balance.balanceAmount;
  const qrAmount = selectedPaymentMethod === 'qr' ? totalCost : 0;

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setQrPaymentData(null);
    setShowQRModal(false);
  };

  const handleConfirm = async () => {
    if (!uploadedFile.uploaded_file_id || !selectedPrinter?.printer_id) {
      setError(
        'Thiếu thông tin file hoặc máy in. Vui lòng quay lại các bước trước.'
      );
      return;
    }

    // Find page size ID and color mode ID
    const pageSize = pageSizes.find(ps => ps.size_name === config.paper_size);
    const colorMode = colorModes.find(cm => {
      const modeMap: Record<string, string> = {
        'black-white': 'black_white',
        grayscale: 'grayscale',
        color: 'color',
      };
      return (
        cm.colorModeName === modeMap[config.color_mode] ||
        cm.colorModeName === config.color_mode
      );
    });

    if (!pageSize || !colorMode) {
      setError(
        'Không tìm thấy cấu hình khổ giấy hoặc chế độ màu. Vui lòng thử lại.'
      );
      return;
    }

    // Validate payment method
    if (selectedPaymentMethod === 'balance' && balanceAmount < totalCost) {
      setError(
        'Số dư không đủ để thanh toán. Vui lòng chọn phương thức thanh toán khác.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Generate QR payment if needed
      if (selectedPaymentMethod === 'qr') {
        const qrData = generateQRPayment(qrAmount);
        setQrPaymentData(qrData);
        setShowQRModal(true);
        // In real implementation, wait for QR payment confirmation
        // For now, just proceed with print job creation
      }

      const response = await createPrintJobMutation.mutateAsync({
        uploadedFileId: uploadedFile.uploaded_file_id,
        printerId: selectedPrinter.printer_id,
        paperSize: config.paper_size,
        colorMode: colorMode.colorModeName,
        printSide:
          config.print_side === 'double-sided' ? 'double_sided' : 'one_sided',
        orientation: config.orientation,
        numberOfCopy: config.number_of_copy,
      });

      const jobData = mapCreatePrintJobResponse(response.data.data);

      toast.success('Tạo print job thành công!');

      // Pass jobId to parent (no longer navigate to progress tracking)
      onConfirm(jobData.jobId);
    } catch (err: any) {
      console.error('Create print job error:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Có lỗi xảy ra khi tạo print job. Vui lòng thử lại.';

      // Handle specific error cases
      if (
        errorMessage.includes('Insufficient balance') ||
        errorMessage.includes('không đủ')
      ) {
        setError('Số dư không đủ để thực hiện in. Vui lòng nạp thêm tiền.');
      } else if (
        errorMessage.includes('not available') ||
        errorMessage.includes('không khả dụng')
      ) {
        setError('Máy in đã không còn khả dụng. Vui lòng chọn máy in khác.');
      } else {
        setError(errorMessage);
      }

      setIsSubmitting(false);
    }
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
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-white/70">
                    Tên:
                  </span>
                  <span className="text-right text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedPrinter.brand_name} {selectedPrinter.model_name}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-white/70">
                    Mã:
                  </span>
                  <span className="text-right text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedPrinter.serial_number}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-white/70">
                    Vị trí:
                  </span>
                  <span className="text-right text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedPrinter.building_name} -{' '}
                    {selectedPrinter.room_code}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-white/70">
                    Trạng thái:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {t2('status.online')}
                    </span>
                  </div>
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

      {/* Payment Method Selection */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
          Phương thức thanh toán
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          {paymentOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handlePaymentMethodChange(option.id)}
              className={cn(
                'group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300',
                selectedPaymentMethod === option.id
                  ? 'scale-105 border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/25 dark:bg-blue-500/15'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
              )}
            >
              <div className="mb-2 text-3xl">{option.icon}</div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {option.label}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-white/60">
                {option.description}
              </div>
              {selectedPaymentMethod === option.id && (
                <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cost Summary - Similar to Step3 */}
      <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg dark:border-blue-500/30 dark:from-blue-500/10 dark:to-white/5">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
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
          {t3('costCalc')}
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-white/5">
            <span className="font-medium text-slate-600 dark:text-white/70">
              {t3('currentBalance')}:
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {balance.balanceInPages} trang (
              {balance.balanceAmount.toLocaleString('vi-VN')} VNĐ)
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-blue-50/70 px-3 py-2 dark:bg-blue-500/10">
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {t3('estimatedPages')}:
            </span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {calculateTotalPages()} trang
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-green-50/70 px-3 py-2 dark:bg-green-500/10">
            <span className="font-medium text-green-700 dark:text-green-300">
              {t3('remainingBalance')}:
            </span>
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              {Math.max(0, balance.balanceInPages - calculateTotalPages())}{' '}
              trang
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2 dark:from-blue-500/20 dark:to-blue-600/20">
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              {t('estimatedCost')}:
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {isCalculatingCost ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  Đang tính...
                </span>
              ) : (
                totalCost.toLocaleString('vi-VN') + ' VNĐ'
              )}
            </span>
          </div>
          {/* Payment Warning */}
          {selectedPaymentMethod === 'balance' && balanceAmount < totalCost && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ Số dư không đủ. Cần thêm{' '}
                {(totalCost - balanceAmount).toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

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

      {/* QR Payment Modal */}
      {showQRModal && qrPaymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <button
              onClick={() => {
                setShowQRModal(false);
                setQrPaymentData(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Thanh toán qua SePay QR
            </h3>
            <div className="mb-4 text-center">
              <div className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                {qrPaymentData.amount.toLocaleString('vi-VN')} VNĐ
              </div>
              <div className="mb-4 flex justify-center">
                <img
                  src={qrPaymentData.qrCode}
                  alt="QR Code"
                  className="h-64 w-64 rounded-lg border-2 border-slate-200 dark:border-white/20"
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Quét mã QR bằng ứng dụng SePay để thanh toán
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-white/50">
                Mã giao dịch: {qrPaymentData.transactionId}
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50">
                Hết hạn:{' '}
                {new Date(qrPaymentData.expiryTime).toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowQRModal(false);
                  setQrPaymentData(null);
                }}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  // In real implementation, check payment status
                  toast.success('Thanh toán thành công!');
                  setShowQRModal(false);
                  setQrPaymentData(null);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Đã thanh toán
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
