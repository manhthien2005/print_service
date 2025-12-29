'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

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

interface EditPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  printer: PrinterPhysical | null;
  brands: string[];
  models: string[];
  rooms: string[];
  onSave: (updatedPrinter: Partial<PrinterPhysical>) => Promise<void>;
}

export const EditPrinterModal: React.FC<EditPrinterModalProps> = ({
  isOpen,
  onClose,
  printer,
  brands,
  models,
  rooms,
  onSave,
}) => {
  const t = useTranslations('staff.managePrinters.modals.editPrinter');
  const [formData, setFormData] = useState<Partial<PrinterPhysical>>({
    brandName: '',
    modelName: '',
    serialNumber: '',
    roomName: '',
    isEnabled: true,
    installedDate: '',
    lastMaintenanceDate: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when printer changes
  useEffect(() => {
    if (printer) {
      setFormData({
        brandName: printer.brandName || '',
        modelName: printer.modelName || '',
        serialNumber: printer.serialNumber || '',
        roomName: printer.roomName || '',
        isEnabled: printer.isEnabled ?? true,
        installedDate: printer.installedDate
          ? printer.installedDate.split('T')[0]
          : '',
        lastMaintenanceDate: printer.lastMaintenanceDate
          ? printer.lastMaintenanceDate.split('T')[0]
          : '',
      });
      setErrors({});
    }
  }, [printer]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brandName) {
      newErrors.brandName = t('errors.brandRequired');
    }
    if (!formData.modelName) {
      newErrors.modelName = t('errors.modelRequired');
    }
    if (!formData.serialNumber?.trim()) {
      newErrors.serialNumber = t('errors.serialRequired');
    }
    if (!formData.roomName) {
      newErrors.roomName = t('errors.roomRequired');
    }
    if (!formData.installedDate) {
      newErrors.installedDate = t('errors.installedDateRequired');
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
      // Convert date strings to ISO format
      const updatedData = {
        ...formData,
        installedDate: formData.installedDate
          ? new Date(formData.installedDate).toISOString()
          : '',
        lastMaintenanceDate: formData.lastMaintenanceDate
          ? new Date(formData.lastMaintenanceDate).toISOString()
          : '',
      };
      await onSave(updatedData);
      onClose();
    } catch (error) {
      console.error('Error saving printer:', error);
      setErrors({
        submit: t('errors.saveError'),
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={printer ? t('title') : t('addTitle')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 pb-6">
        <div className="space-y-6">
          {/* Brand and Model */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Brand */}
            <div className="space-y-2">
              <label
                htmlFor="brandName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('brand')} <span className="text-red-500">*</span>
              </label>
              <Select
                id="brandName"
                value={formData.brandName || ''}
                onChange={e => handleInputChange('brandName', e.target.value)}
                error={!!errors.brandName}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              >
                <option value="">{t('selectBrand')}</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
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
                htmlFor="modelName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('model')} <span className="text-red-500">*</span>
              </label>
              <Select
                id="modelName"
                value={formData.modelName || ''}
                onChange={e => handleInputChange('modelName', e.target.value)}
                error={!!errors.modelName}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              >
                <option value="">{t('selectModel')}</option>
                {models.map(model => (
                  <option key={model} value={model}>
                    {model}
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
                {t('serialNumber')} <span className="text-red-500">*</span>
              </label>
              <Input
                id="serialNumber"
                value={formData.serialNumber || ''}
                onChange={e =>
                  handleInputChange('serialNumber', e.target.value)
                }
                placeholder={t('serialNumberPlaceholder')}
                error={!!errors.serialNumber}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
              />
              {errors.serialNumber && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.serialNumber}
                </p>
              )}
            </div>

            {/* Room */}
            <div className="space-y-2">
              <label
                htmlFor="roomName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('room')} <span className="text-red-500">*</span>
              </label>
              <Select
                id="roomName"
                value={formData.roomName || ''}
                onChange={e => handleInputChange('roomName', e.target.value)}
                error={!!errors.roomName}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              >
                <option value="">{t('selectRoom')}</option>
                {rooms.map(room => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </Select>
              {errors.roomName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.roomName}
                </p>
              )}
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
                {t('installedDate')} <span className="text-red-500">*</span>
              </label>
              <Input
                id="installedDate"
                type="date"
                value={formData.installedDate || ''}
                onChange={e =>
                  handleInputChange('installedDate', e.target.value)
                }
                error={!!errors.installedDate}
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
                {t('lastMaintenanceDate')}
              </label>
              <Input
                id="lastMaintenanceDate"
                type="date"
                value={formData.lastMaintenanceDate || ''}
                onChange={e =>
                  handleInputChange('lastMaintenanceDate', e.target.value)
                }
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              />
            </div>
          </div>

          {/* Enabled Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('status')}
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={formData.isEnabled ?? true}
                onChange={e => handleInputChange('isEnabled', e.target.checked)}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {t('enablePrinter')}
              </span>
            </label>
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
              className="border border-slate-300 bg-slate-200/80 text-slate-900 hover:border-slate-400 hover:bg-slate-300/90 dark:border-white/20 dark:bg-slate-700/80 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600/90"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {isLoading
                ? t('saving')
                : printer
                  ? t('saveChanges')
                  : t('addNew')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
