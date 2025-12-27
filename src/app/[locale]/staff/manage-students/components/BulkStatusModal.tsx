'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface BulkStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  status: 'active' | 'inactive' | 'suspended';
  count: number;
  isLoading?: boolean;
}

export function BulkStatusModal({
  isOpen,
  onClose,
  onConfirm,
  status,
  count,
  isLoading = false,
}: BulkStatusModalProps) {
  const t = useTranslations('staff.manageStudents.modal.bulkStatus');
  const [reason, setReason] = useState('');

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      onClose();
    }
  };

  const handleConfirm = () => {
    if (status === 'suspended' && !reason.trim()) {
      // Reason is required for suspension
      return;
    }
    onConfirm(reason.trim() || undefined);
  };

  const statusLabels = {
    active: t('statusActive'),
    inactive: t('statusInactive'),
    suspended: t('statusSuspended'),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('title', { status: statusLabels[status], count })}
      size="md"
    >
      <div className="space-y-4 p-6">
        <div className="text-sm text-slate-700 dark:text-white/80">
          {t('description', { count, status: statusLabels[status] })}
        </div>

        {status === 'suspended' && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
              {t('reasonLabel')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              disabled={isLoading}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder={t('reasonPlaceholder')}
            />
            <div className="mt-1 text-xs text-slate-500 dark:text-white/60">
              {t('reasonHint')}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (status === 'suspended' && !reason.trim())}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          >
            {isLoading ? t('processing') : t('confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default BulkStatusModal;
