// Types extracted from systemConfigurationMock.ts

export type ConfigurationCategory =
  | 'pricing'
  | 'limits'
  | 'timeouts'
  | 'security'
  | 'general';

export interface SystemConfigItem {
  configId: string;
  configKey: string;
  configValue: string;
  displayName: string; // Tên hiển thị thân thiện
  description: string;
  category: ConfigurationCategory;
  dataType: 'number' | 'string' | 'boolean' | 'json';
  updatedAt: string; // ISO string
  updatedBy: string;
  updatedByName: string;
}

export const categoryLabels: Record<ConfigurationCategory, string> = {
  pricing: 'Giá cả',
  limits: 'Giới hạn',
  timeouts: 'Thời gian chờ',
  security: 'Bảo mật',
  general: 'Chung',
};
