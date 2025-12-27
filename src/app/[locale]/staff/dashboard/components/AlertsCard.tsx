'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface AlertItem {
  id: string;
  title: string;
  time: string;
  severity: 'info' | 'warning' | 'critical';
  actionLabel?: string;
}

export interface AlertsCardProps {
  alerts: AlertItem[];
  translations: {
    title: string;
    description: string;
    severity: {
      critical: string;
      warning: string;
      info: string;
    };
  };
}

export function AlertsCard({ alerts, translations }: AlertsCardProps) {
  return (
    <Card className="h-full border-white/10 bg-white/5 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">{translations.title}</CardTitle>
        <CardDescription className="text-white/70">
          {translations.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.slice(0, 2).map(alert => {
          const severityLabel = translations.severity[alert.severity];
          return (
            <div
              key={alert.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{alert.title}</p>
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase',
                    alert.severity === 'critical' &&
                      'border border-rose-400/20 bg-rose-500/15 text-rose-300',
                    alert.severity === 'warning' &&
                      'border border-amber-400/20 bg-amber-500/15 text-amber-200',
                    alert.severity === 'info' &&
                      'border border-sky-400/20 bg-sky-500/15 text-sky-200'
                  )}
                >
                  {severityLabel}
                </span>
              </div>
              <p className="text-sm text-white/60">{alert.time}</p>
              {alert.actionLabel && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3 bg-white/10 text-white"
                >
                  {alert.actionLabel}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
