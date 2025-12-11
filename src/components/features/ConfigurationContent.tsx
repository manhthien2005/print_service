'use client';

import React, { useState, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils/cn';
import {
  systemConfigurationMockData,
  SystemConfigItem,
  ConfigurationCategory,
  categoryLabels,
} from '@/data/systemConfigurationMock';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

// Icon mapping
const iconComponents: Record<
  ConfigurationCategory,
  React.ComponentType<{ className?: string }>
> = {
  pricing: CurrencyDollarIcon,
  limits: ChartBarIcon,
  timeouts: ClockIcon,
  security: ShieldCheckIcon,
  general: Cog6ToothIcon,
};

function formatDateTime(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ConfigCard({
  config,
  onEdit,
}: {
  config: SystemConfigItem;
  onEdit: (config: SystemConfigItem) => void;
}) {
  const displayValue = useMemo(() => {
    if (config.dataType === 'boolean') {
      return config.configValue === 'true' ? 'Bật' : 'Tắt';
    }
    if (config.dataType === 'number') {
      return config.configValue;
    }
    if (config.configValue.length > 50) {
      return `${config.configValue.substring(0, 50)}...`;
    }
    return config.configValue;
  }, [config]);

  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              {config.displayName}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-slate-600 dark:text-white/70">
              {config.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(config)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {displayValue}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
              Cập nhật: {formatDateTime(config.updatedAt)} bởi{' '}
              {config.updatedByName}
            </div>
          </div>
          {config.dataType === 'boolean' && (
            <div
              className={cn(
                'ml-4 h-6 w-12 rounded-full transition-colors',
                config.configValue === 'true'
                  ? 'bg-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <div
                className={cn(
                  'h-6 w-6 rounded-full bg-white shadow-md transition-transform',
                  config.configValue === 'true'
                    ? 'translate-x-6'
                    : 'translate-x-0'
                )}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfigurationContent() {
  const [selectedCategory, setSelectedCategory] = useState<
    ConfigurationCategory | 'all'
  >('all');
  const [selectedConfig, setSelectedConfig] = useState<SystemConfigItem | null>(
    null
  );
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredConfigs = useMemo(() => {
    if (selectedCategory === 'all') {
      return systemConfigurationMockData;
    }
    return systemConfigurationMockData.filter(
      config => config.category === selectedCategory
    );
  }, [selectedCategory]);

  const groupedConfigs = useMemo(() => {
    const groups: Record<ConfigurationCategory, SystemConfigItem[]> = {
      pricing: [],
      limits: [],
      timeouts: [],
      security: [],
      general: [],
    };

    filteredConfigs.forEach(config => {
      groups[config.category].push(config);
    });

    return groups;
  }, [filteredConfigs]);

  const handleEdit = (config: SystemConfigItem) => {
    setSelectedConfig(config);
    setEditValue(config.configValue);
  };

  const handleSave = async () => {
    if (!selectedConfig) return;

    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In real app, this would update the config via API
    console.log('Saving config:', {
      configId: selectedConfig.configId,
      configKey: selectedConfig.configKey,
      configValue: editValue,
    });

    alert('Đã cập nhật cấu hình thành công!');
    setIsSaving(false);
    setSelectedConfig(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setSelectedConfig(null);
    setEditValue('');
  };

  const validateValue = (value: string, dataType: string): boolean => {
    if (!value.trim()) return false;

    if (dataType === 'number') {
      return !isNaN(Number(value)) && Number(value) >= 0;
    }

    if (dataType === 'boolean') {
      return value === 'true' || value === 'false';
    }

    return true;
  };

  const isValid = selectedConfig
    ? validateValue(editValue, selectedConfig.dataType)
    : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Category Filter */}
      <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Danh mục cấu hình
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'rounded-full',
                selectedCategory === 'all' &&
                  'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
              )}
            >
              Tất cả
            </Button>
            {(Object.keys(categoryLabels) as ConfigurationCategory[]).map(
              category => {
                const IconComponent = iconComponents[category];
                return (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'flex items-center gap-2 rounded-full',
                      selectedCategory === category &&
                        'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    {categoryLabels[category]}
                  </Button>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Groups */}
      {selectedCategory === 'all' ? (
        (Object.keys(groupedConfigs) as ConfigurationCategory[]).map(
          category => {
            const configs = groupedConfigs[category];
            if (configs.length === 0) return null;

            const IconComponent = iconComponents[category];
            return (
              <div key={category} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-slate-700 dark:text-white/70" />
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {categoryLabels[category]}
                  </h2>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-white/70">
                    {configs.length} cấu hình
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {configs.map(config => (
                    <ConfigCard
                      key={config.configId}
                      config={config}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            );
          }
        )
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {(() => {
              const IconComponent = iconComponents[selectedCategory];
              return (
                <IconComponent className="h-6 w-6 text-slate-700 dark:text-white/70" />
              );
            })()}
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {categoryLabels[selectedCategory]}
            </h2>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-white/70">
              {filteredConfigs.length} cấu hình
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConfigs.map(config => (
              <ConfigCard
                key={config.configId}
                config={config}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(selectedConfig)}
        onClose={handleCancel}
        title="Chỉnh sửa cấu hình"
        size="md"
      >
        {selectedConfig && (
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                Thông tin cấu hình
              </div>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-white/70">
                    Key:
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    {selectedConfig.configKey}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-600 dark:text-white/70">
                    Mô tả:
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {selectedConfig.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-white/70">
                    Loại dữ liệu:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedConfig.dataType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-white/70">
                    Danh mục:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {categoryLabels[selectedConfig.category]}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
                Giá trị mới
              </label>
              {selectedConfig.dataType === 'boolean' ? (
                <Select
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="w-full"
                >
                  <option value="true">Bật</option>
                  <option value="false">Tắt</option>
                </Select>
              ) : selectedConfig.dataType === 'number' ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  placeholder="Nhập giá trị số"
                  className="w-full"
                  min="0"
                  step={
                    selectedConfig.configKey.includes('Price') ? '100' : '1'
                  }
                />
              ) : (
                <Input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  placeholder="Nhập giá trị"
                  className="w-full"
                />
              )}
              {!isValid && editValue && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Giá trị không hợp lệ. Vui lòng kiểm tra lại.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <div className="font-semibold">Cảnh báo</div>
                  <div className="mt-1">
                    Thay đổi cấu hình này có thể ảnh hưởng đến hoạt động của hệ
                    thống. Vui lòng xác nhận trước khi lưu.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={handleSave}
                disabled={!isValid || isSaving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99]"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ConfigurationContent;
