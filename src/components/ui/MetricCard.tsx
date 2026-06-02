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
};

export function MetricCard({ label, value, unit, status, quality, timestamp }: MetricCardProps) {
  return (
    <article className="rounded-xl border border-border-subtle bg-bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
        {status !== undefined && <StatusBadge status={status} />}
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-text-primary">
        {displayText(value)}{unit && <span className="ml-1 text-sm text-text-secondary">{unit}</span>}
      </p>
      {(quality || timestamp) && <p className="mt-2 text-xs text-text-muted">{quality}{quality && timestamp ? ' · ' : null}{timestamp}</p>}
    </article>
  );
}
