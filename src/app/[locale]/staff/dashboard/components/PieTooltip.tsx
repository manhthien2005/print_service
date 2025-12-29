import type { ChartTooltipProps } from '../types';

interface PieTooltipProps extends ChartTooltipProps {
  ratioLabel?: string;
  countLabel?: string;
}

export const PieTooltip = ({
  active,
  payload,
  ratioLabel = 'Ratio',
  countLabel = 'Count',
}: PieTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const itemPayload = (item as any).payload;
  const count = itemPayload?.count || itemPayload?.value || item.value || 0;
  const percentage = typeof item.value === 'number' ? item.value : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
      <p className="font-semibold text-white/90">{item.name}</p>
      <div className="mt-1 space-y-1">
        <p className="text-white/80">
          {countLabel}:{' '}
          {typeof count === 'number' ? count.toLocaleString() : count}
        </p>
        <p className="text-white/80">
          {ratioLabel}: {percentage.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};
