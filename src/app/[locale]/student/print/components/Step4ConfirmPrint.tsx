'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import {
  MockUploadedFile,
  MockPrinter,
  MockPrintConfig,
} from '@/app/[locale]/student/print/types';
import { FileIcon } from './FileIcon';
import { PrintPreviewModal } from './PrintPreviewModal';
import {
  useCreatePrintJob,
  useStudentBalance,
  useCalculateCost,
  studentPrintKeys,
} from '@/app/[locale]/student/print/api';
import {
  mapCreatePrintJobResponse,
  mapStudentBalanceResponse,
  mapColorModeToApiValue,
} from '@/lib/utils/mappers/studentPrintMapper';
import { toast } from '@/components/ui/Toast';
import {
  paymentOptions,
  type PaymentMethod,
} from '@/app/[locale]/student/print/types';
import { cn } from '@/lib/utils/cn';
import { PrintPaymentModal } from './PrintPaymentModal';
import { useQueryClient } from '@tanstack/react-query';

interface Step4ConfirmPrintProps {
  uploadedFile: MockUploadedFile;
  selectedPrinter: MockPrinter | null;
  config: MockPrintConfig;
  pricingSummary?: {
    estimatedPages: number;
    totalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    subtotalBeforeDiscount: number;
  } | null;
  onConfirm: (_jobId: string) => void; // Updated to pass jobId
  onBack: () => void;
}

export function Step4ConfirmPrint({
  uploadedFile,
  selectedPrinter,
  config,
  pricingSummary,
  onConfirm,
  onBack,
}: Step4ConfirmPrintProps) {
  const t = useTranslations('student.print.step4');
  const t3 = useTranslations('student.print.step3');
  const t2 = useTranslations('student.print.step2');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load student balance
  const { data: balanceData, isLoading: balanceLoading } = useStudentBalance();
  const calculateCostMutation = useCalculateCost();

  // Note: We don't validate printer availability at frontend
  // Backend will validate with the latest data from database when creating the job
  // This ensures consistency and avoids race conditions

  const balance = useMemo(() => {
    if (balanceData?.data?.data) {
      return mapStudentBalanceResponse(balanceData.data.data);
    }
    return { balanceAmount: 0, balanceInPages: 0 };
  }, [balanceData]);

  const [calculatedCost, setCalculatedCost] = useState<number | null>(
    pricingSummary?.totalPrice ?? null
  );
  const [costDetail, setCostDetail] = useState<{
    subtotalBeforeDiscount: number | null;
    discountAmount: number | null;
    discountPercentage: number | null;
  }>({
    subtotalBeforeDiscount: pricingSummary?.subtotalBeforeDiscount ?? null,
    discountAmount: pricingSummary?.discountAmount ?? null,
    discountPercentage: pricingSummary?.discountPercentage ?? null,
  });
  const [isCalculatingCost, setIsCalculatingCost] = useState(false);
  const lastCostInputRef = useRef<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('balance');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{
    jobId: string;
    paymentId: string;
    amount: number;
    qrUrl?: string;
    transferContent?: string;
    paymentCode?: string;
    expiredAt?: string;
  } | null>(null);

  // Nếu đã có giá từ Step 3, ưu tiên dùng và không gọi lại API
  useEffect(() => {
    if (pricingSummary?.totalPrice != null) {
      setCalculatedCost(pricingSummary.totalPrice);
      setCostDetail({
        subtotalBeforeDiscount: pricingSummary.subtotalBeforeDiscount,
        discountAmount: pricingSummary.discountAmount,
        discountPercentage: pricingSummary.discountPercentage,
      });
      setIsCalculatingCost(false);
    }
  }, [
    pricingSummary?.totalPrice,
    pricingSummary?.subtotalBeforeDiscount,
    pricingSummary?.discountAmount,
    pricingSummary?.discountPercentage,
  ]);

  // Calculate cost when config changes
  useEffect(() => {
    // Đã có giá từ Step 3 thì không cần tính lại ở Step 4
    if (pricingSummary?.totalPrice != null) {
      return;
    }

    if (!uploadedFile.uploaded_file_id || !selectedPrinter?.printer_id) {
      setCalculatedCost(null);
      return;
    }

    if (!config.paper_size || !config.color_mode) {
      setCalculatedCost(null);
      return;
    }

    // Build input key to avoid refetching when nothing changed
    const costInputKey = JSON.stringify({
      uploadedFileId: uploadedFile.uploaded_file_id,
      printerId: selectedPrinter.printer_id,
      pageSizeName: config.paper_size,
      colorModeName: mapColorModeToApiValue(config.color_mode),
      pageOrientation: config.orientation,
      printSide:
        config.print_side === 'double-sided' ? 'double-sided' : 'one-sided',
      numberOfCopy: config.number_of_copy,
    });

    if (lastCostInputRef.current === costInputKey && calculatedCost !== null) {
      return;
    }

    lastCostInputRef.current = costInputKey;
    setIsCalculatingCost(true);
    calculateCostMutation.mutate(
      {
        uploadedFileId: uploadedFile.uploaded_file_id!,
        printerId: selectedPrinter.printer_id,
        pageSizeName: config.paper_size,
        colorModeName: mapColorModeToApiValue(config.color_mode),
        pageOrientation: config.orientation,
        printSide:
          config.print_side === 'double-sided' ? 'double-sided' : 'one-sided',
        numberOfCopy: config.number_of_copy,
      },
      {
        onSuccess: response => {
          const apiCost =
            response.data.data.estimatedCost ??
            response.data.data.totalPrice ??
            null;
          setCalculatedCost(apiCost);
          setCostDetail({
            subtotalBeforeDiscount:
              response.data.data.subtotalBeforeDiscount ?? apiCost,
            discountAmount: response.data.data.discountAmount ?? 0,
            discountPercentage: response.data.data.discountPercentage ?? 0,
          });
          setIsCalculatingCost(false);
        },
        onError: () => {
          setCalculatedCost(null);
          setCostDetail({
            subtotalBeforeDiscount: null,
            discountAmount: null,
            discountPercentage: null,
          });
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
    pricingSummary?.totalPrice,
    calculatedCost,
    calculateCostMutation,
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

  const estimatedCost = calculatedCost;
  const balanceAmount = balance.balanceAmount;
  const estimatedPages = calculateTotalPages();
  const hasCost = estimatedCost !== null;
  const remainingBalanceMoney = hasCost
    ? Math.max(0, balanceAmount - estimatedCost!)
    : null;
  const isQrDisabled = hasCost ? estimatedCost! < 10000 : false;
  const hasDiscount =
    hasCost &&
    costDetail.discountAmount !== null &&
    (costDetail.discountAmount || 0) > 0;

  // Auto-switch off QR when it becomes invalid
  useEffect(() => {
    if (selectedPaymentMethod === 'qr' && isQrDisabled) {
      setSelectedPaymentMethod('balance');
    }
  }, [isQrDisabled, selectedPaymentMethod]);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    if (method === 'qr' && isQrDisabled) {
      toast.error(t('errors.qrPaymentNotSupported'));
      return;
    }
    setSelectedPaymentMethod(method);
    setPendingPayment(null);
    setShowPaymentModal(false);
  };

  const handleConfirm = async () => {
    if (!uploadedFile.uploaded_file_id || !selectedPrinter?.printer_id) {
      setError(t('errors.missingFileOrPrinter'));
      return;
    }

    if (!config.paper_size || !config.color_mode) {
      setError(t('errors.missingConfig'));
      return;
    }

    // Validate payment method
    if (
      selectedPaymentMethod === 'balance' &&
      estimatedCost !== null &&
      balanceAmount < estimatedCost
    ) {
      setError(t('errors.insufficientBalanceForPayment'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Note: We skip frontend validation and let backend handle it
      // Backend will validate printer availability with the latest data from database
      // This avoids race conditions and ensures consistency

      const response = await createPrintJobMutation.mutateAsync({
        uploadedFileId: uploadedFile.uploaded_file_id,
        printerId: selectedPrinter.printer_id,
        paymentMethod: selectedPaymentMethod,
        pageSizeName: config.paper_size,
        colorModeName: mapColorModeToApiValue(config.color_mode),
        pageOrientation: config.orientation,
        printSide:
          config.print_side === 'double-sided' ? 'double-sided' : 'one-sided',
        numberOfCopy: config.number_of_copy,
      });

      const apiData = response.data.data;
      const jobData = mapCreatePrintJobResponse(apiData);

      if (selectedPaymentMethod === 'qr') {
        setPendingPayment({
          jobId: jobData.jobId,
          paymentId: jobData.paymentId,
          amount: jobData.totalPrice,
          qrUrl: jobData.qrUrl,
          transferContent: jobData.transferContent,
          paymentCode: jobData.paymentCode,
          expiredAt: jobData.expiredAt,
        });
        setShowPaymentModal(true);
        toast.info(t('toasts.qrPaymentRequired'));
      } else {
        toast.success(t('toasts.jobCreated'));
        // Pass jobId to parent (no longer navigate to progress tracking)
        onConfirm(jobData.jobId);
        queryClient.invalidateQueries({
          queryKey: studentPrintKeys.balance.all,
        });
      }
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Create print job error:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.createJobFailed');

      // Handle specific error cases
      if (
        errorMessage.includes('Insufficient balance') ||
        errorMessage.includes('không đủ')
      ) {
        setError(t('errors.insufficientBalanceForPrint'));
      } else if (
        errorMessage.includes('not available') ||
        errorMessage.includes('không khả dụng') ||
        errorMessage.includes('no longer available')
      ) {
        setError(t('errors.printerNotAvailable'));
        // Invalidate printer queries to refresh list
        queryClient.invalidateQueries({
          queryKey: studentPrintKeys.printers.all,
        });
      } else {
        setError(errorMessage);
      }

      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = useCallback(() => {
    if (!pendingPayment) return;
    toast.success(t('toasts.paymentSuccess'));
    setShowPaymentModal(false);
    onConfirm(pendingPayment.jobId);
    queryClient.invalidateQueries({
      queryKey: studentPrintKeys.balance.all,
    });
    queryClient.invalidateQueries({
      queryKey: studentPrintKeys.printJobs.all,
    });
    setPendingPayment(null);
    setIsSubmitting(false);
  }, [onConfirm, pendingPayment, queryClient]);

  const handlePaymentFailure = useCallback((reason?: string) => {
    if (reason) {
      toast.error(reason);
    } else {
      toast.error(t('toasts.paymentFailed'));
    }
    setShowPaymentModal(false);
    setPendingPayment(null);
    setIsSubmitting(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground dark:text-foreground">
          {t('title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - File & Printer */}
        <div className="space-y-4 lg:col-span-2">
          <div className="dark:bg-background/5 rounded-xl border border-border bg-background p-5 dark:border-border">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 dark:bg-primary/20 flex h-16 w-16 items-center justify-center rounded-lg">
                <FileIcon fileName={uploadedFile.file_name} size={64} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground dark:text-foreground">
                    {uploadedFile.file_name}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowPreview(true)}
                    disabled={!uploadedFile.file && !uploadedFile.preview_url}
                    className="hover:bg-primary/90 dark:hover:bg-primary/90 flex items-center gap-2 bg-primary text-primary-foreground dark:bg-primary"
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
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                  <span>
                    {(uploadedFile.file_size_kb / 1024).toFixed(2)} MB
                  </span>
                  {uploadedFile.page_count !== undefined && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-primary dark:text-primary">
                        {uploadedFile.page_count} {t3('pages')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="dark:bg-background/5 rounded-xl border border-border bg-background p-5 dark:border-border">
            <h4 className="mb-4 font-semibold text-foreground dark:text-foreground">
              {t('selectedPrinter')}
            </h4>
            {selectedPrinter && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    {t('printer.name')}:
                  </span>
                  <span className="text-right text-sm font-semibold text-foreground dark:text-foreground">
                    {selectedPrinter.brand_name} {selectedPrinter.model_name}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    {t('printer.code')}:
                  </span>
                  <span className="text-right text-sm font-semibold text-foreground dark:text-foreground">
                    {selectedPrinter.serial_number}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    {t('printer.location')}:
                  </span>
                  <span className="text-right text-sm font-semibold text-foreground dark:text-foreground">
                    {selectedPrinter.building_name} -{' '}
                    {selectedPrinter.room_code}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    {t('printer.status')}:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />{' '}
                    {/* Status indicator - keep specific color */}
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {' '}
                      {/* Success color - keep specific */}
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
          <div className="dark:bg-background/5 rounded-xl border border-border bg-background p-5 dark:border-border">
            <h4 className="mb-4 font-semibold text-foreground dark:text-foreground">
              {t('printConfig')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">
                  {t3('paperSize')}:
                </span>
                <span className="font-medium text-foreground dark:text-foreground">
                  {config.paper_size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">
                  {t3('orientation')}:
                </span>
                <span className="font-medium text-foreground dark:text-foreground">
                  {config.orientation === 'portrait'
                    ? t3('portrait')
                    : t3('landscape')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">
                  {t3('printSide')}:
                </span>
                <span className="font-medium text-foreground dark:text-foreground">
                  {config.print_side === 'one-sided'
                    ? t3('oneSided')
                    : t3('doubleSided')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">
                  {t3('colorMode')}:
                </span>
                <span className="font-medium text-foreground dark:text-foreground">
                  {config.color_mode === 'color'
                    ? t3('color')
                    : config.color_mode === 'grayscale'
                      ? t3('grayscale')
                      : t3('blackWhite')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">
                  {t3('numberOfCopies')}:
                </span>
                <span className="font-medium text-foreground dark:text-foreground">
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
          {t('paymentMethod')}
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          {paymentOptions.map(option => {
            const isDisabled = option.id === 'qr' && isQrDisabled;
            return (
              <button
                key={option.id}
                onClick={() =>
                  !isDisabled && handlePaymentMethodChange(option.id)
                }
                disabled={isDisabled}
                className={cn(
                  'group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300',
                  isDisabled
                    ? 'border-slate-300 bg-slate-200 text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-white/40'
                    : selectedPaymentMethod === option.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/25 dark:bg-blue-500/15'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
                )}
              >
                <div className="mb-2 text-3xl">{option.icon}</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {option.label}
                </div>
                <div
                  className={cn(
                    'mt-1 text-xs',
                    isDisabled
                      ? 'text-amber-700 dark:text-amber-200'
                      : 'text-slate-600 dark:text-white/60'
                  )}
                >
                  {isDisabled ? t('qrPaymentMinAmount') : option.description}
                </div>
                {selectedPaymentMethod === option.id && !isDisabled && (
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
            );
          })}
        </div>
      </div>

      {/* Cost Summary - align with Step3 */}
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
              {balanceLoading ? (
                <span className="inline-block h-5 w-28 animate-pulse rounded bg-slate-200/80 align-middle dark:bg-white/10" />
              ) : (
                balance.balanceAmount.toLocaleString('vi-VN') +
                ' ' +
                t3('currency')
              )}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-blue-50/70 px-3 py-2 dark:bg-blue-500/10">
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {t3('estimatedPages')}:
            </span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {estimatedPages} {t3('pages')} {config.paper_size}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-white/5">
            <span className="font-medium text-slate-700 dark:text-white/70">
              {t3('subtotal')}:
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {!hasCost || isCalculatingCost ? (
                <span className="inline-block h-5 w-28 animate-pulse rounded bg-slate-200/80 align-middle dark:bg-white/10" />
              ) : (
                (
                  costDetail.subtotalBeforeDiscount || estimatedCost!
                ).toLocaleString('vi-VN') +
                ' ' +
                t3('currency')
              )}
            </span>
          </div>
          {hasDiscount && (
            <div className="flex items-center justify-between rounded-lg bg-green-50/70 px-3 py-2 dark:bg-green-500/10">
              <span className="font-medium text-green-700 dark:text-green-300">
                {t3('discount')}
                {costDetail.discountPercentage
                  ? ` (${(costDetail.discountPercentage * 100).toFixed(0)}%)`
                  : ''}
                :
              </span>
              <span className="text-base font-bold text-green-700 dark:text-green-300">
                -{(costDetail.discountAmount || 0).toLocaleString('vi-VN')}{' '}
                {t3('currency')}
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2 dark:from-blue-500/20 dark:to-blue-600/20">
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              {t('estimatedCost')}:
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {!hasCost || isCalculatingCost ? (
                <span className="inline-block h-6 w-32 animate-pulse rounded bg-slate-200/80 align-middle dark:bg-white/10" />
              ) : (
                estimatedCost!.toLocaleString('vi-VN') + ' ' + t3('currency')
              )}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-green-50/70 px-3 py-2 dark:bg-green-500/10">
            <span className="font-medium text-green-700 dark:text-green-300">
              {t3('remainingBalance')}:
            </span>
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              {balanceLoading || !hasCost || isCalculatingCost ? (
                <span className="inline-block h-5 w-28 animate-pulse rounded bg-slate-200/80 align-middle dark:bg-white/10" />
              ) : (
                remainingBalanceMoney!.toLocaleString('vi-VN') +
                ' ' +
                t3('currency')
              )}
            </span>
          </div>
          {!balanceLoading &&
            hasCost &&
            !isCalculatingCost &&
            selectedPaymentMethod === 'balance' &&
            balanceAmount < estimatedCost && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
                <p className="text-sm text-red-600 dark:text-red-400">
                  ⚠️{' '}
                  {t('insufficientBalance', {
                    amount:
                      (estimatedCost - balanceAmount).toLocaleString('vi-VN') +
                      ' ' +
                      t3('currency'),
                  })}
                </p>
              </div>
            )}
          {selectedPaymentMethod === 'qr' && isQrDisabled && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              {t('qrPaymentMinAmount')}
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

      <PrintPaymentModal
        isOpen={showPaymentModal}
        payment={pendingPayment}
        onClose={() => {
          setShowPaymentModal(false);
        }}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
      />
    </div>
  );
}
