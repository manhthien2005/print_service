'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
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

  const changePasswordMutation = useApiMutation<
    unknown,
    { currentPassword: string; newPassword: string }
  >(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, 'post', {
    onSuccess: () => {
      toast.success(t.success ?? 'Đổi mật khẩu thành công');
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : (t.error ?? 'Đã xảy ra lỗi khi đổi mật khẩu');
      toast.error(message);
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

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

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
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
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              {t.currentPassword ?? 'Mật khẩu hiện tại'}
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={changePasswordMutation.isPending}
              className="h-11"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              {t.newPassword ?? 'Mật khẩu mới'}
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={changePasswordMutation.isPending}
              className="h-11"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              {t.confirmPassword ?? 'Xác nhận mật khẩu mới'}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={changePasswordMutation.isPending}
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
            disabled={changePasswordMutation.isPending}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            {changePasswordMutation.isPending
              ? (t.submitting ?? 'Đang xử lý...')
              : (t.submit ?? 'Đổi mật khẩu')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
