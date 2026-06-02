import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayText } from '../../lib/display';
import type { Severity } from '../../lib/status';
import { useAlarmQuery } from './queries';
import { RelatedAlarms } from './RelatedAlarms';

function severity(value?: string): Severity | undefined {
  return value === 'critical' || value === 'warning' || value === 'info' ? value : undefined;
}

function badgeProps(alarm: { severity?: string; status?: string }) {
  const sev = severity(alarm.severity);
  return sev ? { severity: sev } : { status: alarm.status ?? alarm.severity };
}

function Field({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-lg border border-border-subtle bg-bg-surface p-3"><dt className="text-xs uppercase tracking-wide text-text-muted">{label}</dt><dd className="mt-1 text-sm font-medium text-text-primary">{displayText(value)}</dd></div>;
}

export function AlarmDetail({ alarmId }: { alarmId?: string | null }) {
  const { data: alarm, isLoading, isError, error, refetch } = useAlarmQuery(alarmId);
  if (!alarmId) return <EmptyState title="No alarm selected" message="Select an alarm from the queue to inspect triage context." />;
  if (isLoading) return <LoadingState label="Loading alarm" />;
  if (isError) return <ErrorState title="Alarm unavailable" message={error instanceof Error ? error.message : 'Unable to load alarm.'} onRetry={() => void refetch()} />;
  if (!alarm) return <EmptyState title="Alarm not found" message="The selected alarm did not return detail data." />;

  return (
    <article className="space-y-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Alarm detail</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{displayText(alarm.title, alarm.id)}</h2>
          </div>
          <StatusBadge {...badgeProps(alarm)} />
        </div>
        {alarm.description && <p className="mt-3 text-sm text-text-secondary">{alarm.description}</p>}
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="Asset" value={alarm.assetId} />
        <Field label="Status" value={alarm.status} />
        <Field label="Raised" value={alarm.raisedAt} />
        <Field label="Owner" value={alarm.owner} />
        <Field label="Source" value={alarm.source} />
        <Field label="Location" value={alarm.location} />
      </dl>
      {alarm.relatedAlarms && alarm.relatedAlarms.length > 0 && <RelatedAlarms alarms={alarm.relatedAlarms} />}
    </article>
  );
}
