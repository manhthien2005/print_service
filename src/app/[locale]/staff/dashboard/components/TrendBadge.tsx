import type { Trend } from '@/data/staffDashboardMock';
import { cn } from '@/lib/utils/cn';

interface TrendBadgeProps {
  trend: Trend;
  change: string;
}

export const TrendBadge = ({ trend, change }: TrendBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
      trend === 'up' && 'bg-emerald-500/15 text-emerald-300',
      trend === 'down' && 'bg-rose-500/15 text-rose-300',
      trend === 'flat' && 'bg-amber-500/15 text-amber-200'
    )}
  >
    <span aria-hidden>●</span>
    {change}
  </span>
);



