'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CancelConfirmModalProps {
  isOpen: boolean;
  depositId: string;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
  t: {
    cancelModal: {
      title: string;
      reason: string;
      reasonPlaceholder: string;
      confirm: string;
      cancel: string;
      cancelling: string;
    };
  };
}

export function CancelConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  t,
}: CancelConfirmModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t.cancelModal.title}
      size="md"
      closeOnClickOutside={!isLoading}
    >
      <div className="space-y-6 p-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
            {t.cancelModal.reason}
          </label>
          <Input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={t.cancelModal.reasonPlaceholder}
            maxLength={500}
            disabled={isLoading}
            className="w-full"
          />
          <p className="mt-1 text-xs text-slate-600 dark:text-white/70">
            {reason.length}/500
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            {t.cancelModal.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="hover:from-primary/90 hover:to-primary/90 flex-1 bg-gradient-to-r from-primary to-primary text-primary-foreground shadow-md transition-transform hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t.cancelModal.cancelling}
              </span>
            ) : (
              t.cancelModal.confirm
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
