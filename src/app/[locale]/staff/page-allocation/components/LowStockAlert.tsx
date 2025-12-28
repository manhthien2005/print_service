'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PageAllocation } from '@/lib/api/services/pageAllocation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface LowStockAlertProps {
  lowStockItems: PageAllocation[];
  onViewAll: () => void;
  translations: {
    title: string;
    message: string;
    viewAll: string;
  };
}

export default function LowStockAlert({
  lowStockItems,
  onViewAll,
  translations,
}: LowStockAlertProps) {
  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-400/30 bg-orange-500/10 backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-orange-300">
            {translations.title}
          </h3>
        </div>
        <p className="mt-1 text-sm text-orange-200/80">
          {translations.message.replace('{count}', lowStockItems.length.toString())}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {lowStockItems.slice(0, 5).map(item => (
            <span
              key={item.allocationId}
              className="rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-200"
            >
              {item.sizeName}
            </span>
          ))}
          {lowStockItems.length > 5 && (
            <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-200">
              +{lowStockItems.length - 5} more
            </span>
          )}
        </div>
        <Button onClick={onViewAll} variant="outline" size="sm">
          {translations.viewAll}
        </Button>
      </CardContent>
    </Card>
  );
}

