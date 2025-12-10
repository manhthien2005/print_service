'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
  type?: 'brand' | 'model' | 'printer' | 'activity';
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  type = 'brand',
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'brand':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-12 w-12 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6z"
            />
          </svg>
        );
      case 'model':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-12 w-12 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 8V4.8c0-.45.36-.81.81-.81h8.38c.45 0 .81.36.81.81V8M7 16H5.2A1.2 1.2 0 014 14.8V11a2 2 0 012-2h12a2 2 0 012 2v3.8c0 .66-.54 1.2-1.2 1.2H17"
            />
          </svg>
        );
      case 'printer':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-12 w-12 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 8V4.8c0-.45.36-.81.81-.81h8.38c.45 0 .81.36.81.81V8M7 16H5.2A1.2 1.2 0 014 14.8V11a2 2 0 012-2h12a2 2 0 012 2v3.8c0 .66-.54 1.2-1.2 1.2H17M7 12.5h.01M9 16h6m-6 3h6c.55 0 1-.45 1-1v-4H8v4c0 .55.45 1 1 1Z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-12 w-12 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={!isLoading}
      closeOnClickOutside={!isLoading}
    >
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            {getIcon()}
          </div>

          {/* Message */}
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            {message}
          </h3>
          {itemName && (
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-white">
                {itemName}
              </span>
            </p>
          )}
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Hành động này không thể hoàn tác.
          </p>

          {/* Actions */}
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border border-slate-300 bg-slate-200/80 text-slate-900 hover:border-slate-400 hover:bg-slate-300/90 dark:border-white/20 dark:bg-slate-700/80 dark:text-white dark:hover:border-white/30 dark:hover:bg-slate-600/90"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 border border-red-400 bg-red-500/20 text-red-700 hover:border-red-500 hover:bg-red-500/30 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-500/30"
            >
              {isLoading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
