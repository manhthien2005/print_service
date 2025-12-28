'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import {
  useUpdateStudentProfile,
  useUploadStudentAvatar,
} from '@/lib/api/services/student';
import type { StudentProfileResponse } from '@/types/api';
import { phoneNumberSchema } from '@/lib/validations/common';
import { z } from 'zod';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  t?: {
    title?: string;
    email?: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
    submit?: string;
    submitting?: string;
    success?: string;
    error?: string;
    phoneRequired?: string;
    phoneInvalid?: string;
    phoneMaxLength?: string;
    addressMaxLength?: string;
    profilePictureMaxLength?: string;
  };
  initialData: StudentProfileResponse;
  onSuccess?: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  locale: _locale,
  t = {},
  initialData,
  onSuccess,
}: EditProfileModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [profilePicture, setProfilePicture] = useState(
    initialData.profilePicture || ''
  );
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const updateProfile = useUpdateStudentProfile();
  const uploadAvatar = useUploadStudentAvatar();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPhoneNumber(initialData.phoneNumber || '');
      setAddress(initialData.address || '');
      setProfilePicture(initialData.profilePicture || '');
      setPhoneError(null);
      setAvatarFile(null);
    }
  }, [isOpen, initialData]);

  const avatarPreviewUrl = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    return profilePicture || initialData.profilePicture || '';
  }, [avatarFile, profilePicture, initialData.profilePicture]);

  useEffect(() => {
    return () => {
      if (avatarFile) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarFile]);

  // Validate phone number on change
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError(null);
    }
  };

  // Validate phone number on blur
  const handlePhoneBlur = () => {
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setPhoneError(t.phoneRequired ?? 'Số điện thoại là bắt buộc');
      return;
    }

    try {
      phoneNumberSchema.parse(cleanPhone.replace(/\s/g, ''));
      setPhoneError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPhoneError(error.errors[0]?.message || 'Số điện thoại không hợp lệ');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number using zod
    const cleanPhone = phoneNumber.trim();
    try {
      phoneNumberSchema.parse(cleanPhone.replace(/\s/g, ''));
      setPhoneError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          error.errors[0]?.message || 'Số điện thoại không hợp lệ';
        setPhoneError(errorMessage);
        toast.error(errorMessage);
      }
      return;
    }

    // Validate address (max 500 chars)
    if (address && address.length > 500) {
      toast.error(
        t.addressMaxLength ?? 'Địa chỉ không được vượt quá 500 ký tự'
      );
      return;
    }

    // Build request payload - only include fields that have values
    const request: {
      phoneNumber?: string;
      address?: string;
      profilePicture?: string;
    } = {};

    if (cleanPhone !== (initialData.phoneNumber || '')) {
      request.phoneNumber = cleanPhone;
    }
    if (address.trim() !== (initialData.address || '')) {
      request.address = address.trim();
    }
    // Avatar is only uploaded via file, not URL

    try {
      // Nothing to do?
      if (!avatarFile && Object.keys(request).length === 0) {
        toast.error('Không có thay đổi nào để lưu');
        return;
      }

      // Run updates
      if (Object.keys(request).length > 0) {
        await updateProfile.mutateAsync(request);
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await uploadAvatar.mutateAsync(formData);
      }

      toast.success(t.success ?? 'Cập nhật thông tin thành công');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (t.error ?? 'Không thể cập nhật thông tin');
      toast.error(message);
    }
  };

  const isSubmitting = updateProfile.isPending || uploadAvatar.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.title ?? 'Chỉnh sửa hồ sơ'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          {/* Email - Read Only */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              {t.email ?? 'Email'}
            </label>
            <Input
              type="email"
              value={initialData.email}
              disabled
              className="h-11 bg-muted dark:bg-muted"
            />
            <p className="text-xs text-slate-600 dark:text-white/80">
              Email không thể thay đổi
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              {t.phone ?? 'Số điện thoại'}{' '}
              <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={e => handlePhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              placeholder="0912345678"
              required
              disabled={isSubmitting}
              maxLength={15}
              className={`h-11 ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {phoneError ? (
              <p className="text-xs text-destructive dark:text-destructive">
                {phoneError}
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-white/80">
                Tối đa 15 ký tự, chỉ chứa số (10-15 chữ số)
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              {t.address ?? 'Địa chỉ'}
            </label>
            <Input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Lê Lợi, Quận 1, TP.HCM"
              disabled={isSubmitting}
              maxLength={500}
              className="h-11"
            />
            <p className="text-xs text-slate-600 dark:text-white/80">
              Tối đa 500 ký tự ({address.length}/500)
            </p>
          </div>

          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              {t.profilePicture ?? 'Ảnh đại diện'}
            </label>
            <label
              htmlFor="avatar-upload"
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-all hover:border-sky-400 hover:bg-sky-50/50 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-sky-500 dark:hover:bg-slate-800/80"
            >
              <input
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setAvatarFile(file);
                }}
                disabled={isSubmitting}
                className="hidden"
              />
              {avatarPreviewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <img
                      src={avatarPreviewUrl}
                      alt="Preview"
                      className="h-24 w-24 rounded-full border-2 border-slate-200 object-cover shadow-md dark:border-slate-700"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {avatarFile && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-white/90">
                    {avatarFile
                      ? 'Nhấn để chọn ảnh khác'
                      : 'Nhấn để thay đổi ảnh'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-slate-200 p-4 dark:bg-slate-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-slate-500 dark:text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-white/90">
                      Nhấn để chọn ảnh đại diện
                    </span>
                    <p className="mt-1 text-xs text-slate-500 dark:text-white/70">
                      JPG, JPEG, PNG, GIF, WEBP (tối đa 5MB)
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !!phoneError}
            className="bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            {isSubmitting
              ? (t.submitting ?? 'Đang xử lý...')
              : (t.submit ?? 'Lưu thay đổi')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
