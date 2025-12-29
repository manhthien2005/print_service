'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils/cn';
import { Model3DViewer } from './Model3DViewer';

export interface PrinterModel {
  modelId: string;
  brandId?: string;
  brandName: string;
  modelName: string;
  description: string;
  maxPaperSize: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  imageUrl2D?: string;
  imageUrl3D?: string;
  createdAt: string;
}

export interface Brand {
  brandId: string;
  brandName: string;
}

interface EditPrinterModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: PrinterModel | null;
  brands: Brand[];
  pageSizes: string[];
  onSave: (updatedModel: Partial<PrinterModel>) => Promise<void>;
}

export const EditPrinterModelModal: React.FC<EditPrinterModelModalProps> = ({
  isOpen,
  onClose,
  model,
  brands,
  pageSizes,
  onSave,
}) => {
  const t = useTranslations('staff.managePrinters.modals.editModel');
  const [formData, setFormData] = useState<Partial<PrinterModel>>({
    brandId: '',
    modelName: '',
    description: '',
    maxPaperSize: '',
    supportsColor: false,
    supportsDuplex: false,
    imageUrl2D: '',
    imageUrl3D: '',
  });

  const [preview2D, setPreview2D] = useState<string | null>(null);
  const [preview3D, setPreview3D] = useState<string | null>(null);
  // File uploads are handled separately in the parent component
  // const [file2D, setFile2D] = useState<File | null>(null);
  // const [file3D, setFile3D] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInput2DRef = useRef<HTMLInputElement>(null);
  const fileInput3DRef = useRef<HTMLInputElement>(null);

  // Initialize form data when model changes
  useEffect(() => {
    if (model) {
      setFormData({
        brandId: model.brandId || '',
        modelName: model.modelName || '',
        description: model.description || '',
        maxPaperSize: model.maxPaperSize || '',
        supportsColor: model.supportsColor || false,
        supportsDuplex: model.supportsDuplex || false,
        imageUrl2D: model.imageUrl2D || '',
        imageUrl3D: model.imageUrl3D || '',
      });
      // Set preview URLs - use provided URLs or empty for upload placeholder
      setPreview2D(model.imageUrl2D || null);
      setPreview3D(model.imageUrl3D || null);
      // Clear file objects when model changes (handled in parent)
      // setFile2D(null);
      // setFile3D(null);
      setErrors({});
    }
  }, [model]);

  const handleInputChange = (
    field: keyof PrinterModel,
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

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: '2D' | '3D'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === '2D') {
      // 2D: Only accept image files
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image2D: t('errors.invalidImage2D'),
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image2D: t('errors.image2DTooLarge'),
        }));
        return;
      }

      // Store the File object for upload (handled in parent)
      // setFile2D(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview2D(result);
        // Keep the original URL if it exists, otherwise use preview
        setFormData(prev => ({
          ...prev,
          imageUrl2D: prev.imageUrl2D || result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // 3D: Accept GLB, USDZ, GLTF files
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const allowed3DFormats = ['glb', 'usdz', 'gltf'];

      if (!allowed3DFormats.includes(fileExtension || '')) {
        setErrors(prev => ({
          ...prev,
          image3D: t('errors.invalidImage3D'),
        }));
        return;
      }

      // Validate file size (max 20MB for 3D models)
      if (file.size > 20 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image3D: t('errors.image3DTooLarge'),
        }));
        return;
      }

      // Store the File object for upload (handled in parent)
      // setFile3D(file);
      // Create object URL for 3D model preview
      const objectUrl = URL.createObjectURL(file);
      setPreview3D(objectUrl);
      // Keep the original URL if it exists, otherwise use preview
      setFormData(prev => ({
        ...prev,
        imageUrl3D: prev.imageUrl3D || objectUrl,
      }));
    }
  };

  const handleRemoveImage = (type: '2D' | '3D') => {
    if (type === '2D') {
      setPreview2D(null);
      // setFile2D(null);
      setFormData(prev => ({ ...prev, imageUrl2D: '' }));
      if (fileInput2DRef.current) {
        fileInput2DRef.current.value = '';
      }
    } else {
      // Revoke object URL to free memory
      if (preview3D && preview3D.startsWith('blob:')) {
        URL.revokeObjectURL(preview3D);
      }
      setPreview3D(null);
      // setFile3D(null);
      setFormData(prev => ({ ...prev, imageUrl3D: '' }));
      if (fileInput3DRef.current) {
        fileInput3DRef.current.value = '';
      }
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (preview3D && preview3D.startsWith('blob:')) {
        URL.revokeObjectURL(preview3D);
      }
    };
  }, [preview3D]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brandId) {
      newErrors.brandId = t('errors.brandRequired');
    }
    if (!formData.modelName?.trim()) {
      newErrors.modelName = t('errors.modelNameRequired');
    }
    if (!formData.maxPaperSize) {
      newErrors.maxPaperSize = t('errors.paperSizeRequired');
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
      // Pass formData only (file2D and file3D are handled separately in the parent)
      await onSave({
        ...formData,
      } as Partial<PrinterModel>);
      onClose();
    } catch (error) {
      console.error('Error saving model:', error);
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
      setPreview2D(null);
      setPreview3D(null);
      // setFile2D(null);
      // setFile3D(null);
      // Revoke blob URLs if they exist
      if (preview3D && preview3D.startsWith('blob:')) {
        URL.revokeObjectURL(preview3D);
      }
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={model ? t('title') : t('addTitle')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 pb-6">
        <div className="space-y-6">
          {/* Image Preview Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 2D Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('image2D')}
              </label>
              <div className="relative">
                {preview2D ? (
                  <div className="group relative h-80 overflow-hidden rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/30">
                    <img
                      src={preview2D}
                      alt="2D Preview"
                      className="h-full w-full object-contain p-4"
                      onError={e => {
                        // Fallback to default image if error
                        (e.target as HTMLImageElement).src =
                          '/images/printer-2d.svg';
                      }}
                    />
                    {/* Buttons in bottom-right corner - only visible on hover, doesn't block interaction */}
                    <div className="pointer-events-none absolute bottom-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInput2DRef.current?.click()}
                        className="pointer-events-auto border border-slate-300 bg-slate-200 text-slate-900 shadow-lg hover:border-slate-400 hover:bg-slate-300 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600"
                      >
                        {t('change')}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveImage('2D')}
                        className="pointer-events-auto border border-red-400 bg-red-500/20 text-red-700 shadow-lg hover:border-red-500 hover:bg-red-500/30 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-500/30"
                      >
                        {t('remove')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInput2DRef.current?.click()}
                    className="flex h-80 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300/50 bg-slate-50/50 backdrop-blur-sm transition-all hover:border-slate-400 hover:bg-slate-100/50 dark:border-white/10 dark:bg-slate-800/20 dark:hover:border-white/20 dark:hover:bg-white/5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mb-2 h-12 w-12 text-slate-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t('clickToUpload2D')}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {t('fileFormat2D')}
                    </p>
                  </div>
                )}
                <input
                  ref={fileInput2DRef}
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, '2D')}
                  className="hidden"
                />
              </div>
              {errors.image2D && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.image2D}
                </p>
              )}
            </div>

            {/* 3D Model */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('model3D')}
              </label>
              <div className="relative">
                {preview3D ? (
                  <div className="group relative h-80 overflow-hidden rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/30">
                    <Model3DViewer
                      src={preview3D}
                      alt="3D Model Preview"
                      className="h-full w-full"
                      autoRotate={false}
                      cameraControls={true}
                      onError={() => {
                        setErrors(prev => ({
                          ...prev,
                          image3D: t('errors.load3DError'),
                        }));
                      }}
                    />
                    {/* Buttons in bottom-right corner - only visible on hover, doesn't block interaction */}
                    <div className="pointer-events-none absolute bottom-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInput3DRef.current?.click()}
                        className="pointer-events-auto border border-slate-300 bg-slate-200 text-slate-900 shadow-lg hover:border-slate-400 hover:bg-slate-300 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600"
                      >
                        {t('change')}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveImage('3D')}
                        className="pointer-events-auto border border-red-400 bg-red-500/20 text-red-700 shadow-lg hover:border-red-500 hover:bg-red-500/30 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-500/30"
                      >
                        {t('remove')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInput3DRef.current?.click()}
                    className="flex h-80 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300/50 bg-slate-50/50 backdrop-blur-sm transition-all hover:border-slate-400 hover:bg-slate-100/50 dark:border-white/10 dark:bg-slate-800/20 dark:hover:border-white/20 dark:hover:bg-white/5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mb-2 h-12 w-12 text-slate-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                      />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t('clickToUpload3D')}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {t('fileFormat3D')}
                    </p>
                  </div>
                )}
                <input
                  ref={fileInput3DRef}
                  type="file"
                  accept=".glb,.usdz,.gltf,model/gltf-binary,model/gltf+json"
                  onChange={e => handleImageUpload(e, '3D')}
                  className="hidden"
                />
              </div>
              {errors.image3D && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.image3D}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Brand */}
            <div className="space-y-2">
              <label
                htmlFor="brandId"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('brand')} <span className="text-red-500">*</span>
              </label>
              <Select
                id="brandId"
                value={formData.brandId || ''}
                onChange={e => handleInputChange('brandId', e.target.value)}
                error={!!errors.brandId}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              >
                <option value="">{t('selectBrand')}</option>
                {brands.map(brand => (
                  <option key={brand.brandId} value={brand.brandId}>
                    {brand.brandName}
                  </option>
                ))}
              </Select>
              {errors.brandId && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.brandId}
                </p>
              )}
            </div>

            {/* Model Name */}
            <div className="space-y-2">
              <label
                htmlFor="modelName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('modelName')} <span className="text-red-500">*</span>
              </label>
              <Input
                id="modelName"
                value={formData.modelName || ''}
                onChange={e => handleInputChange('modelName', e.target.value)}
                placeholder={t('modelNamePlaceholder')}
                error={!!errors.modelName}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
              />
              {errors.modelName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.modelName}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('description')}
            </label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              className={cn(
                'flex w-full rounded-lg border border-slate-200/50 bg-white/50 px-3 py-2 text-sm text-slate-900 ring-offset-background backdrop-blur-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30',
                errors.description &&
                  'border-red-500 focus-visible:ring-red-500 dark:border-red-500'
              )}
            />
          </div>

          {/* Max Paper Size */}
          <div className="space-y-2">
            <label
              htmlFor="maxPaperSize"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('maxPaperSize')} <span className="text-red-500">*</span>
            </label>
            <Select
              id="maxPaperSize"
              value={formData.maxPaperSize || ''}
              onChange={e => handleInputChange('maxPaperSize', e.target.value)}
              error={!!errors.maxPaperSize}
              className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-blue-500 dark:border-white/10 dark:bg-slate-800/30 dark:text-white"
            >
              <option value="">{t('selectPaperSize')}</option>
              {pageSizes.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
            {errors.maxPaperSize && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.maxPaperSize}
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('features')}
            </label>
            <div className="flex flex-wrap gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={formData.supportsColor || false}
                  onChange={e =>
                    handleInputChange('supportsColor', e.target.checked)
                  }
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {t('supportsColor')}
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={formData.supportsDuplex || false}
                  onChange={e =>
                    handleInputChange('supportsDuplex', e.target.checked)
                  }
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {t('supportsDuplex')}
                </span>
              </label>
            </div>
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
              {isLoading ? t('saving') : model ? t('saveChanges') : t('addNew')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
