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
import { ProgressBar } from './ProgressBar';

export interface PrinterStatusCardProps {
  stats: {
    totalPrinters: number;
    activePrinters: number;
    maintenancePrinters: number;
    offlinePrinters: number;
  };
  utilization: number; // Calculated or from API
  locale: string;
  translations: {
    title: string;
    description: string;
    online: string;
    offline: string;
    maintenance: string;
    utilization: string;
    utilizationLabel: string;
    cta: string;
  };
}

export function PrinterStatusCard({
  stats,
  utilization,
  locale,
  translations,
}: PrinterStatusCardProps) {
  const withLocale = (path: string) =>
    `/${locale}${path.startsWith('/') ? path : `/${path}`}`;

  return (
    <Card className="h-full border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-semibold text-white">
          {translations.title}
        </CardTitle>
        <CardDescription className="text-white/70">
          {translations.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <p className="text-sm text-white/70">{translations.online}</p>
            <p className="text-2xl font-semibold text-emerald-300">
              <CountUp to={stats.activePrinters} />
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <p className="text-sm text-white/70">{translations.offline}</p>
            <p className="text-2xl font-semibold text-rose-300">
              <CountUp to={stats.offlinePrinters} />
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <p className="text-sm text-white/70">{translations.maintenance}</p>
            <p className="text-2xl font-semibold text-amber-200">
              <CountUp to={stats.maintenancePrinters} />
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <p className="text-sm text-white/70">{translations.utilization}</p>
            <p className="text-2xl font-semibold">
              <CountUp to={utilization} />%
            </p>
          </div>
        </div>

        <ProgressBar
          value={utilization}
          label={translations.utilizationLabel}
        />

        <Link href={withLocale('/staff/manage-printers')}>
          <Button
            className="mt-2 w-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
            size="lg"
          >
            {translations.cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

