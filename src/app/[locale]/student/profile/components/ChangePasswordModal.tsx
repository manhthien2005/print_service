'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  t?: {
    title?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    submit?: string;
    submitting?: string;
    success?: string;
    error?: string;
    missingFields?: string;
    mismatch?: string;
    weakPassword?: string;
  };
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  locale: _locale,
  t = {},
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t.missingFields ?? 'Vui lòng điền đầy đủ các trường');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.mismatch ?? 'Mật khẩu mới và xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t.weakPassword ?? 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });

      toast.success(t.success ?? 'Đổi mật khẩu thành công');
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (t.error ?? 'Đã xảy ra lỗi khi đổi mật khẩu');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.title ?? 'Đổi mật khẩu'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
              {t.currentPassword ?? 'Mật khẩu hiện tại'}
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
              {t.newPassword ?? 'Mật khẩu mới'}
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/90">
              {t.confirmPassword ?? 'Xác nhận mật khẩu mới'}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
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
            disabled={isLoading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            {isLoading
              ? (t.submitting ?? 'Đang xử lý...')
              : (t.submit ?? 'Đổi mật khẩu')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
