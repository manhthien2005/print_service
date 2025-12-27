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

export const categoryLabels: Record<ConfigurationCategory, string> = {
  pricing: 'Giá cả',
  bonuses: 'Gói khuyến mãi',
  'file-types': 'Loại file',
  semester: 'Bonus học kỳ',
  general: 'Cấu hình chung',
  notifications: 'Thông báo',
};

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
