import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayText } from '../../lib/display';
import type { Severity } from '../../lib/status';
import type { AlarmDetail } from './queries';
import { useAlarmsQuery } from './queries';

function severity(value?: string): Severity | undefined {
  return value === 'critical' || value === 'warning' || value === 'info' ? value : undefined;
}

function badgeProps(alarm: { severity?: string; status?: string }) {
  const sev = severity(alarm.severity);
  return sev ? { severity: sev } : { status: alarm.status ?? alarm.severity };
}

type RelatedAlarmsProps = {
  assetId?: string | null;
  alarms?: AlarmDetail[];
};

export function RelatedAlarms({ assetId, alarms }: RelatedAlarmsProps) {
  const query = useAlarmsQuery(assetId ? { assetId } : undefined);
  const source = alarms ?? query.data ?? [];
  const visible = assetId ? source.filter((alarm) => alarm.assetId === assetId) : source;

  if (!alarms && query.isLoading) return <LoadingState label="Loading related alarms" />;
  if (!alarms && query.isError) return <ErrorState title="Related alarms unavailable" message={query.error instanceof Error ? query.error.message : 'Unable to load related alarms.'} onRetry={() => void query.refetch()} />;

  return (
    <section role="region" aria-label="Related alarms" className="rounded-lg border border-hairline bg-surface-1 p-4">
      <h3 className="text-body-sm font-medium text-ink">Related Alarms</h3>
      {visible.length === 0 ? <div className="mt-3"><EmptyState title="No related alarms" message="No active alarms are linked to this asset." /></div> : (
        <ul className="mt-3 space-y-1.5">
          {visible.map((alarm) => (
            <li key={alarm.id} className="rounded-md border border-hairline bg-surface-2 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-body-sm font-medium text-ink">{displayText(alarm.title, alarm.id)}</p>
                  <p className="mt-0.5 text-caption text-ink-tertiary">{displayText(alarm.raisedAt, alarm.assetId)}</p>
                </div>
                <StatusBadge {...badgeProps(alarm)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
