'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import countries from 'i18n-iso-countries';
// Import and register locales
import enLocale from 'i18n-iso-countries/langs/en.json';
import viLocale from 'i18n-iso-countries/langs/vi.json';

// Register locales (runs once when module loads)
countries.registerLocale(enLocale);
countries.registerLocale(viLocale);

export interface Brand {
  brandId: string;
  brandName: string;
  countryOfOrigin: string;
  website: string;
  createdAt: string;
}

interface EditBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  onSave: (updatedBrand: Partial<Brand>) => Promise<void>;
}

export const EditBrandModal: React.FC<EditBrandModalProps> = ({
  isOpen,
  onClose,
  brand,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Brand>>({
    brandName: '',
    countryOfOrigin: '',
    website: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get all countries from i18n-iso-countries library
  const countryList = useMemo(() => {
    const countryCodes = countries.getNames('en', { select: 'official' });
    const countryArray = Object.entries(countryCodes).map(([code, name]) => ({
      code,
      name: name as string,
    }));

    // Sort by country name alphabetically
    countryArray.sort((a, b) => a.name.localeCompare(b.name));

    // Add "Other" option at the end
    countryArray.push({ code: 'OTHER', name: 'Other' });

    return countryArray;
  }, []);

  // Initialize form data when brand changes
  useEffect(() => {
    if (brand) {
      setFormData({
        brandName: brand.brandName || '',
        countryOfOrigin: brand.countryOfOrigin || '',
        website: brand.website || '',
      });
      setErrors({});
    }
  }, [brand]);

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
      newErrors.brandName = 'Vui lòng nhập tên hãng';
    }
    if (!formData.countryOfOrigin) {
      newErrors.countryOfOrigin = 'Vui lòng chọn quốc gia';
    }
    if (formData.website && formData.website.trim()) {
      // Basic URL validation
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.website)) {
        newErrors.website = 'URL không hợp lệ';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={brand ? 'Sửa Hãng Máy In' : 'Thêm Hãng Máy In'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 pb-6">
        <div className="space-y-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <label
              htmlFor="brandName"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Tên Hãng <span className="text-red-500">*</span>
            </label>
            <Input
              id="brandName"
              value={formData.brandName || ''}
              onChange={e => handleInputChange('brandName', e.target.value)}
              placeholder="VD: HP, Canon, Epson"
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
              Quốc Gia <span className="text-red-500">*</span>
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
              <option value="">Chọn quốc gia</option>
              {countryList.map(country => (
                <option key={country.code} value={country.name}>
                  {country.name}
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
              Website
            </label>
            <Input
              id="website"
              value={formData.website || ''}
              onChange={e => handleInputChange('website', e.target.value)}
              placeholder="https://www.example.com"
              error={!!errors.website}
              className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
            />
            {errors.website && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.website}
              </p>
            )}
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
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {isLoading ? 'Đang lưu...' : brand ? 'Lưu thay đổi' : 'Thêm hãng'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
