'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Tabs } from '@/components/ui/Tabs';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  useGetUserDetail,
  useUpdateUser,
  useGetBalance,
  usePrintStats,
  useResetPassword,
  type UpdateUserRequest,
  type AdminUserDetailResponse,
  type AdminResetPasswordRequest,
} from '@/lib/api/services/adminUsers';
import { useAllClasses } from '@/lib/api/services/references';
import { CreditBalanceModal } from './CreditBalanceModal';
import { DebitBalanceModal } from './DebitBalanceModal';
import { toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/common/Skeleton';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onSuccess?: () => void;
}

type TabValue = 'personal' | 'account';

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}) => {
  const t = useTranslations('staff.manageStudents');
  const { data: userDetailResponse, isLoading: isLoadingDetail } =
    useGetUserDetail(userId);
  const updateUser = useUpdateUser();
  const { data: balanceResponse, isLoading: isLoadingBalance } =
    useGetBalance(userId);
  const { data: printStatsResponse, isLoading: isLoadingPrintStats } =
    usePrintStats(userId);
  const resetPassword = useResetPassword();
  const { data: classesData, isLoading: isLoadingClasses } = useAllClasses();

  const userDetail: AdminUserDetailResponse | undefined =
    userDetailResponse?.data?.data;
  const balance = balanceResponse?.data?.data;
  const printStats = printStatsResponse?.data?.data;

  const [activeTab, setActiveTab] = useState<TabValue>('personal');
  const [formData, setFormData] = useState<UpdateUserRequest>({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: undefined,
    citizenId: '',
    address: '',
    studentCode: '',
    classId: '',
    enrollmentDate: '',
    studentStatus: undefined,
  });

  const [resetPasswordData, setResetPasswordData] =
    useState<AdminResetPasswordRequest>({
      newPassword: '',
      sendEmail: true,
    });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetPasswordErrors, setResetPasswordErrors] = useState<
    Record<string, string>
  >({});
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  );

  // Character limits
  const MAX_LENGTHS = {
    fullName: 50,
    studentCode: 10,
    phoneNumber: 11,
    citizenId: 12,
    address: 100,
  };

  // Initialize form data when user detail loads
  useEffect(() => {
    if (userDetail && isOpen) {
      setFormData({
        fullName: userDetail.fullName || '',
        phoneNumber: userDetail.phoneNumber || '',
        dateOfBirth: userDetail.dateOfBirth
          ? userDetail.dateOfBirth.split('T')[0]
          : '',
        gender:
          (userDetail.gender as 'male' | 'female' | 'other' | undefined) ||
          undefined,
        citizenId: userDetail.citizenId || '',
        address: userDetail.address || '',
        studentCode: userDetail.studentCode || '',
        classId: userDetail.classId || '',
        enrollmentDate: userDetail.enrollmentDate
          ? userDetail.enrollmentDate.split('T')[0]
          : '',
        studentStatus:
          (userDetail.studentStatus as
            | 'active'
            | 'graduated'
            | 'suspended'
            | 'withdrawn'
            | undefined) || undefined,
      });
      setErrors({});
      setResetPasswordData({ newPassword: '', sendEmail: true });
      setResetPasswordErrors({});
      setTemporaryPassword(null);
      setActiveTab('personal');
    }
  }, [userDetail, isOpen]);

  const handleInputChange = (
    field: keyof UpdateUserRequest,
    value: string | undefined
  ) => {
    // Apply character limits and filters
    if (value !== undefined) {
      const maxLength = MAX_LENGTHS[field as keyof typeof MAX_LENGTHS];

      // Filter invalid characters based on field type
      let filteredValue = value;

      if (field === 'fullName') {
        // Only allow letters, spaces, and Vietnamese characters (no numbers, no special chars except spaces)
        filteredValue = value.replace(
          /[^a-zA-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]/g,
          ''
        );
      } else if (field === 'studentCode') {
        // Only allow alphanumeric (no special characters)
        filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
      } else if (field === 'phoneNumber') {
        // Only allow numbers
        filteredValue = value.replace(/[^0-9]/g, '');
      } else if (field === 'citizenId') {
        // Only allow numbers
        filteredValue = value.replace(/[^0-9]/g, '');
      }

      // Apply max length
      if (maxLength && filteredValue.length > maxLength) {
        filteredValue = filteredValue.substring(0, maxLength);
      }

      value = filteredValue;
    }

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

    // Full name validation
    if (formData.fullName && formData.fullName.trim()) {
      // Check for numbers or special characters
      if (/[0-9]/.test(formData.fullName)) {
        newErrors.fullName = 'Họ tên không được chứa số';
      } else if (
        /[^a-zA-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]/.test(
          formData.fullName
        )
      ) {
        newErrors.fullName = 'Họ tên không được chứa ký tự đặc biệt';
      } else if (formData.fullName.length > MAX_LENGTHS.fullName) {
        newErrors.fullName = `Họ tên không được vượt quá ${MAX_LENGTHS.fullName} ký tự`;
      }
    }

    // Student code validation
    if (formData.studentCode && formData.studentCode.trim()) {
      // Check for special characters
      if (/[^a-zA-Z0-9]/.test(formData.studentCode)) {
        newErrors.studentCode = 'Mã sinh viên không được chứa ký tự đặc biệt';
      } else if (formData.studentCode.length > MAX_LENGTHS.studentCode) {
        newErrors.studentCode = `Mã sinh viên không được vượt quá ${MAX_LENGTHS.studentCode} ký tự`;
      }
    }

    // Phone number validation
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^[0-9]+$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = t(
          'editUserModal.validation.phoneNumberNumericOnly'
        );
      } else if (formData.phoneNumber.length > MAX_LENGTHS.phoneNumber) {
        newErrors.phoneNumber = t(
          'editUserModal.validation.phoneNumberMaxLength',
          {
            max: MAX_LENGTHS.phoneNumber,
          }
        );
      }
    }

    // Citizen ID validation
    if (formData.citizenId && formData.citizenId.trim()) {
      const citizenIdRegex = /^[0-9]+$/;
      if (!citizenIdRegex.test(formData.citizenId)) {
        newErrors.citizenId = 'CMND/CCCD chỉ được chứa số';
      } else if (formData.citizenId.length > MAX_LENGTHS.citizenId) {
        newErrors.citizenId = `CMND/CCCD không được vượt quá ${MAX_LENGTHS.citizenId} ký tự`;
      }
    }

    // Address validation
    if (formData.address && formData.address.length > MAX_LENGTHS.address) {
      newErrors.address = `Địa chỉ không được vượt quá ${MAX_LENGTHS.address} ký tự`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetPassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (resetPasswordData.newPassword) {
      if (resetPasswordData.newPassword.length < 8) {
        newErrors.newPassword = t('editUserModal.validation.passwordMinLength');
      } else if (resetPasswordData.newPassword.length > 100) {
        newErrors.newPassword = t('editUserModal.validation.passwordMaxLength');
      }
    }

    setResetPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !userId) {
      return;
    }

    try {
      // Prepare request data - only include fields that have values
      const requestData: UpdateUserRequest = {};
      if (formData.fullName) requestData.fullName = formData.fullName;
      if (formData.phoneNumber) requestData.phoneNumber = formData.phoneNumber;
      if (formData.dateOfBirth) requestData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) requestData.gender = formData.gender;
      if (formData.citizenId) requestData.citizenId = formData.citizenId;
      if (formData.address) requestData.address = formData.address;
      if (formData.studentCode) requestData.studentCode = formData.studentCode;
      if (formData.classId) requestData.classId = formData.classId;
      if (formData.enrollmentDate)
        requestData.enrollmentDate = formData.enrollmentDate;
      if (formData.studentStatus)
        requestData.studentStatus = formData.studentStatus;

      const response = await updateUser.mutateAsync({
        userId,
        data: requestData,
      });

      if (response.data.success) {
        toast.success(t('errors.updateUserSuccess'));
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t('errors.updateUserFailed');
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateResetPassword() || !userId) {
      return;
    }

    try {
      const requestData: AdminResetPasswordRequest = {
        sendEmail: resetPasswordData.sendEmail ?? true,
      };
      if (resetPasswordData.newPassword?.trim()) {
        requestData.newPassword = resetPasswordData.newPassword.trim();
      }

      const response = await resetPassword.mutateAsync({
        userId,
        data: requestData,
      });

      if (response.data.success) {
        const tempPassword = response.data.data?.temporaryPassword;
        if (tempPassword) {
          setTemporaryPassword(tempPassword);
        }
        toast.success(
          response.data.message || t('errors.resetPasswordSuccess')
        );
        setResetPasswordData({ newPassword: '', sendEmail: true });
        setResetPasswordErrors({});
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t('errors.resetPasswordFailed');
      setResetPasswordErrors({ submit: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!updateUser.isPending && !resetPassword.isPending) {
      setErrors({});
      setResetPasswordErrors({});
      setTemporaryPassword(null);
      onClose();
    }
  };

  const handleBalanceModalClose = () => {
    setShowCreditModal(false);
    setShowDebitModal(false);
  };

  const isStudent = userDetail?.userType === 'student';

  if (isLoadingDetail && isOpen) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('editUserModal.title')}
        size="lg"
      >
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500 dark:text-slate-400">
              {t('editUserModal.loadingUserInfo')}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (!userDetail && isOpen) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('editUserModal.title')}
        size="lg"
      >
        <div className="p-6">
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {t('errors.loadUserFailed')}
          </div>
        </div>
      </Modal>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('editUserModal.title')}
        size="lg"
      >
        <div className="p-6">
          {/* User Info Display - Read Only Fields */}
          <div className="mb-6 rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs font-semibold uppercase text-slate-500 dark:text-white/50">
              {t('editUserModal.accountInfoTitle')}
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  Email:
                </span>
                <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  {userDetail?.email}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ({t('editUserModal.locked')})
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-white/70">
                  {t('editUserModal.typeLabel')}:
                </span>
                <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  {userDetail?.userType === 'student'
                    ? t('editUserModal.typeStudent')
                    : t('editUserModal.typeStaff')}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ({t('editUserModal.locked')})
                  </span>
                </span>
              </div>
              {userDetail?.studentCode && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-white/70">
                    {t('editUserModal.studentCodeLabel')}:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {userDetail.studentCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            items={[
              { value: 'personal', label: t('modal.edit.tabs.personal') },
              { value: 'account', label: t('modal.edit.tabs.account') },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            className="mb-6"
          />

          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t('editUserModal.fullNameLabel')}
                </label>
                <Input
                  id="fullName"
                  value={formData.fullName || ''}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  maxLength={MAX_LENGTHS.fullName}
                  error={!!errors.fullName}
                  className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.fullName}
                  </p>
                )}
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
                        {t('editUserModal.studentCodeLabel')}
                      </label>
                      <Input
                        id="studentCode"
                        value={formData.studentCode || ''}
                        onChange={e =>
                          handleInputChange('studentCode', e.target.value)
                        }
                        placeholder="21520001"
                        maxLength={MAX_LENGTHS.studentCode}
                        error={!!errors.studentCode}
                        className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                      />
                      {errors.studentCode && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.studentCode}
                        </p>
                      )}
                    </div>

                    {/* Student Status */}
                    <div className="space-y-2">
                      <label
                        htmlFor="studentStatus"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        {t('editUserModal.studentStatusLabel')}
                      </label>
                      <Select
                        id="studentStatus"
                        value={formData.studentStatus || ''}
                        onChange={e =>
                          handleInputChange(
                            'studentStatus',
                            e.target.value as
                              | 'active'
                              | 'graduated'
                              | 'suspended'
                              | 'withdrawn'
                              | undefined
                          )
                        }
                        className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
                      >
                        <option value="">
                          {t('editUserModal.studentStatusPlaceholder')}
                        </option>
                        <option value="active">
                          {t('editUserModal.studentStatusActive')}
                        </option>
                        <option value="graduated">
                          {t('editUserModal.studentStatusGraduated')}
                        </option>
                        <option value="suspended">
                          {t('editUserModal.studentStatusSuspended')}
                        </option>
                        <option value="withdrawn">
                          {t('editUserModal.studentStatusWithdrawn')}
                        </option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Enrollment Date */}
                    <div className="space-y-2">
                      <label
                        htmlFor="enrollmentDate"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        {t('editUserModal.enrollmentDateLabel')}
                      </label>
                      <DatePicker
                        value={formData.enrollmentDate || ''}
                        onChange={date =>
                          handleInputChange('enrollmentDate', date)
                        }
                        placeholder={t(
                          'editUserModal.enrollmentDatePlaceholder'
                        )}
                        max={new Date().toISOString().split('T')[0]}
                        className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
                      />
                    </div>

                    {/* Class ID - Dropdown */}
                    <div className="space-y-2">
                      <label
                        htmlFor="classId"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        {t('editUserModal.classIdLabel')}
                      </label>
                      <Select
                        id="classId"
                        value={formData.classId || ''}
                        onChange={e =>
                          handleInputChange('classId', e.target.value)
                        }
                        disabled={isLoadingClasses}
                        error={!!errors.classId}
                        className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
                      >
                        <option value="">
                          {isLoadingClasses
                            ? 'Đang tải...'
                            : t('editUserModal.classIdPlaceholder')}
                        </option>
                        {classesData?.data?.data?.map(classItem => (
                          <option
                            key={classItem.classId}
                            value={classItem.classId}
                          >
                            {classItem.className}
                          </option>
                        ))}
                      </Select>
                      {errors.classId && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.classId}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Personal Info */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Phone Number */}
                <div className="space-y-2">
                  <label
                    htmlFor="phoneNumber"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t('editUserModal.phoneNumberLabel')}
                  </label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={e =>
                      handleInputChange('phoneNumber', e.target.value)
                    }
                    placeholder="0123456789"
                    maxLength={MAX_LENGTHS.phoneNumber}
                    error={!!errors.phoneNumber}
                    className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label
                    htmlFor="dateOfBirth"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t('editUserModal.dateOfBirthLabel')}
                  </label>
                  <DatePicker
                    value={formData.dateOfBirth || ''}
                    onChange={date => handleInputChange('dateOfBirth', date)}
                    placeholder={t('editUserModal.dateOfBirthPlaceholder')}
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
                    {t('editUserModal.genderLabel')}
                  </label>
                  <Select
                    id="gender"
                    value={formData.gender || ''}
                    onChange={e =>
                      handleInputChange(
                        'gender',
                        e.target.value as
                          | 'male'
                          | 'female'
                          | 'other'
                          | undefined
                      )
                    }
                    className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:focus-visible:ring-white/30"
                  >
                    <option value="">
                      {t('editUserModal.genderPlaceholder')}
                    </option>
                    <option value="male">
                      {t('editUserModal.genderMale')}
                    </option>
                    <option value="female">
                      {t('editUserModal.genderFemale')}
                    </option>
                    <option value="other">
                      {t('editUserModal.genderOther')}
                    </option>
                  </Select>
                </div>

                {/* Citizen ID */}
                <div className="space-y-2">
                  <label
                    htmlFor="citizenId"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t('editUserModal.citizenIdLabel')}
                  </label>
                  <Input
                    id="citizenId"
                    type="text"
                    value={formData.citizenId || ''}
                    onChange={e =>
                      handleInputChange('citizenId', e.target.value)
                    }
                    placeholder="012345678901"
                    maxLength={MAX_LENGTHS.citizenId}
                    error={!!errors.citizenId}
                    className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                  />
                  {errors.citizenId && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.citizenId}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t('editUserModal.addressLabel')}
                </label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  maxLength={MAX_LENGTHS.address}
                  error={!!errors.address}
                  className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.address}
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
                  disabled={updateUser.isPending}
                  className="border border-slate-300 bg-slate-200 text-slate-900 hover:border-slate-400 hover:bg-slate-300 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600"
                >
                  {t('editUserModal.cancelButton')}
                </Button>
                <Button
                  type="submit"
                  disabled={updateUser.isPending}
                  className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
                >
                  {updateUser.isPending
                    ? t('loading.saving')
                    : t('editUserModal.saveButton')}
                </Button>
              </div>
            </form>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Balance Section */}
              <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 text-sm font-semibold text-slate-700 dark:text-white">
                  {t('modal.edit.account.balance.title')}
                </div>
                {isLoadingBalance ? (
                  <Skeleton className="h-8 w-48" variant="shimmer" />
                ) : balance ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-white/70">
                        {t('modal.edit.account.balance.current')}:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(balance.currentBalance)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreditModal(true)}
                        className="flex-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                      >
                        {t('modal.edit.account.balance.credit')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDebitModal(true)}
                        className="flex-1 border-rose-500 text-rose-600 hover:bg-rose-50 dark:border-rose-400 dark:text-rose-400 dark:hover:bg-rose-900/20"
                      >
                        {t('modal.edit.account.balance.debit')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 dark:text-white/50">
                    {t('modal.edit.account.balance.noData')}
                  </div>
                )}
              </div>

              {/* Print Statistics Section */}
              <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 text-sm font-semibold text-slate-700 dark:text-white">
                  {t('modal.edit.account.printStats.title')}
                </div>
                {isLoadingPrintStats ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" variant="shimmer" />
                    <Skeleton className="h-4 w-full" variant="shimmer" />
                    <Skeleton className="h-4 w-3/4" variant="shimmer" />
                  </div>
                ) : printStats ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          {t('modal.edit.account.printStats.totalJobs')}:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {printStats.totalPrintJobs}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          {t('modal.edit.account.printStats.totalPages')}:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {printStats.totalPagesPrinted}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          {t('modal.edit.account.printStats.totalAmount')}:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(printStats.totalAmountSpent)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          {t('modal.edit.account.printStats.completed')}:
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {printStats.completedJobs}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          {t('modal.edit.account.printStats.failed')}:
                        </span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {printStats.failedJobs}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          {t('modal.edit.account.printStats.thisMonth')}:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {printStats.printJobsThisMonth}{' '}
                          {t('modal.edit.account.printStats.jobs')} /{' '}
                          {printStats.pagesThisMonth}{' '}
                          {t('modal.edit.account.printStats.pages')}
                        </span>
                      </div>
                    </div>
                    {printStats.lastPrintAt && (
                      <div className="col-span-2 flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          {t('modal.edit.account.printStats.lastPrint')}:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatDate(printStats.lastPrintAt)}
                        </span>
                      </div>
                    )}
                    {printStats.mostUsedPrinterName && (
                      <div className="col-span-2 flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          {t('modal.edit.account.printStats.mostUsedPrinter')}:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {printStats.mostUsedPrinterName}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 dark:text-white/50">
                    {t('modal.edit.account.printStats.noData')}
                  </div>
                )}
              </div>

              {/* Reset Password Section */}
              <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 text-sm font-semibold text-slate-700 dark:text-white">
                  {t('modal.edit.account.resetPassword.title')}
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {t('modal.edit.account.resetPassword.newPasswordLabel')}
                      <span className="ml-1 text-xs text-slate-500 dark:text-white/50">
                        ({t('modal.edit.account.resetPassword.optional')})
                      </span>
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={resetPasswordData.newPassword || ''}
                      onChange={e =>
                        setResetPasswordData(prev => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder={t(
                        'modal.edit.account.resetPassword.newPasswordPlaceholder'
                      )}
                      error={!!resetPasswordErrors.newPassword}
                      className="rounded-lg border-slate-200/50 bg-white/50 text-slate-900 backdrop-blur-sm placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-800/30 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/30"
                    />
                    {resetPasswordErrors.newPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {resetPasswordErrors.newPassword}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      {t('modal.edit.account.resetPassword.hint')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sendEmail"
                      checked={resetPasswordData.sendEmail ?? true}
                      onChange={e =>
                        setResetPasswordData(prev => ({
                          ...prev,
                          sendEmail: (e.target as HTMLInputElement).checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="sendEmail"
                      className="text-sm text-slate-700 dark:text-slate-300"
                    >
                      {t('modal.edit.account.resetPassword.sendEmail')}
                    </label>
                  </div>

                  {temporaryPassword && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                      <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {t(
                          'modal.edit.account.resetPassword.temporaryPassword'
                        )}
                        :
                      </div>
                      <div className="mt-1 font-mono text-lg font-bold text-emerald-900 dark:text-emerald-200">
                        {temporaryPassword}
                      </div>
                      <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                        {t(
                          'modal.edit.account.resetPassword.temporaryPasswordHint'
                        )}
                      </p>
                    </div>
                  )}

                  {resetPasswordErrors.submit && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {resetPasswordErrors.submit}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={resetPassword.isPending}
                      className="border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
                    >
                      {resetPassword.isPending
                        ? t('modal.edit.account.resetPassword.processing')
                        : t('modal.edit.account.resetPassword.submit')}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-200/50 pt-4 dark:border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border border-slate-300 bg-slate-200 text-slate-900 hover:border-slate-400 hover:bg-slate-300 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600"
                >
                  {t('editUserModal.closeButton')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Balance Modals */}
      <CreditBalanceModal
        isOpen={showCreditModal}
        onClose={handleBalanceModalClose}
        userId={userId}
        userName={userDetail?.fullName}
        currentBalance={balance?.currentBalance}
      />
      <DebitBalanceModal
        isOpen={showDebitModal}
        onClose={handleBalanceModalClose}
        userId={userId}
        userName={userDetail?.fullName}
        currentBalance={balance?.currentBalance}
      />
    </>
  );
};
