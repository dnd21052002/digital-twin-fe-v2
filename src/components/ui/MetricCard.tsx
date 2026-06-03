import type { ReactNode } from 'react';

import { displayText } from '../../lib/display';
import { StatusBadge } from './StatusBadge';

export type MetricCardProps = {
  label: ReactNode;
  value: unknown;
  unit?: string;
  status?: unknown;
  quality?: ReactNode;
  timestamp?: ReactNode;
  selected?: boolean;
};

export function MetricCard({ label, value, unit, status, quality, timestamp, selected }: MetricCardProps) {
  return (
    <article className={`rounded-lg border p-4 transition-all duration-150 ${selected ? 'border-primary bg-surface-2' : 'border-hairline bg-surface-1 hover:border-hairline-strong'}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-eyebrow text-ink-subtle">{label}</p>
        {status !== undefined && <StatusBadge status={status} />}
      </div>
      <p className="mt-3 font-mono text-headline tabular-nums text-ink glow-primary">
        {displayText(value)}{unit && <span className="ml-1 text-body-sm text-ink-muted">{unit}</span>}
      </p>
      {(quality || timestamp) && <p className="mt-2 text-caption text-ink-tertiary">{quality}{quality && timestamp ? ' · ' : null}{timestamp}</p>}
    </article>
  );
}
