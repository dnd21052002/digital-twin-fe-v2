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
    <article className="rounded-lg border border-hairline bg-surface-1 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-eyebrow text-ink-subtle">{label}</p>
        {status !== undefined && <StatusBadge status={status} />}
      </div>
      <p className="mt-3 font-mono text-headline tabular-nums text-ink">
        {displayText(value)}{unit && <span className="ml-1 text-body-sm text-ink-muted">{unit}</span>}
      </p>
      {(quality || timestamp) && <p className="mt-2 text-caption text-ink-tertiary">{quality}{quality && timestamp ? ' · ' : null}{timestamp}</p>}
    </article>
  );
}
