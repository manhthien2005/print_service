'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
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
    noActivities?: string;
    severity: {
      critical: string;
      warning: string;
      info: string;
    };
  };
}

export function AlertsCard({ alerts, translations }: AlertsCardProps) {
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
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/60">
            {translations.noActivities || 'No recent activities'}
          </p>
        ) : (
          alerts.slice(0, 4).map(alert => {
            const severityLabel = translations.severity[alert.severity];
            return (
              <div
                key={alert.id}
                className="rounded-lg border border-white/10 bg-white/5 p-3 text-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {alert.title}
                    </p>
                    <p className="mt-1 text-xs text-white/60">{alert.time}</p>
                  </div>
                  <span
                    className={cn(
                      'flex flex-shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
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
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
