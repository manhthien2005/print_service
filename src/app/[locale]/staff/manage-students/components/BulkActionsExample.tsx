/**
 * Example code for integrating bulk actions into ManageStudentsContent
 *
 * This file shows how to add bulk status update functionality.
 * Copy the relevant parts into your ManageStudentsContent.tsx file.
 */

/**
 * Example code for integrating bulk actions into ManageStudentsContent
 *
 * This file shows how to add bulk status update functionality.
 * Copy the relevant parts into your ManageStudentsContent.tsx file.
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/Toast';
import {
  useBulkUpdateAccountStatus,
  type BulkAccountStatusRequest,
} from '@/lib/api/services/adminUsers';

// Add these state variables to your component:
// const [bulkStatusModal, setBulkStatusModal] = useState<{
//   isOpen: boolean;
//   status: 'active' | 'inactive' | 'suspended';
// }>({ isOpen: false, status: 'active' });

// Add this mutation hook:
// const bulkUpdateStatusMutation = useBulkUpdateAccountStatus();

// Add this handler function:
export function useBulkStatusHandler(
  selectedItems: Set<string>,
  setSelectedItems: (items: Set<string>) => void
) {
  const t = useTranslations('staff.manageStudents');
  const [bulkStatusModal, setBulkStatusModal] = useState<{
    isOpen: boolean;
    status: 'active' | 'inactive' | 'suspended';
  }>({ isOpen: false, status: 'active' });

  const bulkUpdateStatusMutation = useBulkUpdateAccountStatus();

  const handleBulkStatus = (status: 'active' | 'inactive' | 'suspended') => {
    if (selectedItems.size === 0) {
      toast.error(t('table.bulkActions.noSelection'));
      return;
    }
    setBulkStatusModal({ isOpen: true, status });
  };

  const handleConfirmBulkStatus = async (reason?: string) => {
    if (selectedItems.size === 0) return;

    try {
      const userIds = Array.from(selectedItems);
      const request: BulkAccountStatusRequest = {
        userIds,
        accountStatus: bulkStatusModal.status,
        reason,
      };

      const result = await bulkUpdateStatusMutation.mutateAsync(request);

      if (result.data?.data) {
        const { successCount, failedCount, totalRequested } = result.data.data;
        if (failedCount === 0) {
          toast.success(
            t('table.bulkActions.success', {
              count: successCount,
              status: bulkStatusModal.status,
            })
          );
        } else {
          toast.success(
            t('table.bulkActions.partialSuccess', {
              success: successCount,
              total: totalRequested,
              status: bulkStatusModal.status,
            })
          );
        }
      } else {
        toast.success(
          t('table.bulkActions.success', { count: userIds.length })
        );
      }

      setSelectedItems(new Set());
      setBulkStatusModal({ isOpen: false, status: 'active' });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t('table.bulkActions.error');
      toast.error(errorMessage);
    }
  };

  return {
    bulkStatusModal,
    setBulkStatusModal,
    handleBulkStatus,
    handleConfirmBulkStatus,
    isLoading: bulkUpdateStatusMutation.isPending,
  };
}

// Add these buttons to your bulk actions section:
/*
{selectedItems.size > 0 && (
  <>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleBulkStatus('active')}
      className="flex items-center border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="mr-2 h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      {t('table.bulkActions.activate')}
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleBulkStatus('suspended')}
      className="flex items-center border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="mr-2 h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      {t('table.bulkActions.suspend')}
    </Button>
  </>
)}
*/

// Add this modal at the end of your component:
/*
<BulkStatusModal
  isOpen={bulkStatusModal.isOpen}
  onClose={() => setBulkStatusModal({ isOpen: false, status: 'active' })}
  onConfirm={handleConfirmBulkStatus}
  status={bulkStatusModal.status}
  count={selectedItems.size}
  isLoading={bulkUpdateStatusMutation.isPending}
/>
*/
