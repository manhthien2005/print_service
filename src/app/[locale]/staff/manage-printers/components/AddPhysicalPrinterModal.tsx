'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { DatePicker } from '@/components/ui/DatePicker';

export interface PrinterPhysical {
  printerId: string;
  brandName: string;
  modelName: string;
  serialNumber: string;
  roomName: string;
  isEnabled: boolean;
  installedDate: string;
  lastMaintenanceDate: string;
  createdAt: string;
}

export interface Brand {
  brandId: string;
  brandName: string;
}

export interface PrinterModel {
  modelId: string;
  brandId?: string;
  brandName: string;
  modelName: string;
}

interface AddPhysicalPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  models: PrinterModel[];
  rooms?: string[];
  onSave: (newPrinter: Partial<PrinterPhysical>) => Promise<void>;
}

export const AddPhysicalPrinterModal: React.FC<
  AddPhysicalPrinterModalProps
> = ({ isOpen, onClose, brands, models, rooms = [], onSave }) => {
  const [formData, setFormData] = useState<Partial<PrinterPhysical>>({
    brandName: '',
    modelName: '',
    serialNumber: '',
    roomName: '',
    isEnabled: true,
    installedDate: '',
    lastMaintenanceDate: '',
  });

  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Default rooms if not provided
  const defaultRooms = [
    'Phòng 101 - Tầng 1',
    'Phòng 102 - Tầng 1',
    'Phòng 201 - Tầng 2',
    'Phòng 202 - Tầng 2',
    'Phòng 301 - Tầng 3',
    'Phòng 302 - Tầng 3',
  ];

  const availableRooms = rooms.length > 0 ? rooms : defaultRooms;

  // Filter models based on selected brand
  const filteredModels = useMemo(() => {
    if (!selectedBrandId) return [];
    return models.filter(model => model.brandId === selectedBrandId);
  }, [selectedBrandId, models]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        brandName: '',
        modelName: '',
        serialNumber: '',
        roomName: '',
        isEnabled: true,
        installedDate: '',
        lastMaintenanceDate: '',
      });
      setSelectedBrandId('');
      setSelectedModelId('');
      setErrors({});
    }
  }, [isOpen]);

  // Update brandName and modelName when selections change
  useEffect(() => {
    if (selectedBrandId) {
      const brand = brands.find(b => b.brandId === selectedBrandId);
      if (brand) {
        setFormData(prev => ({ ...prev, brandName: brand.brandName }));
      }
    } else {
      setFormData(prev => ({ ...prev, brandName: '' }));
    }
  }, [selectedBrandId, brands]);

  useEffect(() => {
    if (selectedModelId) {
      const model = filteredModels.find(m => m.modelId === selectedModelId);
      if (model) {
        setFormData(prev => ({ ...prev, modelName: model.modelName }));
      }
    } else {
      setFormData(prev => ({ ...prev, modelName: '' }));
    }
  }, [selectedModelId, filteredModels]);

  const handleInputChange = (
    field: keyof PrinterPhysical,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedModelId(''); // Reset model when brand changes
    setFormData(prev => ({ ...prev, modelName: '' }));
    if (errors.brandName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.brandName;
        return newErrors;
      });
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    if (errors.modelName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.modelName;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedBrandId || !formData.brandName) {
      newErrors.brandName = 'Vui lòng chọn hãng';
    }

    if (!selectedModelId || !formData.modelName) {
      newErrors.modelName = 'Vui lòng chọn model';
    }

    if (!formData.serialNumber?.trim()) {
      newErrors.serialNumber = 'Vui lòng nhập số serial';
    }

    if (!formData.roomName?.trim()) {
      newErrors.roomName = 'Vui lòng chọn hoặc nhập phòng';
    }

    if (!formData.installedDate) {
      newErrors.installedDate = 'Vui lòng chọn ngày lắp đặt';
    }

    // Validate lastMaintenanceDate if provided
    if (formData.lastMaintenanceDate && formData.installedDate) {
      const installedDate = new Date(formData.installedDate);
      const maintenanceDate = new Date(formData.lastMaintenanceDate);
      if (maintenanceDate < installedDate) {
        newErrors.lastMaintenanceDate =
          'Ngày bảo trì không thể trước ngày lắp đặt';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving printer:', error);
      setErrors({
        submit: 'Có lỗi xảy ra khi lưu. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  // Set lastMaintenanceDate to installedDate if not set
  const handleInstalledDateChange = (date: string) => {
    handleInputChange('installedDate', date);
    if (!formData.lastMaintenanceDate) {
      handleInputChange('lastMaintenanceDate', date);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm Mới Máy In Vật Lý"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Brand and Model Selection */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Brand */}
            <div className="space-y-2">
              <label
                htmlFor="brandId"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Hãng <span className="text-red-500">*</span>
              </label>
              <Select
                id="brandId"
                value={selectedBrandId}
                onChange={e => handleBrandChange(e.target.value)}
                error={!!errors.brandName}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              >
                <option value="">Chọn hãng</option>
                {brands.map(brand => (
                  <option key={brand.brandId} value={brand.brandId}>
                    {brand.brandName}
                  </option>
                ))}
              </Select>
              {errors.brandName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.brandName}
                </p>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label
                htmlFor="modelId"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Model <span className="text-red-500">*</span>
              </label>
              <Select
                id="modelId"
                value={selectedModelId}
                onChange={e => handleModelChange(e.target.value)}
                disabled={!selectedBrandId || filteredModels.length === 0}
                error={!!errors.modelName}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              >
                <option value="">
                  {!selectedBrandId
                    ? 'Chọn hãng trước'
                    : filteredModels.length === 0
                      ? 'Không có model nào'
                      : 'Chọn model'}
                </option>
                {filteredModels.map(model => (
                  <option key={model.modelId} value={model.modelId}>
                    {model.modelName}
                  </option>
                ))}
              </Select>
              {errors.modelName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.modelName}
                </p>
              )}
            </div>
          </div>

          {/* Serial Number and Room */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Serial Number */}
            <div className="space-y-2">
              <label
                htmlFor="serialNumber"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Số Serial <span className="text-red-500">*</span>
              </label>
              <Input
                id="serialNumber"
                value={formData.serialNumber || ''}
                onChange={e =>
                  handleInputChange('serialNumber', e.target.value)
                }
                placeholder="VD: HP-001-2024"
                error={!!errors.serialNumber}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
              />
              {errors.serialNumber && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.serialNumber}
                </p>
              )}
            </div>

            {/* Room Name */}
            <div className="space-y-2">
              <label
                htmlFor="roomName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Phòng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="roomName"
                  list="roomOptions"
                  value={formData.roomName || ''}
                  onChange={e => handleInputChange('roomName', e.target.value)}
                  placeholder="Chọn hoặc nhập tên phòng"
                  error={!!errors.roomName}
                  className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                />
                <datalist id="roomOptions">
                  {availableRooms.map(room => (
                    <option key={room} value={room} />
                  ))}
                </datalist>
              </div>
              {errors.roomName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.roomName}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chọn từ danh sách hoặc nhập tên phòng mới
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Installed Date */}
            <div className="space-y-2">
              <label
                htmlFor="installedDate"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Ngày Lắp Đặt <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.installedDate || ''}
                onChange={handleInstalledDateChange}
                placeholder="Chọn ngày lắp đặt"
                error={!!errors.installedDate}
                max={new Date().toISOString().split('T')[0]}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              />
              {errors.installedDate && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.installedDate}
                </p>
              )}
            </div>

            {/* Last Maintenance Date */}
            <div className="space-y-2">
              <label
                htmlFor="lastMaintenanceDate"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Ngày Bảo Trì Gần Nhất
              </label>
              <DatePicker
                value={formData.lastMaintenanceDate || ''}
                onChange={date =>
                  handleInputChange('lastMaintenanceDate', date)
                }
                placeholder="Chọn ngày bảo trì"
                error={!!errors.lastMaintenanceDate}
                min={formData.installedDate || undefined}
                max={new Date().toISOString().split('T')[0]}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              />
              {errors.lastMaintenanceDate && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.lastMaintenanceDate}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                (Tùy chọn) Mặc định sẽ là ngày lắp đặt
              </p>
            </div>
          </div>

          {/* Enabled Status */}
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={formData.isEnabled ?? true}
                onChange={e => handleInputChange('isEnabled', e.target.checked)}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Kích hoạt máy in
              </span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Máy in sẽ được kích hoạt và sẵn sàng sử dụng
            </p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200/50 pt-4 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border border-slate-300 bg-slate-200 text-slate-900 hover:border-slate-400 hover:bg-slate-300 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {isLoading ? 'Đang lưu...' : 'Thêm mới'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
