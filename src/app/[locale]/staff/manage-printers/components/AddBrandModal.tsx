'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export interface Brand {
  brandId: string;
  brandName: string;
  countryOfOrigin: string;
  website: string;
  createdAt: string;
}

interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newBrand: Partial<Brand>) => Promise<void>;
  countries?: string[];
}

export const AddBrandModal: React.FC<AddBrandModalProps> = ({
  isOpen,
  onClose,
  onSave,
  countries = [],
}) => {
  const t = useTranslations('staff.managePrinters.modals.addBrand');
  const [formData, setFormData] = useState<Partial<Brand>>({
    brandName: '',
    countryOfOrigin: '',
    website: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Default countries if not provided
  const defaultCountries = [
    'USA',
    'Japan',
    'China',
    'Germany',
    'South Korea',
    'Vietnam',
    'Thailand',
    'Singapore',
    'Malaysia',
    'Indonesia',
  ];

  const availableCountries =
    countries.length > 0 ? countries : defaultCountries;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        brandName: '',
        countryOfOrigin: '',
        website: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof Brand, value: string) => {
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

    if (!formData.brandName?.trim()) {
      newErrors.brandName = t('errors.brandNameRequired');
    }

    if (!formData.countryOfOrigin) {
      newErrors.countryOfOrigin = t('errors.countryRequired');
    }

    // Validate website URL if provided
    if (formData.website && formData.website.trim()) {
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.website)) {
        newErrors.website = t('errors.invalidUrl');
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
      console.error('Error saving brand:', error);
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
    <Modal isOpen={isOpen} onClose={handleClose} title={t('title')} size="md">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <label
              htmlFor="brandName"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('brandName')} <span className="text-red-500">*</span>
            </label>
            <Input
              id="brandName"
              value={formData.brandName || ''}
              onChange={e => handleInputChange('brandName', e.target.value)}
              placeholder={t('brandNamePlaceholder')}
              error={!!errors.brandName}
              className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
            />
            {errors.brandName && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.brandName}
              </p>
            )}
          </div>

          {/* Country of Origin */}
          <div className="space-y-2">
            <label
              htmlFor="countryOfOrigin"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('countryOfOrigin')} <span className="text-red-500">*</span>
            </label>
            <Select
              id="countryOfOrigin"
              value={formData.countryOfOrigin || ''}
              onChange={e =>
                handleInputChange('countryOfOrigin', e.target.value)
              }
              error={!!errors.countryOfOrigin}
              className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
            >
              <option value="">{t('selectCountry')}</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
            {errors.countryOfOrigin && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.countryOfOrigin}
              </p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label
              htmlFor="website"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('website')}
            </label>
            <Input
              id="website"
              type="url"
              value={formData.website || ''}
              onChange={e => handleInputChange('website', e.target.value)}
              placeholder={t('websitePlaceholder')}
              error={!!errors.website}
              className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
            />
            {errors.website && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.website}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('websiteOptional')}
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
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {isLoading ? t('saving') : t('addNew')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
