import type { ChartTooltipProps } from '../types';

export const PieTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
      <p className="font-semibold text-white/90">{item.name}</p>
      <p className="text-white/80">Tỉ lệ: {item.value}%</p>
    </div>
  );
};
