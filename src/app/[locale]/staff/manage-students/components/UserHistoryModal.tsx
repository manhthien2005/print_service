'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import {
  useBalanceHistory,
  usePrintStats,
  type AdminBalanceHistoryResponse,
  type UserPrintStatsResponse,
} from '@/lib/api/services/adminUsers';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { BalanceWidget } from './BalanceWidget';
import { CreditBalanceModal } from './CreditBalanceModal';
import { DebitBalanceModal } from './DebitBalanceModal';
import { useGetBalance } from '@/lib/api/services/adminUsers';

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName?: string;
}

type TabValue = 'balanceManagement' | 'balanceHistory' | 'printStats';

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<TabValue>('balanceManagement');
  const [balancePage, setBalancePage] = useState(0);
  const balanceLimit = 20;
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isDebitModalOpen, setIsDebitModalOpen] = useState(false);

  const {
    data: balanceResponse,
    isLoading: isLoadingBalanceData,
    error: balanceDataError,
  } = useGetBalance(userId);
  const currentBalance = balanceResponse?.data?.data?.currentBalance;

  const {
    data: balanceHistoryResponse,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useBalanceHistory(userId, {
    page: balancePage,
    limit: balanceLimit,
  });

  const {
    data: printStatsResponse,
    isLoading: isLoadingPrintStats,
    error: printStatsError,
  } = usePrintStats(userId);

  // Reset tab when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('balanceManagement');
      setBalancePage(0);
    }
  }, [isOpen]);

  const balanceHistory: AdminBalanceHistoryResponse[] =
    balanceHistoryResponse?.data?.data || [];
  const balancePagination = balanceHistoryResponse?.data?.pagination;

  const printStats: UserPrintStatsResponse | undefined =
    printStatsResponse?.data?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const t = useTranslations('staff.manageStudents.userHistoryModal');

  const getSourceTypeLabel = (sourceType: string) => {
    const labels: Record<string, string> = {
      DEPOSIT: t('sourceTypes.DEPOSIT'),
      PAYMENT: t('sourceTypes.PAYMENT'),
      REFUND: t('sourceTypes.REFUND'),
      ADJUSTMENT: t('sourceTypes.ADJUSTMENT'),
      SEMESTER_BONUS: t('sourceTypes.SEMESTER_BONUS'),
    };
    return labels[sourceType] || sourceType;
  };

  const tabs = [
    {
      value: 'balanceManagement' as TabValue,
      label: t('tabs.balanceManagement'),
    },
    { value: 'balanceHistory' as TabValue, label: t('tabs.balanceHistory') },
    { value: 'printStats' as TabValue, label: t('tabs.printStats') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title', { userName: userName || 'User' })}
      size="lg"
    >
      <div className="p-6">
        <Tabs
          items={tabs}
          value={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Balance Management Tab */}
        {activeTab === 'balanceManagement' && (
          <div className="space-y-4">
            {!userId ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {t('errors.noUserSelected')}
              </div>
            ) : isLoadingBalanceData ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-500 dark:text-slate-400">
                  {t('loading.balanceInfo')}
                </div>
              </div>
            ) : balanceDataError ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {t('errors.loadBalanceFailed')}
              </div>
            ) : (
              <BalanceWidget
                userId={userId}
                onCreditClick={() => setIsCreditModalOpen(true)}
                onDebitClick={() => setIsDebitModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* Balance History Tab */}
        {activeTab === 'balanceHistory' && (
          <div className="space-y-4">
            {!userId ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {t('errors.noUserForHistory')}
              </div>
            ) : isLoadingBalance ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-500 dark:text-slate-400">
                  {t('loading.balanceHistory')}
                </div>
              </div>
            ) : balanceError ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {t('errors.loadBalanceHistoryFailed')}
                {balanceError &&
                  typeof balanceError === 'object' &&
                  'message' in balanceError && (
                    <div className="mt-2 text-xs">
                      {String(balanceError.message)}
                    </div>
                  )}
              </div>
            ) : balanceHistory.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-500 dark:bg-slate-800/30 dark:text-slate-400">
                {t('noTransactionHistory')}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {balanceHistory.map(item => (
                    <div
                      key={item.ledgerId}
                      className={cn(
                        'rounded-lg border p-4',
                        item.direction === 'IN'
                          ? 'border-green-200 bg-green-50/50 dark:border-green-500/30 dark:bg-green-500/10'
                          : 'border-red-200 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/10'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                                item.direction === 'IN'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                              )}
                            >
                              {item.direction === 'IN' ? '+' : '-'}
                              {formatCurrency(Math.abs(item.amount))}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {getSourceTypeLabel(item.sourceType)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                            {item.description}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                        {item.balanceAfter !== undefined && (
                          <div className="ml-4 text-right">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {t('balanceAfter')}
                            </div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(item.balanceAfter)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {balancePagination && balancePagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-200/50 pt-4 dark:border-white/10">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {t('page')} {balancePagination.page + 1} /{' '}
                      {balancePagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBalancePage(p => Math.max(0, p - 1))}
                        disabled={balancePagination.first}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                      >
                        {t('previous')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setBalancePage(p =>
                            Math.min(balancePagination.totalPages - 1, p + 1)
                          )
                        }
                        disabled={balancePagination.last}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                      >
                        {t('next')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Print Stats Tab */}
        {activeTab === 'printStats' && (
          <div className="space-y-6">
            {!userId ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {t('errors.noUserForStats')}
              </div>
            ) : isLoadingPrintStats ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-500 dark:text-slate-400">
                  {t('loading.printStats')}
                </div>
              </div>
            ) : printStatsError ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {t('errors.loadPrintStatsFailed')}
                {printStatsError &&
                  typeof printStatsError === 'object' &&
                  'message' in printStatsError && (
                    <div className="mt-2 text-xs">
                      {String(printStatsError.message)}
                    </div>
                  )}
              </div>
            ) : !printStats ? (
              <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-500 dark:bg-slate-800/30 dark:text-slate-400">
                {t('noPrintStats')}
              </div>
            ) : (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                      {t('printStats.totalJobs')}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                      {printStats.totalPrintJobs || 0}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                      {t('printStats.totalPages')}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                      {printStats.totalPagesPrinted || 0}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                      {t('printStats.totalCost')}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(printStats.totalAmountSpent || 0)}
                    </div>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                    {t('printStats.byStatus')}
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.success')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
                        {printStats.completedJobs || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.failed')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
                        {printStats.failedJobs || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.cancelled')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400">
                        {printStats.cancelledJobs || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.pending')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {printStats.pendingJobs || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print Type Breakdown */}
                <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                    {t('printStats.byType')}
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.color')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {printStats.colorPrintJobs || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.blackWhite')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {printStats.blackWhitePrintJobs || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.duplex')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {printStats.duplexPrintJobs || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Stats */}
                <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                    {t('printStats.thisMonth')}
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.jobsThisMonth')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {printStats.printJobsThisMonth || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.pagesThisMonth')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {printStats.pagesThisMonth || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/50">
                        {t('printStats.costThisMonth')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(printStats.amountThisMonth || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(printStats.lastPrintAt || printStats.mostUsedPrinterName) && (
                  <div className="rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="space-y-2 text-sm">
                      {printStats.lastPrintAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-white/70">
                            {t('printStats.lastPrint')}:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatDate(printStats.lastPrintAt)}
                          </span>
                        </div>
                      )}
                      {printStats.mostUsedPrinterName && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-white/70">
                            {t('printStats.mostUsedPrinter')}:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {printStats.mostUsedPrinterName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Credit Balance Modal */}
      <CreditBalanceModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        userId={userId}
        userName={userName}
        currentBalance={currentBalance}
      />

      {/* Debit Balance Modal */}
      <DebitBalanceModal
        isOpen={isDebitModalOpen}
        onClose={() => setIsDebitModalOpen(false)}
        userId={userId}
        userName={userName}
        currentBalance={currentBalance}
      />
    </Modal>
  );
};
