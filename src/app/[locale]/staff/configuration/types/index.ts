// Re-export types from API service
export type {
  PageSizePriceResponse,
  UpdatePageSizePriceRequest,
  ColorModePriceResponse,
  UpdateColorModePriceRequest,
  DepositBonusPackageResponse,
  CreateDepositBonusPackageRequest,
  UpdateDepositBonusPackageRequest,
  PageDiscountPackageResponse,
  CreatePageDiscountPackageRequest,
  UpdatePageDiscountPackageRequest,
  PermittedFileTypeResponse,
  CreatePermittedFileTypeRequest,
  UpdatePermittedFileTypeRequest,
  SemesterResponse,
  SemesterBonusResponse,
  CreateSemesterBonusRequest,
  UpdateSemesterBonusRequest,
  DistributeSemesterBonusResponse,
  GeneralConfigResponse,
  UpdateGeneralConfigRequest,
  SendSystemNotificationRequest,
  SendSystemNotificationResponse,
  SystemConfigAllResponse,
} from '@/lib/api/services/systemConfig';

// Configuration categories for UI organization
export type ConfigurationCategory =
  | 'pricing'
  | 'bonuses'
  | 'file-types'
  | 'semester'
  | 'general'
  | 'notifications';

// Note: categoryLabels removed - use translations from staff.configuration.tabs instead

// Legacy type for backward compatibility during migration
export interface SystemConfigItem {
  configId: string;
  configKey: string;
  configValue: string;
  displayName: string;
  description: string;
  category: ConfigurationCategory;
  dataType: 'number' | 'string' | 'boolean' | 'json';
  updatedAt: string;
  updatedBy: string;
  updatedByName: string;
}
