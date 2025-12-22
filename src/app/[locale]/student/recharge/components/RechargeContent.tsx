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
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAmount, setSuccessAmount] = useState<number>(0);

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
      // Auto-open QR modal if there's a pending deposit
      if (deposit.status === 'pending' && !showQRModal) {
        setShowQRModal(true);
      }
    } else {
      setCurrentDeposit(null);
    }
  }, [currentData, showQRModal]);

  // Handle package selection
  const handlePackageSelect = async (pkg: DepositBonusPackageResponse) => {
    try {
      const response = await createDepositMutation.mutateAsync({
        packageId: pkg.id,
      });
      if (response.data.success && response.data.data) {
        setCurrentDeposit(response.data.data);
        setShowQRModal(true);
        if (response.data.data.isReused) {
          toast.success(t.qrModal.reused);
        } else {
          toast.success(t.qrModal.newOrder);
        }
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t.errors.createFailed;
      toast.error(message);
    }
  };

  // Handle custom amount recharge
  const handleCustomRecharge = async (amount: number) => {
    try {
      const response = await createDepositMutation.mutateAsync({
        amount,
      });
      if (response.data.success && response.data.data) {
        setCurrentDeposit(response.data.data);
        setShowQRModal(true);
        if (response.data.data.isReused) {
          toast.success(t.qrModal.reused);
        } else {
          toast.success(t.qrModal.newOrder);
        }
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
    // Refetch to check if deposit is still pending
    refetchCurrent();
  };

  const packages = packagesData?.data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Packages Section */}
      <PackageSelection
        packages={packages}
        onSelectPackage={handlePackageSelect}
        isLoading={packagesLoading || createDepositMutation.isPending}
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
    </div>
  );
}
