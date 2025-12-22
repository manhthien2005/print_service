'use client';

import { Card, CardDescription, CardHeader } from '@/components/ui/Card';
// CardContent not used currently
import CountUp from '@/components/ui/CountUp';
import { TrendBadge } from './TrendBadge';

export interface StatWidgetProps {
  label: string;
  value: number;
  suffix?: string;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
  caption?: string;
}

export function StatWidget({
  label,
  value,
  suffix,
  change,
  trend,
  caption,
}: StatWidgetProps) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardDescription className="text-base font-medium text-white/80">
          {label}
        </CardDescription>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-end gap-2 text-3xl font-semibold leading-tight text-white">
            <CountUp to={value} className="leading-none" separator="," />
            {suffix && (
              <span className="text-lg font-medium text-white/80">
                {suffix}
              </span>
            )}
          </div>
          {change && trend && <TrendBadge trend={trend} change={change} />}
        </div>
        {caption && <p className="text-sm text-white/65">{caption}</p>}
      </CardHeader>
    </Card>
  );
}
