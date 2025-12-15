'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { StudentProfilePageData } from '@/data/studentProfilePageMock';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  t?: {
    title?: string;
    email?: string;
    phone?: string;
    otpCode?: string;
    sendOtp?: string;
    sendingOtp?: string;
    otpSent?: string;
    verifyOtp?: string;
    verifyingOtp?: string;
    otpVerified?: string;
    submit?: string;
    submitting?: string;
    success?: string;
    error?: string;
    invalidOtp?: string;
    emailChanged?: string;
  };
  initialData: StudentProfilePageData;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  locale: _locale,
  t = {},
  initialData,
}: EditProfileModalProps) {
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setOtpCode('');
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setEmailChanged(false);
    }
  }, [isOpen, initialData]);

  // Check if email changed
  useEffect(() => {
    setEmailChanged(email !== initialData.email);
    if (email === initialData.email) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpCode('');
    }
  }, [email, initialData.email]);

  const handleSendOtp = async () => {
    if (!email || email === initialData.email) {
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    try {
      setIsSendingOtp(true);
      // TODO: Replace with real API call when available
      // await apiClient.post('/auth/send-otp', { email });

      // Mock API call - simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock: In real implementation, OTP would be sent to email
      // For demo purposes, we'll show a mock OTP
      const mockOtp = '123456';
      console.log('Mock OTP sent to', email, ':', mockOtp);

      setIsOtpSent(true);
      toast.success(t.otpSent ?? 'Mã OTP đã được gửi đến email của bạn');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (t.error ?? 'Không thể gửi mã OTP');
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast.error('Vui lòng nhập mã OTP');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      // TODO: Replace with real API call when available
      // await apiClient.post('/auth/verify-otp', { email, otpCode });

      // Mock API call - simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock: Accept any 6-digit code for demo
      if (otpCode.length === 6) {
        setIsOtpVerified(true);
        toast.success(t.otpVerified ?? 'Xác thực OTP thành công');
      } else {
        toast.error(t.invalidOtp ?? 'Mã OTP không hợp lệ');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (t.invalidOtp ?? 'Mã OTP không hợp lệ');
      toast.error(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If email changed, require OTP verification
    if (emailChanged && !isOtpVerified) {
      toast.error('Vui lòng xác thực email bằng mã OTP trước');
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Replace with real API call when available
      // await apiClient.put('/auth/profile', { email, phone, otpCode: emailChanged ? otpCode : undefined });

      // Mock API call - simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(t.success ?? 'Cập nhật thông tin thành công');
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (t.error ?? 'Không thể cập nhật thông tin');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.title ?? 'Chỉnh sửa hồ sơ'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
              {t.email ?? 'Email'}
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                disabled={isSubmitting || isOtpVerified}
                className="h-11 flex-1"
              />
              {emailChanged && !isOtpVerified && (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || isOtpSent}
                  className="bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                >
                  {isSendingOtp
                    ? (t.sendingOtp ?? 'Đang gửi...')
                    : isOtpSent
                      ? 'Đã gửi'
                      : (t.sendOtp ?? 'Gửi OTP')}
                </Button>
              )}
            </div>
            {emailChanged && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t.emailChanged ??
                  'Email đã thay đổi. Vui lòng xác thực bằng mã OTP.'}
              </p>
            )}
          </div>

          {/* OTP Code (only show if email changed and OTP sent) */}
          {emailChanged && isOtpSent && !isOtpVerified && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-white/90">
                {t.otpCode ?? 'Mã OTP'}
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isVerifyingOtp || isSubmitting}
                  className="h-11 flex-1 text-center text-lg tracking-widest"
                />
                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!otpCode || otpCode.length !== 6 || isVerifyingOtp}
                  className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  {isVerifyingOtp
                    ? (t.verifyingOtp ?? 'Đang xác thực...')
                    : (t.verifyOtp ?? 'Xác thực')}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-white/70">
                Nhập mã OTP 6 chữ số đã được gửi đến email của bạn
              </p>
            </div>
          )}

          {/* OTP Verified Message */}
          {emailChanged && isOtpVerified && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              ✓ Email đã được xác thực thành công
            </div>
          )}

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
              {t.phone ?? 'Số điện thoại'}
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0912345678"
              required
              disabled={isSubmitting}
              className="h-11"
            />
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
            disabled={isSubmitting || (emailChanged && !isOtpVerified)}
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
