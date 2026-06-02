export type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: 'success' | 'warning' | 'critical' | 'primary';
};

const barColors: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-critical',
  primary: 'bg-primary',
};

export function ProgressBar({ value, max, label, unit, color = 'primary' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono tabular-nums text-text-primary">{value.toLocaleString()} / {max.toLocaleString()} {unit}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-bg-surface ring-1 ring-inset ring-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColors[color] ?? 'bg-primary'}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${pct.toFixed(0)}% used`}
        />
      </div>
      <p className="text-right text-xs text-text-muted">{pct.toFixed(1)}% used</p>
    </div>
  );
}
