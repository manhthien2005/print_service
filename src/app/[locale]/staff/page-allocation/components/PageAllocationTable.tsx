'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils/format';
import type { PageAllocation } from '@/lib/api/services/pageAllocation';
import { PlusIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PageAllocationTableProps {
  allocations: PageAllocation[];
  onAddPages: (allocation: PageAllocation) => void;
  onUpdate: (allocation: PageAllocation) => void;
  onCheckAvailability: (allocation: PageAllocation) => void;
  translations: {
    table: {
      sizeName: string;
      description: string;
      totalQuantity: string;
      reserved: string;
      available: string;
      threshold: string;
      status: string;
      lastUpdated: string;
      actions: string;
      lowStock: string;
      normal: string;
      noData: string;
    };
    actions: {
      addPages: string;
      update: string;
      checkAvailability: string;
    };
  };
}

export default function PageAllocationTable({
  allocations,
  onAddPages,
  onUpdate,
  onCheckAvailability,
  translations,
}: PageAllocationTableProps) {
  if (allocations.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardContent className="py-12 text-center">
          <p className="text-slate-400 dark:text-white/60">
            {translations.table.noData}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md">
      <CardHeader>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          {translations.table.sizeName}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.sizeName}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.description}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.totalQuantity}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.reserved}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.available}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.threshold}
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.status}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.lastUpdated}
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  {translations.table.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(allocation => (
                <tr
                  key={allocation.allocationId}
                  className={`border-b border-white/10 transition-colors hover:bg-white/5 ${
                    allocation.isLowStock
                      ? 'bg-orange-500/5 dark:bg-orange-500/10'
                      : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {allocation.sizeName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                    {allocation.sizeDescription}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-white">
                    {formatNumber(allocation.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-white/70">
                    {formatNumber(allocation.reservedQuantity)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                    {formatNumber(allocation.availableQuantity)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-white/70">
                    {formatNumber(allocation.lowStockThreshold)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        allocation.isLowStock
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {allocation.isLowStock
                        ? translations.table.lowStock
                        : translations.table.normal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                    {allocation.updatedAt
                      ? formatDistanceToNow(new Date(allocation.updatedAt), {
                          addSuffix: true,
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddPages(allocation)}
                        title={translations.actions.addPages}
                        className="h-8 w-8 p-0"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdate(allocation)}
                        title={translations.actions.update}
                        className="h-8 w-8 p-0"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCheckAvailability(allocation)}
                        title={translations.actions.checkAvailability}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

