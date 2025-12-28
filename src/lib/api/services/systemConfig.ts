import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type { ApiResponse } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

/**
 * Types for System Configuration API
 */

// Page Size Prices
export interface PageSizePriceResponse {
  priceId: string;
  pageSizeId: string;
  sizeName: string;
  widthMm: number;
  heightMm: number;
  pagePrice: number;
  isActive: boolean;
  updatedAt: string;
  updatedByEmail: string;
  updatedByName?: string;
}

export interface UpdatePageSizePriceRequest {
  pageSizeId: string;
  pagePrice: number;
  isActive: boolean;
}

// Color Mode Prices
export interface ColorModePriceResponse {
  settingId: string;
  colorModeId: string;
  colorModeName: string;
  description: string;
  priceMultiplier: number;
  isActive: boolean;
  updatedAt: string;
  updatedByEmail: string;
  updatedByName?: string;
}

export interface UpdateColorModePriceRequest {
  colorModeId: string;
  priceMultiplier: number;
  isActive: boolean;
}

// Deposit Bonus Packages
export interface DepositBonusPackageResponse {
  packageId: string;
  packageName: string;
  amountCap: number;
  bonusPercentage: number;
  description: string;
  isActive: boolean;
}

export interface CreateDepositBonusPackageRequest {
  packageName: string;
  amountCap: number;
  bonusPercentage: number;
  description: string;
  isActive: boolean;
}

export interface UpdateDepositBonusPackageRequest {
  packageName?: string;
  amountCap?: number;
  bonusPercentage?: number;
  description?: string;
  isActive?: boolean;
}

// Page Discount Packages
export interface PageDiscountPackageResponse {
  packageId: string;
  packageName: string;
  minPages: number;
  discountPercentage: number;
  description: string;
  isActive: boolean;
}

export interface CreatePageDiscountPackageRequest {
  packageName: string;
  minPages: number;
  discountPercentage: number;
  description: string;
  isActive: boolean;
}

export interface UpdatePageDiscountPackageRequest {
  packageName?: string;
  minPages?: number;
  discountPercentage?: number;
  description?: string;
  isActive?: boolean;
}

// Permitted File Types
export interface PermittedFileTypeResponse {
  fileTypeId: string;
  fileExtension: string;
  mimeType: string;
  description: string;
  isPermitted: boolean;
  updatedAt: string;
  updatedByEmail: string;
  updatedByName?: string;
}

export interface CreatePermittedFileTypeRequest {
  fileExtension: string;
  mimeType: string;
  description: string;
  isPermitted: boolean;
}

export interface UpdatePermittedFileTypeRequest {
  fileExtension?: string;
  mimeType?: string;
  description?: string;
  isPermitted?: boolean;
}

// Semester Bonus
export interface SemesterBonusResponse {
  bonusId: string;
  semesterId: string;
  semesterName: string;
  bonusAmount: number;
  bonusDescription: string;
  isActive: boolean;
  distributionDate: string;
  totalDistributed: number;
  createdAt: string;
}

export interface CreateSemesterBonusRequest {
  semesterId: string;
  bonusAmount: number;
  bonusDescription: string;
  isActive: boolean;
  distributionDate: string;
}

export interface UpdateSemesterBonusRequest {
  semesterId?: string;
  bonusAmount?: number;
  bonusDescription?: string;
  isActive?: boolean;
  distributionDate?: string;
}

export interface DistributeSemesterBonusResponse {
  bonusId: string;
  semesterName: string;
  bonusAmount: number;
  totalEligible: number;
  alreadyReceived: number;
  newlyDistributed: number;
  distributedAt: string;
}

// General System Configuration
export interface GeneralConfigResponse {
  configId: string;
  configKey: string;
  configValue: string;
  description: string;
  updatedAt: string;
  updatedByEmail: string;
  updatedByName?: string;
}

export interface UpdateGeneralConfigRequest {
  configKey: string;
  configValue: string;
  description: string;
}

// System Notifications
export interface SendSystemNotificationRequest {
  title: string;
  message: string;
  notificationType: 'SYSTEM';
  targetStudentIds: string[] | null;
}

export interface SendSystemNotificationResponse {
  title: string;
  successCount: number;
  failedCount: number;
  sentAt: string;
}

// All Configs Response
export interface SystemConfigAllResponse {
  pageSizePrices: PageSizePriceResponse[];
  colorModePrices: ColorModePriceResponse[];
  depositBonusPackages: DepositBonusPackageResponse[];
  pageDiscountPackages: PageDiscountPackageResponse[];
  permittedFileTypes: PermittedFileTypeResponse[];
  semesterBonusConfigs: SemesterBonusResponse[];
  systemConfigs: GeneralConfigResponse[];
}

/**
 * Query key factory for system config
 */
export const systemConfigKeys = {
  all: ['systemConfig'] as const,
  allConfigs: () => [...systemConfigKeys.all, 'all'] as const,
  pageSizePrices: () => [...systemConfigKeys.all, 'pageSizePrices'] as const,
  colorModePrices: () => [...systemConfigKeys.all, 'colorModePrices'] as const,
  depositBonusPackages: () =>
    [...systemConfigKeys.all, 'depositBonusPackages'] as const,
  pageDiscountPackages: () =>
    [...systemConfigKeys.all, 'pageDiscountPackages'] as const,
  permittedFileTypes: () =>
    [...systemConfigKeys.all, 'permittedFileTypes'] as const,
  semesterBonus: () => [...systemConfigKeys.all, 'semesterBonus'] as const,
  general: () => [...systemConfigKeys.all, 'general'] as const,
  generalByKey: (key: string) => [...systemConfigKeys.general(), key] as const,
};

/**
 * Hooks for System Configuration
 */

// Get all configs
export function useSystemConfigAll() {
  return useApiQuery<ApiResponse<SystemConfigAllResponse>>(
    systemConfigKeys.allConfigs(),
    '/admin/system-config'
  );
}

// Page Size Prices
export function usePageSizePrices() {
  return useApiQuery<ApiResponse<PageSizePriceResponse[]>>(
    systemConfigKeys.pageSizePrices(),
    '/admin/system-config/page-size-prices'
  );
}

export function useUpdatePageSizePrice() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<PageSizePriceResponse>,
    UpdatePageSizePriceRequest
  >('/admin/system-config/page-size-prices', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.pageSizePrices(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
  });
}

// Color Mode Prices
export function useColorModePrices() {
  return useApiQuery<ApiResponse<ColorModePriceResponse[]>>(
    systemConfigKeys.colorModePrices(),
    '/admin/system-config/color-mode-prices'
  );
}

export function useUpdateColorModePrice() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<ColorModePriceResponse>,
    UpdateColorModePriceRequest
  >('/admin/system-config/color-mode-prices', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.colorModePrices(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
  });
}

// Deposit Bonus Packages
export function useDepositBonusPackages() {
  return useApiQuery<ApiResponse<DepositBonusPackageResponse[]>>(
    systemConfigKeys.depositBonusPackages(),
    '/admin/system-config/deposit-bonus-packages'
  );
}

export function useCreateDepositBonusPackage() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<DepositBonusPackageResponse>,
    CreateDepositBonusPackageRequest
  >('/admin/system-config/deposit-bonus-packages', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.depositBonusPackages(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
  });
}

export function useUpdateDepositBonusPackage() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<DepositBonusPackageResponse>,
    { packageId: string; data: UpdateDepositBonusPackageRequest }
  >('', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.depositBonusPackages(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
    mutationFn: async (variables: {
      packageId: string;
      data: UpdateDepositBonusPackageRequest;
    }) => {
      return apiClient.put(
        `/admin/system-config/deposit-bonus-packages/${variables.packageId}`,
        variables.data
      );
    },
  });
}

export function useDeleteDepositBonusPackage() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, string>('', 'delete', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.depositBonusPackages(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
    mutationFn: async (packageId: string) => {
      return apiClient.delete(
        `/admin/system-config/deposit-bonus-packages/${packageId}`
      );
    },
  });
}

// Page Discount Packages
export function usePageDiscountPackages() {
  return useApiQuery<ApiResponse<PageDiscountPackageResponse[]>>(
    systemConfigKeys.pageDiscountPackages(),
    '/admin/system-config/page-discount-packages'
  );
}

export function useCreatePageDiscountPackage() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<PageDiscountPackageResponse>,
    CreatePageDiscountPackageRequest
  >('/admin/system-config/page-discount-packages', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.pageDiscountPackages(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
  });
}

export function useUpdatePageDiscountPackage() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<PageDiscountPackageResponse>,
    { packageId: string; data: UpdatePageDiscountPackageRequest }
  >('', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.pageDiscountPackages(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
    mutationFn: async (variables: {
      packageId: string;
      data: UpdatePageDiscountPackageRequest;
    }) => {
      return apiClient.put(
        `/admin/system-config/page-discount-packages/${variables.packageId}`,
        variables.data
      );
    },
  });
}

export function useDeletePageDiscountPackage() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, string>('', 'delete', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.pageDiscountPackages(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
    mutationFn: async (packageId: string) => {
      return apiClient.delete(
        `/admin/system-config/page-discount-packages/${packageId}`
      );
    },
  });
}

// Permitted File Types
export function usePermittedFileTypes() {
  return useApiQuery<ApiResponse<PermittedFileTypeResponse[]>>(
    systemConfigKeys.permittedFileTypes(),
    '/admin/system-config/permitted-file-types'
  );
}

export function useCreatePermittedFileType() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<PermittedFileTypeResponse>,
    CreatePermittedFileTypeRequest
  >('/admin/system-config/permitted-file-types', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.permittedFileTypes(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
  });
}

export function useUpdatePermittedFileType() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<PermittedFileTypeResponse>,
    { fileTypeId: string; data: UpdatePermittedFileTypeRequest }
  >('', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.permittedFileTypes(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
    mutationFn: async (variables: {
      fileTypeId: string;
      data: UpdatePermittedFileTypeRequest;
    }) => {
      return apiClient.put(
        `/admin/system-config/permitted-file-types/${variables.fileTypeId}`,
        variables.data
      );
    },
  });
}

export function useDeletePermittedFileType() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, string>('', 'delete', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.permittedFileTypes(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
    mutationFn: async (fileTypeId: string) => {
      return apiClient.delete(
        `/admin/system-config/permitted-file-types/${fileTypeId}`
      );
    },
  });
}

// Semester Bonus
export function useSemesterBonus() {
  return useApiQuery<ApiResponse<SemesterBonusResponse[]>>(
    systemConfigKeys.semesterBonus(),
    '/admin/system-config/semester-bonus'
  );
}

export function useCreateSemesterBonus() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<SemesterBonusResponse>,
    CreateSemesterBonusRequest
  >('/admin/system-config/semester-bonus', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.semesterBonus(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
  });
}

export function useUpdateSemesterBonus() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<SemesterBonusResponse>,
    { bonusId: string; data: UpdateSemesterBonusRequest }
  >('', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.semesterBonus(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
    mutationFn: async (variables: {
      bonusId: string;
      data: UpdateSemesterBonusRequest;
    }) => {
      return apiClient.put(
        `/admin/system-config/semester-bonus/${variables.bonusId}`,
        variables.data
      );
    },
  });
}

export function useDistributeSemesterBonus() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<DistributeSemesterBonusResponse>, string>(
    '',
    'post',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: systemConfigKeys.semesterBonus(),
        });
        queryClient.invalidateQueries({
          queryKey: systemConfigKeys.allConfigs(),
        });
      },
      mutationFn: async (bonusId: string) => {
        return apiClient.post(
          `/admin/system-config/semester-bonus/${bonusId}/distribute`
        );
      },
    }
  );
}

// General System Configuration
export function useGeneralConfigs() {
  return useApiQuery<ApiResponse<GeneralConfigResponse[]>>(
    systemConfigKeys.general(),
    '/admin/system-config/general'
  );
}

export function useGeneralConfigByKey(key: string) {
  return useApiQuery<ApiResponse<GeneralConfigResponse>>(
    systemConfigKeys.generalByKey(key),
    `/admin/system-config/general/${key}`
  );
}

export function useUpdateGeneralConfig() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<GeneralConfigResponse>,
    UpdateGeneralConfigRequest
  >('/admin/system-config/general', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.general(),
      });
      queryClient.invalidateQueries({
        queryKey: systemConfigKeys.allConfigs(),
      });
    },
  });
}

// System Notifications
export function useSendSystemNotification() {
  return useApiMutation<
    ApiResponse<SendSystemNotificationResponse>,
    SendSystemNotificationRequest
  >('/admin/system-config/notifications/send', 'post');
}
