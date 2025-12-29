'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import {
  MockPrintConfig,
  MockPageSize,
  MockPrinter,
  MockUploadedFile,
} from '@/app/[locale]/student/print/types';
import { PaperSizeComparisonModal } from './PaperSizeComparisonModal';
import { ColorModeInfoModal } from './ColorModeInfoModal';
import {
  useStudentPageSizes,
  useCalculateCost,
  useStudentBalance,
} from '@/app/[locale]/student/print/api';
import {
  mapPageSizesResponse,
  mapCalculateCostResponse,
  mapStudentBalanceResponse,
  mapColorModeToApiValue,
} from '@/lib/utils/mappers/studentPrintMapper';
import { useDebounce } from '@/lib/hooks';

interface Step3ConfigurationProps {
  config: MockPrintConfig;
  selectedPrinter: MockPrinter | null;
  pageSizes?: MockPageSize[]; // Optional, will load from API if not provided
  uploadedFile: MockUploadedFile;
  onConfigChange: (config: MockPrintConfig) => void;
  onPricingChange?: (summary: {
    estimatedPages: number;
    totalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    subtotalBeforeDiscount: number;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Configuration({
  config,
  selectedPrinter,
  pageSizes: propsPageSizes,
  uploadedFile,
  onConfigChange,
  onPricingChange,
  onNext,
  onBack,
}: Step3ConfigurationProps) {
  const t = useTranslations('student.print.step3');
  const locale = useLocale();
  const [localConfig, setLocalConfig] = useState<MockPrintConfig>({
    ...config,
    page_range: config.page_range || 'all',
    custom_page_range: config.custom_page_range || '',
  });
  const [showPaperSizeModal, setShowPaperSizeModal] = useState(false);
  const [showColorModeModal, setShowColorModeModal] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [isCalculatingCost, setIsCalculatingCost] = useState(false);
  const lastCostInputRef = useRef<string | null>(null);
  const [costDetail, setCostDetail] = useState<{
    subtotalBeforeDiscount: number | null;
    discountAmount: number | null;
    discountPercentage: number | null;
  }>({
    subtotalBeforeDiscount: null,
    discountAmount: null,
    discountPercentage: null,
  });

  // Load page sizes from API
  const { data: pageSizesData } = useStudentPageSizes(
    selectedPrinter?.printer_id
  );
  const apiPageSizes = useMemo(() => {
    if (pageSizesData?.data?.data) {
      return mapPageSizesResponse(pageSizesData.data.data);
    }
    return [];
  }, [pageSizesData]);

  // Use API page sizes if available, otherwise use props
  const pageSizes = useMemo(
    () => (apiPageSizes.length > 0 ? apiPageSizes : propsPageSizes || []),
    [apiPageSizes, propsPageSizes]
  );

  // Load student balance
  const { data: balanceData, isLoading: balanceLoading } = useStudentBalance();
  const balance = useMemo(() => {
    if (balanceData?.data?.data) {
      return mapStudentBalanceResponse(balanceData.data.data);
    }
    return { balanceAmount: 0, balanceInPages: 0 };
  }, [balanceData]);

  // Calculate cost mutation
  const calculateCostMutation = useCalculateCost();

  // Debounce config changes for cost calculation
  const debouncedConfig = useDebounce(localConfig, 500);

  const costInputKey = useMemo(
    () =>
      JSON.stringify({
        uploadedFileId: uploadedFile.uploaded_file_id,
        printerId: selectedPrinter?.printer_id,
        pageSizeName: debouncedConfig.paper_size,
        colorModeName: mapColorModeToApiValue(debouncedConfig.color_mode),
        pageOrientation: debouncedConfig.orientation,
        printSide:
          debouncedConfig.print_side === 'double-sided'
            ? 'double-sided'
            : 'one-sided',
        numberOfCopy: debouncedConfig.number_of_copy,
      }),
    [
      uploadedFile.uploaded_file_id,
      selectedPrinter?.printer_id,
      debouncedConfig.paper_size,
      debouncedConfig.color_mode,
      debouncedConfig.orientation,
      debouncedConfig.print_side,
      debouncedConfig.number_of_copy,
    ]
  );

  // Calculate cost when config changes (only once per unique input)
  useEffect(() => {
    if (
      !uploadedFile.uploaded_file_id ||
      !selectedPrinter?.printer_id ||
      !debouncedConfig.paper_size ||
      !debouncedConfig.color_mode ||
      !debouncedConfig.number_of_copy
    ) {
      setCalculatedCost(null);
      return;
    }

    // If nothing changed and we already have a cost, don't refetch
    if (lastCostInputRef.current === costInputKey && calculatedCost !== null) {
      return;
    }

    lastCostInputRef.current = costInputKey;
    setIsCalculatingCost(true);
    calculateCostMutation.mutate(
      {
        uploadedFileId: uploadedFile.uploaded_file_id!,
        printerId: selectedPrinter.printer_id,
        pageSizeName: debouncedConfig.paper_size,
        colorModeName: mapColorModeToApiValue(debouncedConfig.color_mode),
        pageOrientation: debouncedConfig.orientation,
        printSide:
          debouncedConfig.print_side === 'double-sided'
            ? 'double-sided'
            : 'one-sided',
        numberOfCopy: debouncedConfig.number_of_copy,
      },
      {
        onSuccess: response => {
          const costData = mapCalculateCostResponse(response.data.data);
          setCalculatedCost(costData.totalPrice);
          setCostDetail({
            subtotalBeforeDiscount: Number(costData.subtotalBeforeDiscount),
            discountAmount: Number(costData.discountAmount),
            discountPercentage: Number(costData.discountPercentage),
          });
          setIsCalculatingCost(false);
        },
        onError: error => {
          console.error('Calculate cost error:', error);
          setIsCalculatingCost(false);
          // Khi BE lỗi, không tự tính cost fallback để tránh sai lệch
          setCalculatedCost(null);
          setCostDetail({
            subtotalBeforeDiscount: null,
            discountAmount: null,
            discountPercentage: null,
          });
        },
      }
    );
  }, [debouncedConfig, costInputKey]);

  const handleChange = <K extends keyof MockPrintConfig>(
    field: K,
    value: MockPrintConfig[K]
  ) => {
    const newConfig: MockPrintConfig = { ...localConfig, [field]: value };

    // Validate printer capabilities
    if (selectedPrinter) {
      // If printer doesn't support color, force black-white
      if (
        field === 'color_mode' &&
        value === 'color' &&
        !selectedPrinter.supports_color
      ) {
        newConfig.color_mode = 'black-white';
      }

      // If printer doesn't support duplex, force one-sided
      if (
        field === 'print_side' &&
        value === 'double-sided' &&
        !selectedPrinter.supports_duplex
      ) {
        newConfig.print_side = 'one-sided';
      }

      // Check paper size compatibility
      const selectedPageSize = pageSizes.find(
        ps => ps.size_name === newConfig.paper_size
      );
      if (selectedPageSize && selectedPrinter.max_paper_size) {
        const maxSize = pageSizes.find(
          ps => ps.size_name === selectedPrinter.max_paper_size
        );
        if (maxSize && selectedPageSize.width_mm > maxSize.width_mm) {
          newConfig.paper_size = selectedPrinter.max_paper_size;
        }
      }
    }

    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const availablePageSizes = selectedPrinter
    ? pageSizes.filter(ps => {
        const maxSize = pageSizes.find(
          p => p.size_name === selectedPrinter.max_paper_size
        );
        if (!maxSize) return true;
        return (
          ps.width_mm <= maxSize.width_mm && ps.height_mm <= maxSize.height_mm
        );
      })
    : pageSizes;

  const calculateEstimatedPages = () => {
    // Use actual page count if available, otherwise estimate
    const basePages = uploadedFile.page_count || 1;
    const totalPages = basePages * localConfig.number_of_copy;

    // For double-sided printing, divide by 2 (rounded up)
    if (localConfig.print_side === 'double-sided') {
      return Math.ceil(totalPages / 2);
    }

    return totalPages;
  };

  const estimatedPages = calculateEstimatedPages();
  const hasCost = calculatedCost !== null;
  const estimatedCost = hasCost ? calculatedCost! : null;
  const remainingBalanceMoney = hasCost
    ? Math.max(0, balance.balanceAmount - estimatedCost!)
    : null;
  const hasDiscount =
    hasCost &&
    costDetail.discountAmount !== null &&
    (costDetail.discountAmount || 0) > 0;

  // Sync pricing summary lên wizard để Step 4 tái sử dụng, tránh gọi lại API
  useEffect(() => {
    if (!onPricingChange) return;
    if (!hasCost || estimatedCost == null) return;
    onPricingChange({
      estimatedPages,
      totalPrice: estimatedCost,
      discountAmount: costDetail.discountAmount || 0,
      discountPercentage: costDetail.discountPercentage || 0,
      subtotalBeforeDiscount:
        costDetail.subtotalBeforeDiscount || estimatedCost,
    });
  }, [
    estimatedPages,
    hasCost,
    estimatedCost,
    onPricingChange,
    costDetail.discountAmount,
    costDetail.discountPercentage,
    costDetail.subtotalBeforeDiscount,
  ]);

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

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Unified left card */}
        <div className="xl:col-span-2">
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <label className="dark:text-foreground/80 flex items-center gap-2 text-sm font-medium text-foreground">
                  {t('paperSize')}
                  <button
                    onClick={e => {
                      e.preventDefault();
                      setShowPaperSizeModal(true);
                    }}
                    className="bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 flex h-5 w-5 items-center justify-center rounded-full text-primary transition-colors dark:text-primary"
                    title={t('comparePaperSizes')}
                  >
                    <span className="text-xs font-bold">?</span>
                  </button>
                </label>
                <Select
                  value={localConfig.paper_size}
                  onChange={e => handleChange('paper_size', e.target.value)}
                >
                  {availablePageSizes.map(size => (
                    <option key={size.page_size_id} value={size.size_name}>
                      {size.size_name} ({size.width_mm} × {size.height_mm} mm)
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-3">
                <label className="dark:text-foreground/80 block text-sm font-semibold text-foreground">
                  {t('orientation')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChange('orientation', 'portrait')}
                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-300 ${
                      localConfig.orientation === 'portrait'
                        ? 'scale-105 border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/25 dark:border-blue-500 dark:bg-blue-500/15'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="mb-1 text-3xl transition-transform duration-300 group-hover:scale-110">
                      <svg
                        className="mx-auto h-12 w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold">{t('portrait')}</div>
                    {localConfig.orientation === 'portrait' && (
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
                  <button
                    onClick={() => handleChange('orientation', 'landscape')}
                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-300 ${
                      localConfig.orientation === 'landscape'
                        ? 'scale-105 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30 dark:from-blue-500/20 dark:to-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="mb-1 text-3xl transition-transform duration-300 group-hover:scale-110">
                      <svg
                        className="mx-auto h-8 w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold">
                      {t('landscape')}
                    </div>
                    {localConfig.orientation === 'landscape' && (
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
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-white/80">
                  {t('printSide')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChange('print_side', 'one-sided')}
                    disabled={!selectedPrinter?.supports_duplex}
                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                      localConfig.print_side === 'one-sided'
                        ? 'scale-105 border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/25 dark:border-blue-500 dark:bg-blue-500/15'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="mb-1 text-3xl transition-transform duration-300 group-hover:scale-110">
                      📄
                    </div>
                    <div className="text-sm font-semibold">{t('oneSided')}</div>
                    {localConfig.print_side === 'one-sided' && (
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
                  <button
                    onClick={() => handleChange('print_side', 'double-sided')}
                    disabled={!selectedPrinter?.supports_duplex}
                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                      localConfig.print_side === 'double-sided'
                        ? 'scale-105 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30 dark:from-blue-500/20 dark:to-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="mb-1 text-3xl transition-transform duration-300 group-hover:scale-110">
                      📄📄
                    </div>
                    <div className="text-sm font-semibold">
                      {t('doubleSided')}
                    </div>
                    {!selectedPrinter?.supports_duplex && (
                      <div className="mt-1 text-xs font-medium text-destructive">
                        {t('notSupported')}
                      </div>
                    )}
                    {localConfig.print_side === 'double-sided' && (
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
                </div>
              </div>

              <div className="space-y-3">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white/80">
                  {t('colorMode')}
                  <button
                    onClick={e => {
                      e.preventDefault();
                      setShowColorModeModal(true);
                    }}
                    className="bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 flex h-5 w-5 items-center justify-center rounded-full text-primary transition-colors dark:text-primary"
                    title={t('colorModeInfo')}
                  >
                    <span className="text-xs font-bold">?</span>
                  </button>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: 'color',
                      label: t('color'),
                      icon: '🎨',
                      disabled: !selectedPrinter?.supports_color,
                    },
                    {
                      value: 'grayscale',
                      label: t('grayscale'),
                      icon: '⚫',
                      disabled: false,
                    },
                    {
                      value: 'black-white',
                      label: t('blackWhite'),
                      icon: '⚪',
                      disabled: false,
                    },
                  ].map(mode => (
                    <button
                      key={mode.value}
                      onClick={() =>
                        handleChange(
                          'color_mode',
                          mode.value as MockPrintConfig['color_mode']
                        )
                      }
                      disabled={mode.disabled}
                      className={`group relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                        localConfig.color_mode === mode.value
                          ? 'scale-105 border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/25 dark:bg-blue-500/15'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="mb-2 text-3xl transition-transform duration-300 group-hover:scale-110">
                        {mode.icon}
                      </div>
                      <div className="text-xs font-semibold">{mode.label}</div>
                      {mode.disabled && (
                        <div className="mt-1 text-xs font-medium text-destructive">
                          {t('notSupported')}
                        </div>
                      )}
                      {localConfig.color_mode === mode.value && (
                        <div className="absolute right-1 top-1 rounded-full bg-blue-500 p-0.5">
                          <svg
                            className="h-2.5 w-2.5 text-white"
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
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                  {t('pageRange')}
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleChange('page_range', 'all')}
                      className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                        localConfig.page_range === 'all'
                          ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:border-blue-500 dark:bg-blue-500/15 dark:text-blue-300'
                          : 'dark:text-foreground/70 border-slate-200 bg-white text-foreground hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
                      }`}
                    >
                      {t('allPages')}
                    </button>
                    <button
                      onClick={() => handleChange('page_range', 'custom')}
                      disabled={true}
                      className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        localConfig.page_range === 'custom'
                          ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:border-blue-500 dark:bg-blue-500/15 dark:text-blue-300'
                          : 'dark:text-foreground/70 border-slate-200 bg-white text-foreground hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300/60 dark:hover:bg-white/10'
                      }`}
                    >
                      {t('custom')}
                    </button>
                  </div>
                  {localConfig.page_range === 'custom' && (
                    <Input
                      type="text"
                      placeholder={t('pageRangeExample')}
                      value={localConfig.custom_page_range || ''}
                      onChange={e =>
                        handleChange('custom_page_range', e.target.value)
                      }
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                  {t('numberOfCopies')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleChange(
                        'number_of_copy',
                        Math.max(1, localConfig.number_of_copy - 1)
                      )
                    }
                    disabled={localConfig.number_of_copy <= 1}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 disabled:opacity-50 dark:border-white/20 dark:bg-white/5"
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min="1"
                    max="99"
                    value={localConfig.number_of_copy}
                    onChange={e =>
                      handleChange(
                        'number_of_copy',
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="text-center"
                  />
                  <button
                    onClick={() =>
                      handleChange(
                        'number_of_copy',
                        Math.min(99, localConfig.number_of_copy + 1)
                      )
                    }
                    disabled={localConfig.number_of_copy >= 99}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 disabled:opacity-50 dark:border-white/20 dark:bg-white/5"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Summary Card */}
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
              {t('costCalc')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-white/5">
                <span className="font-medium text-slate-600 dark:text-white/70">
                  {t('currentBalance')}:
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {balanceLoading ? (
                    <span className="inline-block h-5 w-28 animate-pulse rounded bg-slate-200/80 align-middle dark:bg-white/10" />
                  ) : (
                    balance.balanceAmount.toLocaleString(
                      locale === 'vi' ? 'vi-VN' : 'en-US'
                    ) +
                    ' ' +
                    t('currency')
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50/70 px-3 py-2 dark:bg-blue-500/10">
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {t('estimatedPages')}:
                </span>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {estimatedPages} {t('pages')} {localConfig.paper_size || ''}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-white/5">
                <span className="font-medium text-slate-700 dark:text-white/70">
                  {t('subtotal')}:
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {!hasCost || isCalculatingCost ? (
                    <span className="inline-block h-5 w-28 animate-pulse rounded bg-slate-200/80 align-middle dark:bg-white/10" />
                  ) : (
                    (
                      costDetail.subtotalBeforeDiscount || estimatedCost!
                    ).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') +
                    ' ' +
                    t('currency')
                  )}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex items-center justify-between rounded-lg bg-green-50/70 px-3 py-2 dark:bg-green-500/10">
                  <span className="font-medium text-green-700 dark:text-green-300">
                    {t('discount')}
                    {costDetail.discountPercentage
                      ? ` (${(costDetail.discountPercentage * 100).toFixed(0)}%)`
                      : ''}
                    :
                  </span>
                  <span className="text-base font-bold text-green-700 dark:text-green-300">
                    -
                    {(costDetail.discountAmount || 0).toLocaleString(
                      locale === 'vi' ? 'vi-VN' : 'en-US'
                    )}{' '}
                    {t('currency')}
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
                    estimatedCost!.toLocaleString(
                      locale === 'vi' ? 'vi-VN' : 'en-US'
                    ) +
                    ' ' +
                    t('currency')
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-green-50/70 px-3 py-2 dark:bg-green-500/10">
                <span className="font-medium text-green-700 dark:text-green-300">
                  {t('remainingBalance')}:
                </span>
                <span className="text-lg font-bold text-green-700 dark:text-green-300">
                  {balanceLoading || !hasCost || isCalculatingCost ? (
                    <span className="inline-block h-5 w-28 animate-pulse rounded bg-slate-200/80 align-middle dark:bg-white/10" />
                  ) : (
                    remainingBalanceMoney!.toLocaleString(
                      locale === 'vi' ? 'vi-VN' : 'en-US'
                    ) +
                    ' ' +
                    t('currency')
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
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
          variant="outline"
          onClick={onNext}
          disabled={isCalculatingCost || !hasCost || calculatedCost === null}
          className="min-w-32 transition-transform duration-150 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('next')}
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>

      {/* Modals */}
      <PaperSizeComparisonModal
        isOpen={showPaperSizeModal}
        onClose={() => setShowPaperSizeModal(false)}
        pageSizes={pageSizes}
      />
      <ColorModeInfoModal
        isOpen={showColorModeModal}
        onClose={() => setShowColorModeModal(false)}
      />
    </div>
  );
}
