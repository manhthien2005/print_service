import type { ChartTooltipProps } from '../types';

export const CustomTooltip = ({
  active,
  payload,
  label,
}: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
      <p className="font-semibold text-white/90">{label}</p>
      {payload.map(item => (
        <p key={item.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.name}: <span className="font-semibold">{item.value}</span>
        </p>
      ))}
    </div>
  );
};

