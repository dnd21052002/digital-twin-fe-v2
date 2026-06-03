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

const glowColors: Record<string, string> = {
  success: 'glow-success',
  warning: '',
  critical: 'glow-critical',
  primary: 'glow-primary',
};

export function ProgressBar({ value, max, label, unit, color = 'primary' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-body-sm">
        <span className="text-ink-muted">{label}</span>
        <span className={`font-mono tabular-nums text-ink ${glowColors[color] ?? ''}`}>{value.toLocaleString()} / {max.toLocaleString()} {unit}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColors[color] ?? 'bg-primary'}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${pct.toFixed(0)}% used`}
        />
      </div>
      <p className="text-right text-caption text-ink-tertiary">{pct.toFixed(1)}% used</p>
    </div>
  );
}
