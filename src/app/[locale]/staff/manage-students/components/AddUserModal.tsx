'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  useCreateUser,
  type CreateUserRequest,
} from '@/lib/api/services/adminUsers';
import { toast } from '@/components/ui/Toast';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const t = useTranslations('staff.manageStudents');
  const createUser = useCreateUser();
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    fullName: '',
    password: '',
    userType: 'student',
    studentCode: '',
    classId: '',
    enrollmentDate: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: undefined,
    citizenId: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: '',
        fullName: '',
        password: '',
        userType: 'student',
        studentCode: '',
        classId: '',
        enrollmentDate: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: undefined,
        citizenId: '',
        address: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (
    field: keyof CreateUserRequest,
    value: string | undefined
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

    if (!formData.email?.trim()) {
      newErrors.email = t('addUserModal.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('addUserModal.validation.emailInvalid');
    }

    if (!formData.fullName?.trim()) {
      newErrors.fullName = t('addUserModal.validation.fullNameRequired');
    }

    if (!formData.password?.trim()) {
      newErrors.password = t('addUserModal.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('addUserModal.validation.passwordMinLength');
    }

    if (!formData.userType) {
      newErrors.userType = t('addUserModal.validation.userTypeRequired');
    }

    // Student specific validations
    if (formData.userType === 'student') {
      if (!formData.studentCode?.trim()) {
        newErrors.studentCode = t(
          'addUserModal.validation.studentCodeRequired'
        );
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

    try {
      // Prepare request data - remove empty optional fields
      const requestData: CreateUserRequest = {
        email: formData.email!,
        fullName: formData.fullName!,
        password: formData.password!,
        userType: formData.userType!,
        ...(formData.studentCode && { studentCode: formData.studentCode }),
        ...(formData.classId && { classId: formData.classId }),
        ...(formData.enrollmentDate && {
          enrollmentDate: formData.enrollmentDate,
        }),
        ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
        ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.citizenId && { citizenId: formData.citizenId }),
        ...(formData.address && { address: formData.address }),
      };

      const response = await createUser.mutateAsync(requestData);

      if (response.data.success) {
        toast.success(t('errors.createUserSuccess'));
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t('errors.createUserFailed');
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!createUser.isPending) {
      setErrors({});
      onClose();
    }
  };

  const isStudent = formData.userType === 'student';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('addUserModal.title')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* User Type */}
          <div className="space-y-2">
            <label
              htmlFor="userType"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('addUserModal.userTypeLabel')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <Select
              id="userType"
              value={formData.userType || ''}
              onChange={e =>
                handleInputChange(
                  'userType',
                  e.target.value as 'student' | 'staff'
                )
              }
              error={!!errors.userType}
              className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
            >
              <option value="student">
                {t('addUserModal.userTypeStudent')}
              </option>
              <option value="staff">{t('addUserModal.userTypeStaff')}</option>
            </Select>
            {errors.userType && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.userType}
              </p>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('addUserModal.emailLabel')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
                error={!!errors.email}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('addUserModal.fullNameLabel')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <Input
                id="fullName"
                value={formData.fullName || ''}
                onChange={e => handleInputChange('fullName', e.target.value)}
                placeholder="Nguyễn Văn A"
                error={!!errors.fullName}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.fullName}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('addUserModal.passwordLabel')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password || ''}
              onChange={e => handleInputChange('password', e.target.value)}
              placeholder={t('addUserModal.passwordHint')}
              error={!!errors.password}
              className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
            />
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('addUserModal.passwordHint')}
            </p>
          </div>

          {/* Student Specific Fields */}
          {isStudent && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Student Code */}
                <div className="space-y-2">
                  <label
                    htmlFor="studentCode"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t('addUserModal.studentCodeLabel')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="studentCode"
                    value={formData.studentCode || ''}
                    onChange={e =>
                      handleInputChange('studentCode', e.target.value)
                    }
                    placeholder="21520001"
                    error={!!errors.studentCode}
                    className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                  />
                  {errors.studentCode && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.studentCode}
                    </p>
                  )}
                </div>

                {/* Enrollment Date */}
                <div className="space-y-2">
                  <label
                    htmlFor="enrollmentDate"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t('addUserModal.enrollmentDateLabel')}
                  </label>
                  <DatePicker
                    value={formData.enrollmentDate || ''}
                    onChange={date => handleInputChange('enrollmentDate', date)}
                    placeholder={t('addUserModal.enrollmentDatePlaceholder')}
                    max={new Date().toISOString().split('T')[0]}
                    className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
                  />
                </div>
              </div>

              {/* Class ID - TODO: Replace with actual class dropdown when API available */}
              <div className="space-y-2">
                <label
                  htmlFor="classId"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t('addUserModal.classIdLabel')}
                </label>
                <Input
                  id="classId"
                  value={formData.classId || ''}
                  onChange={e => handleInputChange('classId', e.target.value)}
                  placeholder={t('addUserModal.classIdPlaceholder')}
                  className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('addUserModal.classIdHint')}
                </p>
              </div>
            </>
          )}

          {/* Optional Personal Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Phone Number */}
            <div className="space-y-2">
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('addUserModal.phoneNumberLabel')}
              </label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={e => handleInputChange('phoneNumber', e.target.value)}
                placeholder="0123456789"
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label
                htmlFor="dateOfBirth"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('addUserModal.dateOfBirthLabel')}
              </label>
              <DatePicker
                value={formData.dateOfBirth || ''}
                onChange={date => handleInputChange('dateOfBirth', date)}
                placeholder={t('addUserModal.dateOfBirthPlaceholder')}
                max={new Date().toISOString().split('T')[0]}
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Gender */}
            <div className="space-y-2">
              <label
                htmlFor="gender"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('addUserModal.genderLabel')}
              </label>
              <Select
                id="gender"
                value={formData.gender || ''}
                onChange={e =>
                  handleInputChange(
                    'gender',
                    e.target.value as 'male' | 'female' | 'other' | undefined
                  )
                }
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
              >
                <option value="">{t('addUserModal.genderPlaceholder')}</option>
                <option value="male">{t('addUserModal.genderMale')}</option>
                <option value="female">{t('addUserModal.genderFemale')}</option>
                <option value="other">{t('addUserModal.genderOther')}</option>
              </Select>
            </div>

            {/* Citizen ID */}
            <div className="space-y-2">
              <label
                htmlFor="citizenId"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('addUserModal.citizenIdLabel')}
              </label>
              <Input
                id="citizenId"
                value={formData.citizenId || ''}
                onChange={e => handleInputChange('citizenId', e.target.value)}
                placeholder="012345678901"
                className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('addUserModal.addressLabel')}
            </label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={e => handleInputChange('address', e.target.value)}
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
              className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
            />
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
              disabled={createUser.isPending}
              className="border border-slate-300 bg-slate-200 text-slate-900 hover:border-slate-400 hover:bg-slate-300 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600"
            >
              {t('addUserModal.cancelButton')}
            </Button>
            <Button
              type="submit"
              disabled={createUser.isPending}
              className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {createUser.isPending
                ? t('loading.creating')
                : t('addUserModal.submitButton')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
