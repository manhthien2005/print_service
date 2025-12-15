'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tooltip } from '@/components/ui/Tooltip';
import { DatePicker } from '@/components/ui/DatePicker';
import { Tabs } from '@/components/ui/Tabs';
import CountUp from '@/components/ui/CountUp';
import { cn } from '@/lib/utils/cn';
import {
  EditPrinterModelModal,
  PrinterModel as PrinterModelType,
} from './EditPrinterModelModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { EditBrandModal, Brand as BrandType } from './EditBrandModal';
import {
  EditPrinterModal,
  PrinterPhysical as PrinterPhysicalType,
} from './EditPrinterModal';
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
  useBulkDeleteBrands,
  useBrandsForSelect,
  useModels,
  useCreateModel,
  useUpdateModel,
  useDeleteModel,
  useBulkDeleteModels,
  useModelsForSelect,
  usePageSizes,
  usePrinters,
  useCreatePrinter,
  useUpdatePrinter,
  useDeletePrinter,
  useBulkUpdatePrinterStatus,
  useBulkDeletePrinters,
  useImportPrinters,
  useExportPrinters,
  useAllRooms,
  usePrinterLogs,
} from '@/lib/api/services';
import type {
  Brand,
  PrinterModel,
  PrinterPhysical,
  PrinterActivityLog,
} from '@/lib/utils/mappers';
import type {
  BrandRequest,
  PrinterModelRequest,
  PrinterRequest,
} from '@/types/api';
import { toast } from '@/components/ui/Toast';
import { Skeleton, SkeletonTextLoading } from '@/components/common/Skeleton';

// Types are imported from mappers - no need for local interfaces

// Mock data removed - using API instead

type TabType = 'brands' | 'models' | 'printers' | 'activity';
type SortDirection = 'asc' | 'desc' | null;
type SortColumn = string | null;

interface FilterState {
  // Printers tab filters
  status: string; // 'all' | 'enabled' | 'disabled'
  brand: string; // 'all' | brandId
  room: string; // 'all' | roomName
  dateFrom: string;
  dateTo: string;
  // Activity tab filters
  actionType: string; // 'all' | 'added' | 'enabled' | 'disabled' | 'maintenance'
  performedBy: string; // 'all' | userName
  activityDateFrom: string;
  activityDateTo: string;
  // Models tab filters
  modelBrand: string; // 'all' | brandId
  paperSizes: string[]; // Multi-select: ['A4', 'A3', ...]
  features: string[]; // Multi-select: ['color', 'duplex']
  // Brands tab filters
  countryOfOrigin: string; // 'all' | country
  brandDateFrom: string;
  brandDateTo: string;
}

interface ManagePrintersContentProps {
  translations: {
    title: string;
    description: string;
  };
}

export default function ManagePrintersContent({
  translations: _translations,
}: ManagePrintersContentProps) {
  const t = useTranslations('staff.managePrinters');
  const [activeTab, setActiveTab] = useState<TabType>('brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const itemsPerPage = 10;

  // Filter states - must be declared before API hooks that use it
  const [filters, setFilters] = useState<FilterState>({
    // Printers tab
    status: 'all',
    brand: 'all',
    room: 'all',
    dateFrom: '',
    dateTo: '',
    // Activity tab
    actionType: 'all',
    performedBy: 'all',
    activityDateFrom: '',
    activityDateTo: '',
    // Models tab
    modelBrand: 'all',
    paperSizes: [],
    features: [],
    // Brands tab
    countryOfOrigin: 'all',
    brandDateFrom: '',
    brandDateTo: '',
  });

  // API hooks for Brands tab
  const brandsQuery = useBrands({
    page: currentPage - 1, // Convert to 0-based for backend
    limit: itemsPerPage,
    keyword: activeTab === 'brands' && searchQuery ? searchQuery : undefined,
  });
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const deleteBrandMutation = useDeleteBrand();
  const bulkDeleteBrandsMutation = useBulkDeleteBrands();

  // Extract brands data
  const brandsData = brandsQuery.data?.data?.data || [];
  const brandsPagination = brandsQuery.data?.data?.pagination;
  // Check both isLoading and isFetching to handle initial load and refetch
  const isLoadingBrands =
    brandsQuery.isLoading || (brandsQuery.isFetching && !brandsQuery.data);

  // API hooks for Models tab
  const modelsQuery = useModels({
    page: currentPage - 1,
    limit: itemsPerPage,
    keyword: activeTab === 'models' && searchQuery ? searchQuery : undefined,
    brandId:
      activeTab === 'models' && filters.modelBrand !== 'all'
        ? filters.modelBrand
        : undefined,
    supportsColor:
      activeTab === 'models' && filters.features.includes('color')
        ? true
        : undefined,
    supportsDuplex:
      activeTab === 'models' && filters.features.includes('duplex')
        ? true
        : undefined,
  });
  const createModelMutation = useCreateModel();
  const updateModelMutation = useUpdateModel();
  const deleteModelMutation = useDeleteModel();
  const bulkDeleteModelsMutation = useBulkDeleteModels();

  // Extract models data
  const modelsData = modelsQuery.data?.data?.data || [];
  const modelsPagination = modelsQuery.data?.data?.pagination;
  // Check both isLoading and isFetching to handle initial load and refetch
  const isLoadingModels =
    modelsQuery.isLoading || (modelsQuery.isFetching && !modelsQuery.data);

  // Load reference data for dropdowns
  const brandsForSelectQuery = useBrandsForSelect();
  const pageSizesQuery = usePageSizes();
  const roomsQuery = useAllRooms();
  const modelsForSelectQuery = useModelsForSelect();
  const brandsForSelect = brandsForSelectQuery.data?.data?.data || [];
  const pageSizes = pageSizesQuery.data?.data?.data || [];
  const rooms = roomsQuery.data?.data?.data || [];
  const modelsForSelect = modelsForSelectQuery.data?.data?.data || [];

  // API hooks for Printers tab
  const printersQuery = usePrinters({
    page: currentPage - 1,
    limit: itemsPerPage,
    keyword: activeTab === 'printers' && searchQuery ? searchQuery : undefined,
    status:
      activeTab === 'printers' && filters.status !== 'all'
        ? filters.status
        : undefined,
  });
  const createPrinterMutation = useCreatePrinter();
  const updatePrinterMutation = useUpdatePrinter();
  const deletePrinterMutation = useDeletePrinter();
  const bulkUpdatePrinterStatusMutation = useBulkUpdatePrinterStatus();
  const bulkDeletePrintersMutation = useBulkDeletePrinters();
  const importPrintersMutation = useImportPrinters();
  const exportPrintersMutation = useExportPrinters();

  // Extract printers data
  const printersData = printersQuery.data?.data?.data || [];
  const printersPagination = printersQuery.data?.data?.pagination;
  // Check both isLoading and isFetching to handle initial load and refetch
  const isLoadingPrinters =
    printersQuery.isLoading ||
    (printersQuery.isFetching && !printersQuery.data);

  // API hooks for Activity Logs tab
  const logsQuery = usePrinterLogs({
    page: currentPage - 1,
    limit: itemsPerPage,
    fromDate:
      activeTab === 'activity' && filters.activityDateFrom
        ? new Date(filters.activityDateFrom).toISOString()
        : undefined,
    toDate:
      activeTab === 'activity' && filters.activityDateTo
        ? new Date(filters.activityDateTo + 'T23:59:59').toISOString()
        : undefined,
    actionType:
      activeTab === 'activity' && filters.actionType !== 'all'
        ? filters.actionType
        : undefined,
  });

  // Extract logs data - already mapped to PrinterActivityLog by the API hook's select function
  const logsData = (logsQuery.data?.data?.data ||
    []) as unknown as PrinterActivityLog[];
  const logsPagination = logsQuery.data?.data?.pagination;
  // Check both isLoading and isFetching to handle initial load and refetch
  const isLoadingLogs =
    logsQuery.isLoading || (logsQuery.isFetching && !logsQuery.data);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<PrinterModel | null>(null);

  // Brand modal states
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Printer modal states
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] =
    useState<PrinterPhysical | null>(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'brand' | 'model' | 'printer';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Page sizes loaded from API (pageSizes variable from usePageSizes hook)

  // Get unique values for filters from API data
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(printersData.map(p => p.brandName))).sort();
  }, [printersData]);

  const uniqueRooms = useMemo(() => {
    return Array.from(
      new Set(
        (printersData as unknown as PrinterPhysical[]).map(p => p.roomName)
      )
    ).sort();
  }, [printersData]);

  const uniqueActionTypes = useMemo(() => {
    // Collect both actionType and logType for filtering
    const types = new Set<string>();
    logsData.forEach(log => {
      if (log.logType) types.add(log.logType);
      if (log.actionType) types.add(log.actionType);
    });
    return Array.from(types).sort();
  }, [logsData]);

  const uniquePerformers = useMemo(() => {
    // Collect both performedBy and userName
    const performers = new Set<string>();
    logsData.forEach(log => {
      if (log.performedBy) performers.add(log.performedBy);
      if (log.userName) performers.add(log.userName);
    });
    return Array.from(performers).sort();
  }, [logsData]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(brandsData.map(b => b.countryOfOrigin))).sort();
  }, [brandsData]);

  const uniqueModelBrands = useMemo(() => {
    return brandsData.map(b => ({
      brandId: b.brandId,
      brandName: b.brandName,
    }));
  }, [brandsData]);

  // Check if printer needs maintenance (more than 3 months)
  const needsMaintenance = (lastMaintenanceDate: string): boolean => {
    const lastDate = new Date(lastMaintenanceDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastDate < threeMonthsAgo;
  };

  // Get maintenance urgency (days since last maintenance)
  const getMaintenanceDays = (lastMaintenanceDate: string): number => {
    const lastDate = new Date(lastMaintenanceDate);
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data: (Brand | PrinterModel | PrinterPhysical | PrinterActivityLog)[] =
      [];

    // Get base data based on active tab
    switch (activeTab) {
      case 'brands':
        data = [...brandsData];
        break;
      case 'models':
        data = [...(modelsData as unknown as PrinterModel[])];
        break;
      case 'printers':
        data = [...(printersData as unknown as PrinterPhysical[])];
        break;
      case 'activity':
        data = [...logsData];
        break;
    }

    // Search filter is handled by backend API - no client-side filtering needed

    // Apply advanced filters for printers tab
    if (activeTab === 'printers') {
      data = data.filter(item => {
        const printer = item as PrinterPhysical;
        if (
          filters.status !== 'all' &&
          printer.isEnabled !== (filters.status === 'enabled')
        ) {
          return false;
        }
        if (filters.brand !== 'all' && printer.brandName !== filters.brand) {
          return false;
        }
        if (filters.room !== 'all' && printer.roomName !== filters.room) {
          return false;
        }
        if (filters.dateFrom && printer.installedDate < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo && printer.installedDate > filters.dateTo) {
          return false;
        }
        return true;
      });
    }

    // Apply advanced filters for activity tab
    if (activeTab === 'activity') {
      data = data.filter(item => {
        const log = item as PrinterActivityLog;
        // Check both logType and actionType for filtering
        if (filters.actionType !== 'all') {
          const matchesLogType = log.logType === filters.actionType;
          const matchesActionType = log.actionType === filters.actionType;
          if (!matchesLogType && !matchesActionType) {
            return false;
          }
        }
        // Check both performedBy and userName
        if (filters.performedBy !== 'all') {
          const matchesPerformedBy = log.performedBy === filters.performedBy;
          const matchesUserName = log.userName === filters.performedBy;
          if (!matchesPerformedBy && !matchesUserName) {
            return false;
          }
        }
        // Date filtering - check multiple timestamp fields
        const timestamp = log.actionTimestamp || log.timestamp || log.createdAt;
        if (timestamp) {
          if (filters.activityDateFrom) {
            const logDate = timestamp.split('T')[0];
            if (logDate < filters.activityDateFrom) {
              return false;
            }
          }
          if (filters.activityDateTo) {
            const logDate = timestamp.split('T')[0];
            if (logDate > filters.activityDateTo) {
              return false;
            }
          }
        }
        return true;
      });
    }

    // Apply advanced filters for models tab
    if (activeTab === 'models') {
      data = data.filter(item => {
        const model = item as PrinterModel;
        if (
          filters.modelBrand !== 'all' &&
          model.brandId !== filters.modelBrand
        ) {
          return false;
        }
        if (
          filters.paperSizes.length > 0 &&
          !filters.paperSizes.includes(model.maxPaperSize)
        ) {
          return false;
        }
        if (filters.features.length > 0) {
          // Check if model has at least one of the selected features
          const hasSelectedFeatures = filters.features.some(feature => {
            if (feature === 'color') return model.supportsColor;
            if (feature === 'duplex') return model.supportsDuplex;
            return false;
          });
          if (!hasSelectedFeatures) {
            return false;
          }
        }
        return true;
      });
    }

    // Apply advanced filters for brands tab
    if (activeTab === 'brands') {
      data = data.filter(item => {
        const brand = item as Brand;
        if (
          filters.countryOfOrigin !== 'all' &&
          brand.countryOfOrigin !== filters.countryOfOrigin
        ) {
          return false;
        }
        if (filters.brandDateFrom) {
          const brandDate = brand.createdAt.split('T')[0];
          if (brandDate < filters.brandDateFrom) {
            return false;
          }
        }
        if (filters.brandDateTo) {
          const brandDate = brand.createdAt.split('T')[0];
          if (brandDate > filters.brandDateTo) {
            return false;
          }
        }
        return true;
      });
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      data.sort((a, b) => {
        let aValue: string | number | boolean | undefined;
        let bValue: string | number | boolean | undefined;

        if (activeTab === 'brands') {
          const brandA = a as Brand;
          const brandB = b as Brand;
          aValue = brandA[sortColumn as keyof Brand];
          bValue = brandB[sortColumn as keyof Brand];
        } else if (activeTab === 'models') {
          const modelA = a as PrinterModel;
          const modelB = b as PrinterModel;
          aValue = modelA[sortColumn as keyof PrinterModel];
          bValue = modelB[sortColumn as keyof PrinterModel];
        } else if (activeTab === 'printers') {
          const printerA = a as PrinterPhysical;
          const printerB = b as PrinterPhysical;
          aValue = printerA[sortColumn as keyof PrinterPhysical];
          bValue = printerB[sortColumn as keyof PrinterPhysical];
        } else if (activeTab === 'activity') {
          const logA = a as PrinterActivityLog;
          const logB = b as PrinterActivityLog;
          aValue = logA[sortColumn as keyof PrinterActivityLog] as
            | string
            | number
            | boolean
            | undefined;
          bValue = logB[sortColumn as keyof PrinterActivityLog] as
            | string
            | number
            | boolean
            | undefined;
        }

        if (aValue === undefined || bValue === undefined) {
          if (aValue === undefined && bValue === undefined) return 0;
          return aValue === undefined ? 1 : -1;
        }
        if (aValue === bValue) return 0;
        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return data;
  }, [
    activeTab,
    searchQuery,
    filters,
    sortColumn,
    sortDirection,
    brandsData,
    modelsData,
    printersData,
    logsData,
  ]);

  // Pagination
  const totalPages =
    activeTab === 'brands' && brandsPagination
      ? brandsPagination.totalPages
      : activeTab === 'models' && modelsPagination
        ? modelsPagination.totalPages
        : activeTab === 'printers' && printersPagination
          ? printersPagination.totalPages
          : activeTab === 'activity' && logsPagination
            ? logsPagination.totalPages
            : Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const paginatedData =
    activeTab === 'brands' ||
    activeTab === 'models' ||
    activeTab === 'printers' ||
    activeTab === 'activity'
      ? filteredAndSortedData // Already paginated by backend
      : filteredAndSortedData.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );

  // Statistics
  const stats = useMemo(() => {
    return {
      totalBrands: brandsPagination?.totalItems || brandsData.length,
      totalModels: modelsPagination?.totalItems || modelsData.length,
      totalPrinters: printersPagination?.totalItems || printersData.length,
      enabledPrinters: printersData.filter(p => p.isEnabled).length,
      disabledPrinters: printersData.filter(p => !p.isEnabled).length,
      printersNeedingMaintenance: (
        printersData as unknown as PrinterPhysical[]
      ).filter(p => needsMaintenance(p.lastMaintenanceDate)).length,
    };
  }, [
    brandsPagination?.totalItems,
    brandsData.length,
    modelsPagination?.totalItems,
    modelsData.length,
    printersPagination?.totalItems,
    printersData,
  ]);

  // Check if stats are loading
  const isLoadingStats =
    isLoadingBrands || isLoadingModels || isLoadingPrinters;

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map(item => {
        if (activeTab === 'brands') return (item as Brand).brandId;
        if (activeTab === 'models') return (item as PrinterModel).modelId;
        if (activeTab === 'printers')
          return (item as PrinterPhysical).printerId;
        return (item as PrinterActivityLog).logId;
      });
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle select item
  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  // Handle edit model
  const handleEditModel = (model: PrinterModel) => {
    setSelectedModel(model);
    setIsEditModalOpen(true);
  };

  // Handle add model
  const handleAddModel = () => {
    setSelectedModel(null);
    setIsEditModalOpen(true);
  };

  // Handle save model
  const handleSaveModel = async (updatedModel: Partial<PrinterModelType>) => {
    try {
      // Find pageSizeId from pageSize name
      const pageSize = pageSizes.find(
        ps => ps.sizeName === updatedModel.maxPaperSize
      );
      if (!pageSize) {
        toast.error('Không tìm thấy khổ giấy được chọn');
        return;
      }

      const modelRequest: PrinterModelRequest = {
        brandId: updatedModel.brandId || '',
        modelName: updatedModel.modelName || '',
        description: updatedModel.description,
        maxPaperSizeId: pageSize.pageSizeId,
        supportsColor: updatedModel.supportsColor,
        supportsDuplex: updatedModel.supportsDuplex,
      };

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('data', JSON.stringify(modelRequest));

      // Add images if provided
      if (updatedModel.imageUrl2D) {
        // If it's a File object, append it; otherwise it's already uploaded
        const image2d = updatedModel.imageUrl2D;
        if (typeof image2d !== 'string') {
          const file = image2d as unknown;
          if (file instanceof File) {
            formData.append('image2d', file);
          }
        }
      }
      if (updatedModel.imageUrl3D) {
        const image3d = updatedModel.imageUrl3D;
        if (typeof image3d !== 'string') {
          const file = image3d as unknown;
          if (file instanceof File) {
            formData.append('image3d', file);
          }
        }
      }

      if (selectedModel) {
        // Update existing model
        await (
          updateModelMutation.mutateAsync as unknown as (variables: {
            id: string;
            formData: FormData;
          }) => Promise<unknown>
        )({
          id: selectedModel.modelId,
          formData,
        });
        toast.success('Đã cập nhật model thành công!');
      } else {
        // Create new model
        await (
          createModelMutation.mutateAsync as unknown as (
            variables: FormData
          ) => Promise<unknown>
        )(formData);
        toast.success('Đã thêm model mới thành công!');
      }
      setIsEditModalOpen(false);
      setSelectedModel(null);
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('Có lỗi xảy ra khi lưu. Vui lòng thử lại.');
    }
  };

  // Handle edit brand
  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsBrandModalOpen(true);
  };

  // Handle add brand
  const handleAddBrand = () => {
    setSelectedBrand(null);
    setIsBrandModalOpen(true);
  };

  // Handle save brand
  const handleSaveBrand = async (updatedBrand: Partial<BrandType>) => {
    try {
      const brandRequest: BrandRequest = {
        brandName: updatedBrand.brandName || '',
        countryOfOrigin: updatedBrand.countryOfOrigin,
        website: updatedBrand.website,
      };

      if (selectedBrand) {
        // Update existing brand
        await updateBrandMutation.mutateAsync({
          id: selectedBrand.brandId,
          ...brandRequest,
        });
        toast.success('Đã cập nhật hãng thành công!');
      } else {
        // Create new brand
        await createBrandMutation.mutateAsync(brandRequest);
        toast.success('Đã thêm hãng mới thành công!');
      }
      setIsBrandModalOpen(false);
      setSelectedBrand(null);
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Có lỗi xảy ra khi lưu. Vui lòng thử lại.');
    }
  };

  // Handle edit printer
  const handleEditPrinter = (printer: PrinterPhysical) => {
    setSelectedPrinter(printer);
    setIsPrinterModalOpen(true);
  };

  // Handle add printer
  const handleAddPrinter = () => {
    setSelectedPrinter(null);
    setIsPrinterModalOpen(true);
  };

  // Handle save printer
  const handleSavePrinter = async (
    updatedPrinter: Partial<PrinterPhysicalType>
  ) => {
    try {
      // Find roomId and modelId from names
      const room = rooms.find(r => {
        const roomName = `${r.roomCode} - ${r.buildingCode}`;
        return roomName === updatedPrinter.roomName;
      });
      const model = modelsForSelect.find(
        m => m.modelName === updatedPrinter.modelName
      );

      if (!room) {
        toast.error('Không tìm thấy phòng được chọn');
        return;
      }
      if (!model) {
        toast.error('Không tìm thấy model được chọn');
        return;
      }

      const printerRequest: PrinterRequest = {
        modelId: model.modelId,
        roomId: room.roomId,
        serialNumber: updatedPrinter.serialNumber,
        isEnabled: updatedPrinter.isEnabled,
        installedDate: updatedPrinter.installedDate || undefined,
        lastMaintenanceDate: updatedPrinter.lastMaintenanceDate || undefined,
      };

      if (selectedPrinter) {
        // Update existing printer
        await updatePrinterMutation.mutateAsync({
          id: selectedPrinter.printerId,
          ...printerRequest,
        });
        toast.success('Đã cập nhật máy in thành công!');
      } else {
        // Create new printer
        await createPrinterMutation.mutateAsync(printerRequest);
        toast.success('Đã thêm máy in mới thành công!');
      }
      setIsPrinterModalOpen(false);
      setSelectedPrinter(null);
    } catch (error) {
      console.error('Error saving printer:', error);
      toast.error('Có lỗi xảy ra khi lưu. Vui lòng thử lại.');
    }
  };

  // Handle delete item
  const handleDeleteItem = (
    type: 'brand' | 'model' | 'printer',
    id: string,
    name: string
  ) => {
    setItemToDelete({ type, id, name });
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'brand') {
        await deleteBrandMutation.mutateAsync(itemToDelete.id);
        toast.success(`Đã xóa hãng "${itemToDelete.name}" thành công!`);
      } else if (itemToDelete.type === 'model') {
        await deleteModelMutation.mutateAsync(itemToDelete.id);
        toast.success(`Đã xóa model "${itemToDelete.name}" thành công!`);
      } else if (itemToDelete.type === 'printer') {
        await deletePrinterMutation.mutateAsync(itemToDelete.id);
        toast.success(`Đã xóa máy in "${itemToDelete.name}" thành công!`);
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Có lỗi xảy ra khi xóa. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) return;

    try {
      if (activeTab === 'brands' && action === 'delete') {
        const ids = Array.from(selectedItems);
        await bulkDeleteBrandsMutation.mutateAsync({ ids });
        toast.success(`Đã xóa ${ids.length} hãng thành công!`);
        setSelectedItems(new Set());
      } else if (activeTab === 'models' && action === 'delete') {
        const ids = Array.from(selectedItems);
        await bulkDeleteModelsMutation.mutateAsync({ ids });
        toast.success(`Đã xóa ${ids.length} model thành công!`);
        setSelectedItems(new Set());
      } else if (activeTab === 'printers') {
        const ids = Array.from(selectedItems);
        if (action === 'delete') {
          await bulkDeletePrintersMutation.mutateAsync({ ids });
          toast.success(`Đã xóa ${ids.length} máy in thành công!`);
        } else if (action === 'enable' || action === 'disable') {
          await bulkUpdatePrinterStatusMutation.mutateAsync({
            ids,
            isEnabled: action === 'enable',
          });
          toast.success(
            `Đã cập nhật trạng thái ${ids.length} máy in thành công!`
          );
        } else {
          toast.error(`Chức năng "${action}" chưa được hỗ trợ`);
        }
        setSelectedItems(new Set());
      } else {
        toast.error(`Chức năng "${action}" sẽ được triển khai`);
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      const blob = await (
        exportPrintersMutation.mutateAsync as unknown as (variables: {
          keyword?: string;
          status?: string;
          buildingId?: string;
          modelId?: string;
          roomId?: string;
          page?: number;
          limit?: number;
        }) => Promise<Blob>
      )({
        keyword: searchQuery || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `printers-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Đã xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Có lỗi xảy ra khi xuất Excel. Vui lòng thử lại.');
    }
  };

  // Import from Excel
  const handleImportExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await (
          importPrintersMutation.mutateAsync as unknown as (
            variables: File
          ) => Promise<{
            data?: {
              data?: {
                successRows: number;
                totalRows: number;
                errorMessages?: string[];
              };
            };
          }>
        )(file);
        const data = result.data?.data;
        if (data) {
          const errorMessages = data.errorMessages || [];
          toast.success(
            `Import thành công: ${data.successRows}/${data.totalRows} dòng. ${
              errorMessages.length > 0
                ? `Lỗi: ${errorMessages.length} dòng`
                : ''
            }`
          );
          if (errorMessages.length > 0) {
            console.error('Import errors:', errorMessages);
          }
        }
      } catch (error) {
        console.error('Error importing Excel:', error);
        toast.error('Có lỗi xảy ra khi nhập Excel. Vui lòng thử lại.');
      }
    };
    input.click();
  };

  // Format functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionTypeLabel = (actionType: string, logType?: string) => {
    // Use logType if available, otherwise fall back to actionType
    const type = logType || actionType;

    const labels: Record<string, string> = {
      // New backend log types
      print_job: t('actionTypes.printJob') || 'Print Job',
      error: t('actionTypes.error') || 'Error',
      maintenance: t('actionTypes.maintenance'),
      status_change: t('actionTypes.statusChange') || 'Status Change',
      configuration: t('actionTypes.configuration') || 'Configuration',
      admin_action: t('actionTypes.adminAction') || 'Admin Action',
      // Legacy action types (for backward compatibility)
      added: t('actionTypes.added'),
      enabled: t('actionTypes.enabled'),
      disabled: t('actionTypes.disabled'),
      updated: t('actionTypes.updated'),
      removed: t('actionTypes.removed'),
    };
    return labels[type] || type;
  };

  const getActionTypeColor = (
    actionType: string,
    severity?: string,
    logType?: string
  ) => {
    // Use severity if available for better color coding
    if (severity) {
      const severityColors: Record<string, string> = {
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        warning:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        critical:
          'bg-red-200 text-red-900 dark:bg-red-950/40 dark:text-red-300',
      };
      if (severityColors[severity]) {
        return severityColors[severity];
      }
    }

    // Fall back to actionType/logType based colors
    const type = logType || actionType;
    const colors: Record<string, string> = {
      // New backend log types
      print_job:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      maintenance:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      status_change:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      configuration:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      admin_action:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      // Legacy action types
      added:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      enabled:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      disabled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      updated:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      removed:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return (
      colors[type] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    );
  };

  // Reset filters when changing tabs
  React.useEffect(() => {
    setFilters({
      // Printers tab
      status: 'all',
      brand: 'all',
      room: 'all',
      dateFrom: '',
      dateTo: '',
      // Activity tab
      actionType: 'all',
      performedBy: 'all',
      activityDateFrom: '',
      activityDateTo: '',
      // Models tab
      modelBrand: 'all',
      paperSizes: [],
      features: [],
      // Brands tab
      countryOfOrigin: 'all',
      brandDateFrom: '',
      brandDateTo: '',
    });
    setSelectedItems(new Set());
    setSortColumn(null);
    setSortDirection(null);
    setCurrentPage(1);
  }, [activeTab]);

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-1 h-3 w-3 opacity-30"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
    }
    if (sortDirection === 'asc') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-1 h-3 w-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="ml-1 h-3 w-3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <>
      {/* Maintenance Alert */}
      {stats.printersNeedingMaintenance > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50/80 dark:border-orange-900/30 dark:bg-orange-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6 text-orange-600 dark:text-orange-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-orange-900 dark:text-orange-200">
                  {t('maintenance.alertTitle')}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {t('maintenance.alertMessage', {
                    count: stats.printersNeedingMaintenance,
                  })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('printers');
                  setFilters({ ...filters, status: 'all' });
                }}
                className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/20"
              >
                {t('actions.viewDetails')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-white/70">
              {t('stats.totalBrands')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {isLoadingStats ? (
                <SkeletonTextLoading
                  text="---"
                  className="text-3xl"
                  delay={100}
                />
              ) : (
                <CountUp
                  from={0}
                  to={stats.totalBrands}
                  separator=","
                  direction="up"
                  duration={1.5}
                  className="count-up-text"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-white/70">
              {t('stats.totalModels')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {isLoadingStats ? (
                <SkeletonTextLoading
                  text="---"
                  className="text-3xl"
                  delay={150}
                />
              ) : (
                <CountUp
                  from={0}
                  to={stats.totalModels}
                  separator=","
                  direction="up"
                  duration={1.5}
                  className="count-up-text"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-white/70">
              {t('stats.totalPrinters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {isLoadingStats ? (
                <SkeletonTextLoading
                  text="---"
                  className="text-3xl"
                  delay={200}
                />
              ) : (
                <CountUp
                  from={0}
                  to={stats.totalPrinters}
                  separator=","
                  direction="up"
                  duration={1.5}
                  className="count-up-text"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-white/70">
              {t('stats.activePrinters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {isLoadingStats ? (
                <SkeletonTextLoading
                  text="---"
                  className="bg-gradient-to-r from-green-400 via-green-500 to-green-400 text-3xl dark:from-green-500 dark:via-green-300 dark:to-green-500"
                  delay={250}
                />
              ) : (
                <CountUp
                  from={0}
                  to={stats.enabledPrinters}
                  separator=","
                  direction="up"
                  duration={1.5}
                  className="count-up-text"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-white/70">
              {t('stats.maintenancePrinters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {isLoadingStats ? (
                <SkeletonTextLoading
                  text="---"
                  className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-3xl dark:from-red-500 dark:via-red-300 dark:to-red-500"
                  delay={300}
                />
              ) : (
                <CountUp
                  from={0}
                  to={stats.disabledPrinters}
                  separator=","
                  direction="up"
                  duration={1.5}
                  className="count-up-text"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-white/70">
              {t('stats.needsMaintenance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {isLoadingStats ? (
                <SkeletonTextLoading
                  text="---"
                  className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 text-3xl dark:from-orange-500 dark:via-orange-300 dark:to-orange-500"
                  delay={350}
                />
              ) : (
                <CountUp
                  from={0}
                  to={stats.printersNeedingMaintenance}
                  separator=","
                  direction="up"
                  duration={1.5}
                  className="count-up-text"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs
            items={[
              {
                value: 'brands',
                label: t('tabs.brands'),
              },
              {
                value: 'models',
                label: t('tabs.models'),
              },
              {
                value: 'printers',
                label: t('tabs.printers'),
              },
              {
                value: 'activity',
                label: t('tabs.activity'),
              },
            ]}
            value={activeTab}
            onChange={newTab => {
              setActiveTab(newTab);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Search, Filters and Actions */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative w-full max-w-md">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  maxLength={75}
                  className="h-9 w-full border-[0.5px] border-slate-300/50 pl-9 transition-colors focus-visible:border-slate-400 dark:border-white/20 dark:focus-visible:border-white/30"
                />
              </div>
              {(activeTab === 'printers' ||
                activeTab === 'activity' ||
                activeTab === 'models' ||
                activeTab === 'brands') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center border-[0.5px] border-slate-300/50 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                    />
                  </svg>
                  {showAdvancedFilters
                    ? t('search.hideFilters')
                    : t('search.advancedFilters')}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {activeTab !== 'activity' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportExcel}
                  className="flex items-center border-[0.5px] border-slate-300/50 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  {t('actions.importExcel')}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="flex items-center border-[0.5px] border-slate-300/50 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                {t('actions.exportExcel')}
              </Button>
              {activeTab === 'brands' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddBrand}
                  className="flex items-center border-[0.5px] border-blue-500/50 bg-blue-500/20 text-blue-700 transition-colors hover:bg-blue-500/30 hover:text-blue-800 dark:border-blue-400/50 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/20 dark:hover:text-blue-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  {t('actions.addNew')}
                </Button>
              )}
              {activeTab === 'printers' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPrinter}
                  className="flex items-center border-[0.5px] border-blue-500/50 bg-blue-500/20 text-blue-700 transition-colors hover:bg-blue-500/30 hover:text-blue-800 dark:border-blue-400/50 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/20 dark:hover:text-blue-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  {t('actions.addNew')}
                </Button>
              )}
              {activeTab === 'models' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddModel}
                  className="flex items-center border-[0.5px] border-blue-500/50 bg-blue-500/20 text-blue-700 transition-colors hover:bg-blue-500/30 hover:text-blue-800 dark:border-blue-400/50 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/20 dark:hover:text-blue-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  {t('actions.addNew')}
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && activeTab === 'printers' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.status')}
                  </label>
                  <Select
                    value={filters.status}
                    onChange={e => {
                      setFilters({ ...filters, status: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">{t('filters.all')}</option>
                    <option value="enabled">{t('filters.enabled')}</option>
                    <option value="disabled">{t('filters.disabled')}</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.brand')}
                  </label>
                  <Select
                    value={filters.brand}
                    onChange={e => {
                      setFilters({ ...filters, brand: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">{t('filters.all')}</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.room')}
                  </label>
                  <Select
                    value={filters.room}
                    onChange={e => {
                      setFilters({ ...filters, room: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">{t('filters.all')}</option>
                    {uniqueRooms.map(room => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.fromDate')}
                  </label>
                  <DatePicker
                    value={filters.dateFrom}
                    onChange={value => {
                      setFilters({ ...filters, dateFrom: value });
                      setCurrentPage(1);
                    }}
                    placeholder={t('filters.selectStartDate')}
                    max={filters.dateTo || undefined}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.toDate')}
                  </label>
                  <DatePicker
                    value={filters.dateTo}
                    onChange={value => {
                      setFilters({ ...filters, dateTo: value });
                      setCurrentPage(1);
                    }}
                    placeholder={t('filters.selectEndDate')}
                    min={filters.dateFrom || undefined}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      status: 'all',
                      brand: 'all',
                      room: 'all',
                      dateFrom: '',
                      dateTo: '',
                    }));
                  }}
                >
                  {t('filters.clearFilters')}
                </Button>
              </div>
            </div>
          )}

          {/* Advanced Filters for Activity Tab */}
          {showAdvancedFilters && activeTab === 'activity' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.actionType')}
                  </label>
                  <Select
                    value={filters.actionType}
                    onChange={e => {
                      setFilters({ ...filters, actionType: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">{t('filters.all')}</option>
                    {uniqueActionTypes.map(actionType => (
                      <option key={actionType} value={actionType}>
                        {getActionTypeLabel(actionType)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.performedBy')}
                  </label>
                  <Select
                    value={filters.performedBy}
                    onChange={e => {
                      setFilters({ ...filters, performedBy: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">{t('filters.all')}</option>
                    {uniquePerformers.map(performer => (
                      <option key={performer} value={performer}>
                        {performer}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.fromDate')}
                  </label>
                  <DatePicker
                    value={filters.activityDateFrom}
                    onChange={value => {
                      setFilters({ ...filters, activityDateFrom: value });
                      setCurrentPage(1);
                    }}
                    placeholder={t('filters.selectStartDate')}
                    max={filters.activityDateTo || undefined}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.toDate')}
                  </label>
                  <DatePicker
                    value={filters.activityDateTo}
                    onChange={value => {
                      setFilters({ ...filters, activityDateTo: value });
                      setCurrentPage(1);
                    }}
                    placeholder={t('filters.selectEndDate')}
                    min={filters.activityDateFrom || undefined}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      ...filters,
                      actionType: 'all',
                      performedBy: 'all',
                      activityDateFrom: '',
                      activityDateTo: '',
                    });
                  }}
                >
                  {t('filters.clearFilters')}
                </Button>
              </div>
            </div>
          )}

          {/* Advanced Filters for Models Tab */}
          {showAdvancedFilters && activeTab === 'models' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.brand')}
                  </label>
                  <Select
                    value={filters.modelBrand}
                    onChange={e => {
                      setFilters({ ...filters, modelBrand: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">{t('filters.all')}</option>
                    {uniqueModelBrands.map(brand => (
                      <option key={brand.brandId} value={brand.brandId}>
                        {brand.brandName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.paperSize')}
                  </label>
                  <div className="space-y-2">
                    {pageSizes.map(size => (
                      <label
                        key={size.pageSizeId}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={filters.paperSizes.includes(size.sizeName)}
                          onChange={e => {
                            const newSizes = e.target.checked
                              ? [...filters.paperSizes, size.sizeName]
                              : filters.paperSizes.filter(
                                  s => s !== size.sizeName
                                );
                            setFilters({ ...filters, paperSizes: newSizes });
                            setCurrentPage(1);
                          }}
                        />
                        <span className="text-sm text-slate-700 dark:text-white/70">
                          {size.sizeName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.features')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.features.includes('color')}
                        onChange={e => {
                          const newFeatures = e.target.checked
                            ? [...filters.features, 'color']
                            : filters.features.filter(f => f !== 'color');
                          setFilters({ ...filters, features: newFeatures });
                          setCurrentPage(1);
                        }}
                      />
                      <span className="text-sm text-slate-700 dark:text-white/70">
                        {t('filters.color')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.features.includes('duplex')}
                        onChange={e => {
                          const newFeatures = e.target.checked
                            ? [...filters.features, 'duplex']
                            : filters.features.filter(f => f !== 'duplex');
                          setFilters({ ...filters, features: newFeatures });
                          setCurrentPage(1);
                        }}
                      />
                      <span className="text-sm text-slate-700 dark:text-white/70">
                        {t('filters.duplex')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      ...filters,
                      modelBrand: 'all',
                      paperSizes: [],
                      features: [],
                    });
                  }}
                >
                  {t('filters.clearFilters')}
                </Button>
              </div>
            </div>
          )}

          {/* Advanced Filters for Brands Tab */}
          {showAdvancedFilters && activeTab === 'brands' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.countryOfOrigin')}
                  </label>
                  <Select
                    value={filters.countryOfOrigin}
                    onChange={e => {
                      setFilters({
                        ...filters,
                        countryOfOrigin: e.target.value,
                      });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">{t('filters.all')}</option>
                    {uniqueCountries.map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.fromDate')}
                  </label>
                  <DatePicker
                    value={filters.brandDateFrom}
                    onChange={value => {
                      setFilters({ ...filters, brandDateFrom: value });
                      setCurrentPage(1);
                    }}
                    placeholder={t('filters.selectStartDate')}
                    max={filters.brandDateTo || undefined}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/70">
                    {t('filters.toDate')}
                  </label>
                  <DatePicker
                    value={filters.brandDateTo}
                    onChange={value => {
                      setFilters({ ...filters, brandDateTo: value });
                      setCurrentPage(1);
                    }}
                    placeholder={t('filters.selectEndDate')}
                    min={filters.brandDateFrom || undefined}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      ...filters,
                      countryOfOrigin: 'all',
                      brandDateFrom: '',
                      brandDateTo: '',
                    });
                  }}
                >
                  {t('filters.clearFilters')}
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                {t('bulkActions.selected', { count: selectedItems.size })}
              </span>
              <div className="flex gap-2">
                {/* Enable/Disable actions only for printers */}
                {activeTab === 'printers' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction(t('bulkActions.enable'))}
                      className="flex items-center border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-2 h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      {t('bulkActions.enable')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction(t('bulkActions.disable'))}
                      className="flex items-center border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-2 h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      {t('bulkActions.disable')}
                    </Button>
                  </>
                )}
                {/* Delete action for brands, models, and printers */}
                {(activeTab === 'brands' ||
                  activeTab === 'models' ||
                  activeTab === 'printers') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction(t('actions.delete'))}
                    className="flex items-center border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-2 h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    {t('actions.delete')}
                  </Button>
                )}
                {/* Deselect action for all tables */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                  className="flex items-center border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {t('bulkActions.deselect')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div
          className={cn(
            'overflow-x-auto',
            (activeTab === 'brands' && isLoadingBrands) ||
              (activeTab === 'models' && isLoadingModels) ||
              (activeTab === 'printers' && isLoadingPrinters) ||
              (activeTab === 'activity' && isLoadingLogs)
              ? 'hide-scrollbar overflow-y-hidden'
              : 'overflow-y-visible'
          )}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                {/* Checkbox column for bulk selection */}
                {(activeTab === 'brands' ||
                  activeTab === 'models' ||
                  activeTab === 'printers') && (
                  <th className="w-12 px-4 py-3">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={
                          paginatedData.length > 0 &&
                          paginatedData.every(item => {
                            const id =
                              activeTab === 'brands'
                                ? (item as Brand).brandId
                                : activeTab === 'models'
                                  ? (item as PrinterModel).modelId
                                  : (item as PrinterPhysical).printerId;
                            return selectedItems.has(id);
                          })
                        }
                        onChange={e => handleSelectAll(e.target.checked)}
                      />
                    </div>
                  </th>
                )}
                {activeTab === 'brands' && (
                  <>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('brandName')}
                    >
                      <div className="flex items-center">
                        {t('table.brandName')}
                        {getSortIcon('brandName')}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('countryOfOrigin')}
                    >
                      <div className="flex items-center">
                        {t('table.countryOfOrigin')}
                        {getSortIcon('countryOfOrigin')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.website')}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        {t('table.createdAt')}
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.actions')}
                    </th>
                  </>
                )}
                {activeTab === 'models' && (
                  <>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('brandName')}
                    >
                      <div className="flex items-center">
                        {t('table.brandName')}
                        {getSortIcon('brandName')}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('modelName')}
                    >
                      <div className="flex items-center">
                        {t('table.modelName')}
                        {getSortIcon('modelName')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.description')}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.maxPaperSize')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.features')}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.actions')}
                    </th>
                  </>
                )}
                {activeTab === 'printers' && (
                  <>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.serialNumber')}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('brandName')}
                    >
                      <div className="flex items-center">
                        {t('table.brandModel')}
                        {getSortIcon('brandName')}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('roomName')}
                    >
                      <div className="flex items-center">
                        {t('table.room')}
                        {getSortIcon('roomName')}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('isEnabled')}
                    >
                      <div className="flex items-center justify-center">
                        {t('table.status')}
                        {getSortIcon('isEnabled')}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('installedDate')}
                    >
                      <div className="flex items-center justify-center">
                        {t('table.installedDate')}
                        {getSortIcon('installedDate')}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('lastMaintenanceDate')}
                    >
                      <div className="flex items-center">
                        {t('table.lastMaintenance')}
                        {getSortIcon('lastMaintenanceDate')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.actions')}
                    </th>
                  </>
                )}
                {activeTab === 'activity' && (
                  <>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.printer') || 'Printer'}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.actionType')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.performedBy')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                      {t('table.details')}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                      onClick={() => handleSort('actionTimestamp')}
                    >
                      <div className="flex items-center justify-center">
                        {t('table.time')}
                        {getSortIcon('actionTimestamp')}
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Determine loading state based on active tab
                const isLoading =
                  (activeTab === 'brands' && isLoadingBrands) ||
                  (activeTab === 'models' && isLoadingModels) ||
                  (activeTab === 'printers' && isLoadingPrinters) ||
                  (activeTab === 'activity' && isLoadingLogs);

                // Show skeleton loading
                if (isLoading) {
                  const colCount =
                    (activeTab === 'brands' ||
                    activeTab === 'models' ||
                    activeTab === 'printers'
                      ? 1
                      : 0) +
                    (activeTab === 'brands'
                      ? 5
                      : activeTab === 'models'
                        ? 6
                        : activeTab === 'printers'
                          ? 7
                          : 5);
                  return Array.from({ length: Math.min(itemsPerPage, 5) }).map(
                    (_, index) => (
                      <tr
                        key={`skeleton-${index}`}
                        className="animate-fade-in border-b border-slate-100 dark:border-white/5"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        {activeTab === 'brands' ||
                        activeTab === 'models' ||
                        activeTab === 'printers' ? (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              <Skeleton
                                variant="shimmer"
                                className="h-4 w-4 rounded-full"
                              />
                            </div>
                          </td>
                        ) : null}
                        {Array.from({
                          length:
                            colCount -
                            (activeTab === 'brands' ||
                            activeTab === 'models' ||
                            activeTab === 'printers'
                              ? 1
                              : 0),
                        }).map((_, colIndex) => (
                          <td key={colIndex} className="px-4 py-3">
                            <Skeleton
                              variant="shimmer"
                              className={cn(
                                'h-4',
                                colIndex === 0 && activeTab !== 'activity'
                                  ? 'w-32'
                                  : colIndex === 1 && activeTab === 'models'
                                    ? 'w-40'
                                    : colIndex === 2 && activeTab === 'printers'
                                      ? 'w-24'
                                      : colIndex === colCount - 1
                                        ? 'w-20'
                                        : 'w-full'
                              )}
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  );
                }

                // Show no data message
                if (paginatedData.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={
                          (activeTab === 'brands' ||
                          activeTab === 'models' ||
                          activeTab === 'printers'
                            ? 1
                            : 0) +
                          (activeTab === 'brands'
                            ? 5
                            : activeTab === 'models'
                              ? 6
                              : activeTab === 'printers'
                                ? 7
                                : 5)
                        }
                        className="px-4 py-8 text-center text-slate-500 dark:text-white/50"
                      >
                        {t('table.noData')}
                      </td>
                    </tr>
                  );
                }

                // Show actual data
                return paginatedData.map(item => {
                  if (activeTab === 'brands') {
                    const brand = item as Brand;
                    const isSelected = selectedItems.has(brand.brandId);
                    return (
                      <tr
                        key={brand.brandId}
                        className={cn(
                          'border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5',
                          isSelected && 'bg-blue-50/50 dark:bg-blue-900/10'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onChange={e =>
                                handleSelectItem(
                                  brand.brandId,
                                  e.target.checked
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {brand.brandName}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                          {brand.countryOfOrigin}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {brand.website}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                          {formatDate(brand.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Tooltip content={t('actions.edit')}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditBrand(brand)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                  />
                                </svg>
                              </Button>
                            </Tooltip>
                            <Tooltip content={t('actions.delete')}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() =>
                                  handleDeleteItem(
                                    'brand',
                                    brand.brandId,
                                    brand.brandName
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  if (activeTab === 'models') {
                    const model = item as PrinterModel;
                    const isSelected = selectedItems.has(model.modelId);
                    return (
                      <tr
                        key={model.modelId}
                        className={cn(
                          'border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5',
                          isSelected && 'bg-blue-50/50 dark:bg-blue-900/10'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onChange={e =>
                                handleSelectItem(
                                  model.modelId,
                                  e.target.checked
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {model.brandName}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {model.modelName}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                          {model.description}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-white/70">
                          {model.maxPaperSize}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {model.supportsColor && (
                              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-400/20 dark:text-blue-300">
                                {t('table.color')}
                              </span>
                            )}
                            {model.supportsDuplex && (
                              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-400/20 dark:text-green-300">
                                {t('table.duplex')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Tooltip content={t('actions.edit')}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditModel(model)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                  />
                                </svg>
                              </Button>
                            </Tooltip>
                            <Tooltip content={t('actions.delete')}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() =>
                                  handleDeleteItem(
                                    'model',
                                    model.modelId,
                                    model.modelName
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  if (activeTab === 'printers') {
                    const printer = item as PrinterPhysical;
                    const isSelected = selectedItems.has(printer.printerId);
                    const maintenanceDays = getMaintenanceDays(
                      printer.lastMaintenanceDate
                    );
                    const needsMaint = needsMaintenance(
                      printer.lastMaintenanceDate
                    );
                    return (
                      <tr
                        key={printer.printerId}
                        className={cn(
                          'border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5',
                          isSelected && 'bg-blue-50/50 dark:bg-blue-900/10',
                          needsMaint &&
                            !isSelected &&
                            'bg-orange-50/30 dark:bg-orange-900/5'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onChange={e =>
                                handleSelectItem(
                                  printer.printerId,
                                  e.target.checked
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium">
                          {printer.serialNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">
                              {printer.brandName}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-white/70">
                              {printer.modelName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                          {printer.roomName}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              'inline-block rounded-full px-2 py-1 text-xs font-medium',
                              printer.isEnabled
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            )}
                          >
                            {printer.isEnabled
                              ? t('table.active')
                              : t('table.underMaintenance')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-white/70">
                          {formatDate(printer.installedDate)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-600 dark:text-white/70">
                              {formatDate(printer.lastMaintenanceDate)}
                            </span>
                            {needsMaint && (
                              <span className="text-xs text-orange-600 dark:text-orange-400">
                                (
                                {t('maintenance.daysAgo', {
                                  days: maintenanceDays,
                                })}
                                )
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Tooltip
                              content={
                                printer.isEnabled
                                  ? t('actions.disable')
                                  : t('actions.enable')
                              }
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  'h-8 w-8 p-0',
                                  printer.isEnabled
                                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20'
                                    : 'text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20'
                                )}
                              >
                                {printer.isEnabled ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
                                    />
                                  </svg>
                                )}
                              </Button>
                            </Tooltip>
                            <Tooltip content={t('actions.edit')}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditPrinter(printer)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                  />
                                </svg>
                              </Button>
                            </Tooltip>
                            <Tooltip content={t('actions.delete')}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() =>
                                  handleDeleteItem(
                                    'printer',
                                    printer.printerId,
                                    `${printer.brandName} ${printer.modelName} - ${printer.serialNumber}`
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  if (activeTab === 'activity') {
                    const log = item as PrinterActivityLog;
                    return (
                      <tr
                        key={log.logId}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
                      >
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                          <div className="flex flex-col">
                            {log.printerName && (
                              <span className="font-medium">
                                {log.printerName}
                              </span>
                            )}
                            {log.printerLocation && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {log.printerLocation}
                              </span>
                            )}
                            {!log.printerName && !log.printerLocation && (
                              <span className="font-mono text-xs">
                                {log.printerId || 'Unknown'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              'inline-block rounded-full px-2 py-1 text-xs font-medium',
                              getActionTypeColor(
                                log.actionType,
                                log.severity,
                                log.logType
                              )
                            )}
                          >
                            {getActionTypeLabel(log.actionType, log.logType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                          {log.performedBy || log.userName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                          <div
                            className="max-w-md truncate"
                            title={log.description || log.actionDetail}
                          >
                            {log.description || log.actionDetail}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-white/70">
                          {formatDateTime(
                            log.actionTimestamp ||
                              log.timestamp ||
                              log.createdAt
                          )}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600 dark:text-white/70">
              {t('pagination.showing')}{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              {t('pagination.to')}{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {activeTab === 'brands' && brandsPagination
                  ? Math.min(
                      currentPage * itemsPerPage,
                      brandsPagination.totalItems
                    )
                  : activeTab === 'models' && modelsPagination
                    ? Math.min(
                        currentPage * itemsPerPage,
                        modelsPagination.totalItems
                      )
                    : activeTab === 'printers' && printersPagination
                      ? Math.min(
                          currentPage * itemsPerPage,
                          printersPagination.totalItems
                        )
                      : activeTab === 'activity' && logsPagination
                        ? Math.min(
                            currentPage * itemsPerPage,
                            logsPagination.totalItems
                          )
                        : Math.min(
                            currentPage * itemsPerPage,
                            filteredAndSortedData.length
                          )}
              </span>{' '}
              {t('pagination.of')}{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {activeTab === 'brands' && brandsPagination
                  ? brandsPagination.totalItems
                  : activeTab === 'models' && modelsPagination
                    ? modelsPagination.totalItems
                    : activeTab === 'printers' && printersPagination
                      ? printersPagination.totalItems
                      : activeTab === 'activity' && logsPagination
                        ? logsPagination.totalItems
                        : filteredAndSortedData.length}
              </span>{' '}
              {t('pagination.items')}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={
                  currentPage === 1 ||
                  isLoadingBrands ||
                  isLoadingModels ||
                  isLoadingPrinters ||
                  isLoadingLogs
                }
                className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                  />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={
                  currentPage === 1 ||
                  isLoadingBrands ||
                  isLoadingModels ||
                  isLoadingPrinters ||
                  isLoadingLogs
                }
                className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </Button>
              <div className="flex items-center gap-1">
                {(() => {
                  const maxVisiblePages = 5;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisiblePages / 2)
                  );
                  const endPageInitial = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  );

                  let endPage = endPageInitial;
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1
                    );
                  }

                  const pages: (number | string)[] = [];

                  if (startPage > 1) {
                    pages.push(1);
                    if (startPage > 2) {
                      pages.push('...');
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push('...');
                    }
                    pages.push(totalPages);
                  }

                  return pages.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-slate-500 dark:text-slate-400"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        className={cn(
                          'min-w-[40px] border',
                          currentPage === page
                            ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
                            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10'
                        )}
                      >
                        {page}
                      </Button>
                    );
                  });
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={
                  currentPage === totalPages ||
                  isLoadingBrands ||
                  isLoadingModels ||
                  isLoadingPrinters ||
                  isLoadingLogs
                }
                className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={
                  currentPage === totalPages ||
                  isLoadingBrands ||
                  isLoadingModels ||
                  isLoadingPrinters ||
                  isLoadingLogs
                }
                className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 4.5l-7.5 7.5 7.5 7.5m6-15l-7.5 7.5 7.5 7.5"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Model Modal */}
      <EditPrinterModelModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedModel(null);
        }}
        model={selectedModel as PrinterModelType | null}
        brands={brandsForSelect.map(b => ({
          brandId: b.brandId,
          brandName: b.brandName,
        }))}
        pageSizes={pageSizes.map(ps => ps.sizeName)}
        onSave={handleSaveModel}
      />

      {/* Edit Brand Modal */}
      <EditBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => {
          setIsBrandModalOpen(false);
          setSelectedBrand(null);
        }}
        brand={selectedBrand as BrandType | null}
        onSave={handleSaveBrand}
      />

      {/* Edit Printer Modal */}
      <EditPrinterModal
        isOpen={isPrinterModalOpen}
        onClose={() => {
          setIsPrinterModalOpen(false);
          setSelectedPrinter(null);
        }}
        printer={selectedPrinter as PrinterPhysicalType | null}
        brands={Array.from(new Set(printersData.map(p => p.brandName)))}
        models={modelsForSelect.map(m => m.modelName)}
        rooms={rooms.map(r => `${r.roomCode} - ${r.buildingCode}`)}
        onSave={handleSavePrinter}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          itemToDelete?.type === 'brand'
            ? t('deleteModal.deleteBrand')
            : itemToDelete?.type === 'model'
              ? t('deleteModal.deleteModel')
              : t('deleteModal.deletePrinter')
        }
        message={
          itemToDelete?.type === 'brand'
            ? t('deleteModal.confirmDeleteBrand')
            : itemToDelete?.type === 'model'
              ? t('deleteModal.confirmDeleteModel')
              : t('deleteModal.confirmDeletePrinter')
        }
        itemName={itemToDelete?.name}
        type={itemToDelete?.type || 'brand'}
        isLoading={isDeleting}
      />
    </>
  );
}
