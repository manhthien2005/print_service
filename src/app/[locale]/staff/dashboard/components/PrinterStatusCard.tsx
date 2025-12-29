'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import CountUp from '@/components/ui/CountUp';

export interface PrinterStatusCardProps {
  stats: {
    totalPrinters: number;
    activePrinters: number;
    maintenancePrinters: number;
    offlinePrinters: number;
    idle: number;
    printing: number;
    unplugged: number;
    error: number;
  };
  locale: string;
  translations: {
    title: string;
    description: string;
    online: string;
    offline: string;
    maintenance: string;
    idle: string;
    printing: string;
    unplugged: string;
    error: string;
    total?: string;
    utilization: string;
    utilizationLabel: string;
    cta: string;
  };
}

export function PrinterStatusCard({
  stats,
  locale,
  translations,
}: PrinterStatusCardProps) {
  const withLocale = (path: string) =>
    `/${locale}${path.startsWith('/') ? path : `/${path}`}`;

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-white">
          {translations.title}
        </CardTitle>
        <CardDescription className="text-sm text-white/70">
          {translations.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        {/* Compact Status Grid - 3 items per row, 2 rows */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white">
            <p className="mb-1 text-xs text-white/70">
              {translations.idle || 'Idle'}
            </p>
            <p className="text-xl font-semibold text-emerald-300">
              <CountUp to={stats.idle} />
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white">
            <p className="mb-1 text-xs text-white/70">
              {translations.printing || 'Printing'}
            </p>
            <p className="text-xl font-semibold text-blue-300">
              <CountUp to={stats.printing} />
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white">
            <p className="mb-1 text-xs text-white/70">
              {translations.maintenance}
            </p>
            <p className="text-xl font-semibold text-amber-200">
              <CountUp to={stats.maintenancePrinters} />
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white">
            <p className="mb-1 text-xs text-white/70">
              {translations.unplugged || 'Unplugged'}
            </p>
            <p className="text-xl font-semibold text-gray-300">
              <CountUp to={stats.unplugged} />
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white">
            <p className="mb-1 text-xs text-white/70">
              {translations.error || 'Error'}
            </p>
            <p className="text-xl font-semibold text-red-400">
              <CountUp to={stats.error} />
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white">
            <p className="mb-1 text-xs text-white/70">
              {translations.total || 'Total'}
            </p>
            <p className="text-xl font-semibold">
              <CountUp to={stats.totalPrinters} />
            </p>
          </div>
        </div>

        <Link href={withLocale('/staff/manage-printers')}>
          <Button
            className="mt-4 w-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
            size="sm"
          >
            {translations.cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
