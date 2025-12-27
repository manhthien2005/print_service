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
    // Only allow manual URL when no file selected
    if (
      !avatarFile &&
      profilePicture.trim() !== (initialData.profilePicture || '')
    ) {
      request.profilePicture = profilePicture.trim();
    }

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
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
              {t.email ?? 'Email'}
            </label>
            <Input
              type="email"
              value={initialData.email}
              disabled
              className="h-11 bg-slate-50 dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500 dark:text-white/70">
              Email không thể thay đổi
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
              {t.phone ?? 'Số điện thoại'}{' '}
              <span className="text-red-500">*</span>
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
              <p className="text-xs text-red-600 dark:text-red-400">
                {phoneError}
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-white/70">
                Tối đa 15 ký tự, chỉ chứa số (10-15 chữ số)
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
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
            <p className="text-xs text-slate-500 dark:text-white/70">
              Tối đa 500 ký tự ({address.length}/500)
            </p>
          </div>

          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
              {t.profilePicture ?? 'Ảnh đại diện'}
            </label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              onChange={e => {
                const file = e.target.files?.[0] || null;
                setAvatarFile(file);
              }}
              disabled={isSubmitting}
              className="h-11"
            />
            <p className="text-xs text-slate-500 dark:text-white/70">
              Hỗ trợ JPG, JPEG, PNG, GIF, WEBP. Tối đa 5MB.
            </p>
            {!avatarFile && (
              <Input
                type="url"
                value={profilePicture}
                onChange={e => setProfilePicture(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                disabled={isSubmitting}
                maxLength={500}
                className="h-11"
              />
            )}
            <p className="text-xs text-slate-500 dark:text-white/70">
              Có thể dán URL hoặc chọn file để tải lên
            </p>
            {avatarPreviewUrl && (
              <div className="mt-2">
                <img
                  src={avatarPreviewUrl}
                  alt="Preview"
                  className="h-20 w-20 rounded-full border-2 border-slate-200 object-cover dark:border-slate-700"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
