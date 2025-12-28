'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardContent } from '@/components/ui/Card';
import {
  usePageAllocations,
  useLowStockAllocations,
  useInitializeAllocations,
  type PageAllocation,
} from '@/lib/api/services/pageAllocation';
import { toast } from '@/components/ui/Toast';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { formatNumber } from '@/lib/utils/format';
import PageAllocationSkeleton from '@/app/[locale]/staff/page-allocation/components/PageAllocationSkeleton';
import PageAllocationEmpty from '@/app/[locale]/staff/page-allocation/components/PageAllocationEmpty';
import PageAllocationTable from '@/app/[locale]/staff/page-allocation/components/PageAllocationTable';
import LowStockAlert from '@/app/[locale]/staff/page-allocation/components/LowStockAlert';
import AddPagesModal from '@/app/[locale]/staff/page-allocation/components/AddPagesModal';
import UpdateAllocationModal from '@/app/[locale]/staff/page-allocation/components/UpdateAllocationModal';
import CheckAvailabilityModal from '@/app/[locale]/staff/page-allocation/components/CheckAvailabilityModal';
import { DEBOUNCE_DELAY } from '@/app/[locale]/staff/page-allocation/constants';

interface PageAllocationContentProps {
  translations: {
    stats: {
      totalTypes: string;
      totalAvailable: string;
      lowStockCount: string;
      totalReserved: string;
    };
    table: {
      sizeName: string;
      description: string;
      totalQuantity: string;
      reserved: string;
      available: string;
      threshold: string;
      status: string;
      lastUpdated: string;
      actions: string;
      lowStock: string;
      normal: string;
      noData: string;
    };
    actions: {
      addPages: string;
      update: string;
      checkAvailability: string;
      initialize: string;
      viewLowStock: string;
      refresh: string;
      retry: string;
    };
    modals: {
      addPages: Record<string, string>;
      update: Record<string, string>;
      checkAvailability: Record<string, string>;
    };
    alerts: {
      lowStock: {
        title: string;
        message: string;
        viewAll: string;
      };
      initialize: {
        title: string;
        message: string;
        action: string;
      };
    };
    filters: {
      search: string;
      lowStockOnly: string;
      clear: string;
    };
    empty: {
      title: string;
      message: string;
      action: string;
    };
    errors: {
      fetchFailed: string;
      initializeFailed: string;
      generic: string;
      retry: string;
    };
  };
}

export default function PageAllocationContent({
  translations,
}: PageAllocationContentProps) {
  const t = useTranslations('staff.pageAllocation');
  const { data, isLoading, error, refetch } = usePageAllocations();
  const { data: lowStockData } = useLowStockAllocations();
  const initializeMutation = useInitializeAllocations();

  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedAllocation, setSelectedAllocation] =
    useState<PageAllocation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAY);

  const allocations: PageAllocation[] = useMemo(
    () => data?.data?.data || [],
    [data?.data?.data]
  );
  const lowStockItems: PageAllocation[] = useMemo(
    () => lowStockData?.data?.data || [],
    [lowStockData?.data?.data]
  );

  // Filter and search
  const filteredAllocations = useMemo(() => {
    let filtered = [...allocations];

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(
        item =>
          item.sizeName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.sizeDescription
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase())
      );
    }

    // Low stock filter
    if (lowStockOnly) {
      filtered = filtered.filter(item => item.isLowStock);
    }

    return filtered;
  }, [allocations, debouncedSearch, lowStockOnly]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalTypes: allocations.length,
      totalAvailable: allocations.reduce(
        (sum, item) => sum + item.availableQuantity,
        0
      ),
      lowStockCount: lowStockItems.length,
      totalReserved: allocations.reduce(
        (sum, item) => sum + item.reservedQuantity,
        0
      ),
    };
  }, [allocations, lowStockItems]);

  // Handlers
  const handleInitialize = async () => {
    try {
      await initializeMutation.mutateAsync();
      toast.success(t('actions.initialize') + ' thành công');
      refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : translations.errors.initializeFailed;
      toast.error(errorMessage);
    }
  };

  const handleAddPages = (allocation: PageAllocation) => {
    setSelectedAllocation(allocation);
    setIsAddModalOpen(true);
  };

  const handleUpdate = (allocation: PageAllocation) => {
    setSelectedAllocation(allocation);
    setIsUpdateModalOpen(true);
  };

  const handleCheckAvailability = (allocation: PageAllocation) => {
    setSelectedAllocation(allocation);
    setIsCheckModalOpen(true);
  };

  const handleViewLowStock = () => {
    setLowStockOnly(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setLowStockOnly(false);
  };

  // Loading state
  if (isLoading) {
    return <PageAllocationSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/10 backdrop-blur-md">
        <CardContent className="py-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            {translations.errors.fetchFailed}
          </h3>
          <p className="text-destructive/80 mb-4">
            {error instanceof Error
              ? error.message
              : translations.errors.generic}
          </p>
          <Button onClick={() => refetch()} variant="default">
            {translations.errors.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (allocations.length === 0) {
    return (
      <PageAllocationEmpty
        onInitialize={handleInitialize}
        translations={translations.empty}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
              {translations.stats.totalTypes}
            </div>
            <div className="mt-2 text-3xl font-bold text-foreground dark:text-foreground">
              {stats.totalTypes}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
              {translations.stats.totalAvailable}
            </div>
            <div className="mt-2 text-3xl font-bold text-foreground dark:text-foreground">
              {formatNumber(stats.totalAvailable)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
              {translations.stats.lowStockCount}
            </div>
            <div className="mt-2 text-3xl font-bold text-orange-400">
              {' '}
              {/* Warning color - keep specific */}
              {stats.lowStockCount}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
              {translations.stats.totalReserved}
            </div>
            <div className="mt-2 text-3xl font-bold text-foreground dark:text-foreground">
              {formatNumber(stats.totalReserved)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <LowStockAlert
          lowStockItems={lowStockItems}
          onViewAll={handleViewLowStock}
          translations={translations.alerts.lowStock}
        />
      )}

      {/* Filters and Actions */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
              <Input
                type="text"
                placeholder={translations.filters.search}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={lowStockOnly}
                  onChange={e => setLowStockOnly(e.target.checked)}
                />
                <span className="text-sm text-foreground dark:text-foreground">
                  {translations.filters.lowStockOnly}
                </span>
              </label>
              {(searchQuery || lowStockOnly) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  {translations.filters.clear}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                {translations.actions.refresh}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <PageAllocationTable
        allocations={filteredAllocations}
        onAddPages={handleAddPages}
        onUpdate={handleUpdate}
        onCheckAvailability={handleCheckAvailability}
        translations={translations}
      />

      {/* Modals */}
      <AddPagesModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedAllocation(null);
          refetch();
        }}
        allocation={selectedAllocation}
      />
      <UpdateAllocationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedAllocation(null);
          refetch();
        }}
        allocation={selectedAllocation}
      />
      <CheckAvailabilityModal
        isOpen={isCheckModalOpen}
        onClose={() => {
          setIsCheckModalOpen(false);
          setSelectedAllocation(null);
        }}
        allocation={selectedAllocation}
      />
    </div>
  );
}
