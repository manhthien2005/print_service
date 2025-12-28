'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface NavigationWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NavigationWarningModal({
  isOpen,
  onConfirm,
  onCancel,
}: NavigationWarningModalProps) {
  const t = useTranslations('student.print.navigationWarningModal');
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t('title')}
      size="md"
      closeOnClickOutside={false}
    >
      <div className="space-y-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <svg
                className="h-6 w-6 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('message')}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
              {t('warning')}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onCancel}>
            {t('stay')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t('leave')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
