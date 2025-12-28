'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  usePaymentPackages,
  useCreateDeposit,
  useCancelDeposit,
  useCurrentDeposit,
} from '@/lib/api/services/payment';
import { PackageSelection } from './PackageSelection';
import { CustomAmountInput } from './CustomAmountInput';
import { QRPaymentModal } from './QRPaymentModal';
import { CancelConfirmModal } from './CancelConfirmModal';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { DepositHistoryTable } from './DepositHistoryTable';
import { TransactionHistoryTable } from './TransactionHistoryTable';
import { RechargeSkeleton } from './RechargeSkeleton';
import { toast } from '@/components/ui/Toast';
import { subscribeStomp } from '@/lib/api/ws';
import type {
  DepositBonusPackageResponse,
  DepositResponse,
  DepositStatusResponse,
} from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { paymentKeys } from '@/lib/api/services/payment';
import { studentPrintKeys } from '@/app/[locale]/student/print/api';

interface RechargeContentProps {
  locale: string;
  t: any; // Translation object
}

export function RechargeContent({ t }: RechargeContentProps) {
  const queryClient = useQueryClient();
  const [currentDeposit, setCurrentDeposit] = useState<DepositResponse | null>(
    null
  );
  const [selectedPackage, setSelectedPackage] =
    useState<DepositBonusPackageResponse | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAmount, setSuccessAmount] = useState<number>(0);
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);

  // Fetch packages
  const { data: packagesData, isLoading: packagesLoading } =
    usePaymentPackages();

  // Fetch current pending deposit
  const { data: currentData, refetch: refetchCurrent } = useCurrentDeposit({
    enabled: true,
    refetchInterval: currentDeposit?.status === 'pending' ? 5000 : false,
  });

  // Create deposit mutation
  const createDepositMutation = useCreateDeposit();

  // Cancel deposit mutation
  const cancelDepositMutation = useCancelDeposit();

  // Handle payment success
  const handlePaymentSuccess = useCallback(
    (amount: number) => {
      setSuccessAmount(amount);
      setShowQRModal(false);
      setShowSuccessModal(true);
      setCurrentDeposit(null);
      // Refetch current deposit
      refetchCurrent();
      queryClient.invalidateQueries({ queryKey: paymentKeys.current() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.deposits() });
      queryClient.invalidateQueries({ queryKey: studentPrintKeys.balance.all });
    },
    [queryClient, refetchCurrent]
  );

  // Update current deposit state
  useEffect(() => {
    if (currentData?.data?.data) {
      const deposit = currentData.data.data;
      setCurrentDeposit(deposit);
      // Don't auto-open QR modal - let user decide when to open
    } else {
      setCurrentDeposit(null);
    }
  }, [currentData]);

  // React when polling returns a terminal status (fallback if WS misses)
  useEffect(() => {
    const deposit = currentData?.data?.data;
    if (!deposit) return;

    if (deposit.status === 'completed' && !showSuccessModal) {
      handlePaymentSuccess(deposit.totalCredited ?? deposit.amount);
    } else if (
      (deposit.status === 'cancelled' || deposit.status === 'expired') &&
      showQRModal
    ) {
      setShowQRModal(false);
    }
  }, [currentData, handlePaymentSuccess, showQRModal, showSuccessModal]);

  // Listen for realtime deposit updates even if modal is closed
  useEffect(() => {
    if (!currentDeposit || currentDeposit.status !== 'pending') return;

    const cleanup = subscribeStomp<{
      type?: string;
      data?: DepositStatusResponse;
    }>({
      topic: `/topic/deposits/${currentDeposit.depositId}/status`,
      sendDestination: `/app/deposits/${currentDeposit.depositId}/subscribe`,
      debugLabel: 'deposit-realtime',
      onMessage: payload => {
        const data =
          payload?.data ?? (payload as unknown as DepositStatusResponse);
        if (!data?.paymentStatus) return;

        if (data.paymentStatus === 'completed') {
          handlePaymentSuccess(
            data.totalCredited ?? currentDeposit.totalCredited
          );
        } else if (
          data.paymentStatus === 'cancelled' ||
          data.paymentStatus === 'expired' ||
          data.paymentStatus === 'failed'
        ) {
          setShowQRModal(false);
          setCurrentDeposit(null);
          refetchCurrent();
        }
      },
      onError: () => {
        // Fallback to polling already handled by refetchInterval
      },
    });

    return () => cleanup();
  }, [currentDeposit, handlePaymentSuccess, refetchCurrent]);

  // Handle package selection
  const handlePackageSelect = async (pkg: DepositBonusPackageResponse) => {
    setLoadingPackageId(pkg.id);
    setSelectedPackage(pkg); // Store selected package
    try {
      const response = await createDepositMutation.mutateAsync({
        packageId: pkg.id,
      });
      if (response.data.success && response.data.data) {
        setCurrentDeposit(response.data.data);
        setShowQRModal(true);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t.errors.createFailed;
      toast.error(message);
      setSelectedPackage(null); // Clear on error
    } finally {
      setLoadingPackageId(null);
    }
  };

  // Handle custom amount recharge
  const handleCustomRecharge = async (amount: number) => {
    setSelectedPackage(null); // Clear package for custom amount
    try {
      const response = await createDepositMutation.mutateAsync({
        amount,
      });
      if (response.data.success && response.data.data) {
        setCurrentDeposit(response.data.data);
        setShowQRModal(true);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t.errors.createFailed;
      toast.error(message);
    }
  };

  // Handle cancel deposit
  const handleCancelDeposit = async (reason?: string) => {
    if (!currentDeposit) return;

    try {
      await cancelDepositMutation.mutateAsync({
        depositId: currentDeposit.depositId,
        cancellationReason: reason,
      });
      toast.success('Đã hủy đơn nạp tiền');
      setShowCancelModal(false);
      setShowQRModal(false);
      setCurrentDeposit(null);
      // Refetch current deposit
      refetchCurrent();
      queryClient.invalidateQueries({ queryKey: paymentKeys.current() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.deposits() });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t.errors.cancelFailed;
      toast.error(message);
    }
  };

  // Handle close QR modal
  const handleCloseQRModal = () => {
    setShowQRModal(false);
    // Don't clear currentDeposit - keep it for reopening
    // Refetch to check if deposit is still pending
    refetchCurrent();
  };

  // Handle click on deposit from history
  const handleDepositClick = async (depositId: string) => {
    // If this is the current pending deposit, just open the modal
    if (
      currentDeposit?.depositId === depositId &&
      currentDeposit.status === 'pending'
    ) {
      setShowQRModal(true);
      return;
    }

    // Refetch current deposit to get latest info
    // If the clicked deposit is the current pending one, it will be returned
    const result = await refetchCurrent();

    // Check if the refetched deposit matches
    if (
      result.data?.data?.data?.depositId === depositId &&
      result.data.data.data.status === 'pending'
    ) {
      setCurrentDeposit(result.data.data.data);
      setShowQRModal(true);
    }
  };

  const packages = packagesData?.data?.data || [];

  // Show skeleton while loading packages
  if (packagesLoading) {
    return <RechargeSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Packages Section */}
      <PackageSelection
        packages={packages}
        onSelectPackage={handlePackageSelect}
        isLoading={packagesLoading}
        loadingPackageId={loadingPackageId}
        t={t}
      />

      {/* Custom Amount Section */}
      <CustomAmountInput
        onRecharge={handleCustomRecharge}
        isLoading={createDepositMutation.isPending}
        t={t}
      />

      {/* Modals */}
      {currentDeposit && (
        <QRPaymentModal
          isOpen={showQRModal}
          deposit={currentDeposit}
          selectedPackage={selectedPackage}
          onClose={handleCloseQRModal}
          onCancel={() => {
            setShowCancelModal(true);
          }}
          onSuccess={handlePaymentSuccess}
          t={t}
        />
      )}

      <CancelConfirmModal
        isOpen={showCancelModal}
        depositId={currentDeposit?.depositId || ''}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelDeposit}
        isLoading={cancelDepositMutation.isPending}
        t={t}
      />

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        amount={successAmount}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessAmount(0);
        }}
        onRechargeMore={() => {
          setShowSuccessModal(false);
          setSuccessAmount(0);
        }}
        t={t}
      />

      {/* Deposit History Table */}
      <DepositHistoryTable t={t} onDepositClick={handleDepositClick} />

      {/* Transaction History Table */}
      <TransactionHistoryTable t={t} />
    </div>
  );
}
