interface ProgressBarProps {
  value: number;
  label?: string;
}

export const ProgressBar = ({ value, label }: ProgressBarProps) => (
  <div>
    <div className="mb-2 flex items-center justify-between text-sm text-white/70">
      <span>{label ?? 'Utilization'}</span>
      <span className="font-semibold text-white">{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

