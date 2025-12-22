'use client';

import React, { useEffect, useState } from 'react';
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
import { RechargeSkeleton } from './RechargeSkeleton';
import { toast } from '@/components/ui/Toast';
import type { DepositBonusPackageResponse, DepositResponse } from '@/types/api';

interface RechargeContentProps {
  locale: string;
  t: any; // Translation object
}

export function RechargeContent({ t }: RechargeContentProps) {
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
  });

  // Create deposit mutation
  const createDepositMutation = useCreateDeposit();

  // Cancel deposit mutation
  const cancelDepositMutation = useCancelDeposit();

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
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t.errors.cancelFailed;
      toast.error(message);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (amount: number) => {
    setSuccessAmount(amount);
    setShowQRModal(false);
    setShowSuccessModal(true);
    setCurrentDeposit(null);
    // Refetch current deposit
    refetchCurrent();
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
    </div>
  );
}
