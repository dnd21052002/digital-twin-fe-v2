import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayText } from '../../lib/display';
import type { Severity } from '../../lib/status';
import type { AlarmDetail } from './queries';

function severity(value?: string): Severity | undefined {
  return value === 'critical' || value === 'warning' || value === 'info' ? value : undefined;
}

function badgeProps(alarm: { severity?: string; status?: string }) {
  const sev = severity(alarm.severity);
  return sev ? { severity: sev } : { status: alarm.status ?? alarm.severity };
}

type AlarmListProps = {
  alarms: AlarmDetail[];
  selectedAlarmId?: string | null;
  onSelect: (alarmId: string) => void;
};

export function AlarmList({ alarms, selectedAlarmId, onSelect }: AlarmListProps) {
  if (alarms.length === 0) return <EmptyState title="No alarms" message="No alarms match the selected filters." />;
  return (
    <div className="space-y-1" role="list" aria-label="Alarm queue">
      {alarms.map((alarm) => (
        <div key={alarm.id} role="listitem">
        <button
          type="button"
          aria-pressed={alarm.id === selectedAlarmId}
          className={`w-full rounded-md border p-3 text-left transition-colors ${alarm.id === selectedAlarmId ? 'border-primary bg-surface-2' : 'border-hairline bg-surface-1 hover:bg-surface-2'}`}
          onClick={() => onSelect(alarm.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-body-sm font-medium text-ink">{displayText(alarm.title, alarm.id)}</p>
              <p className="mt-0.5 text-caption text-ink-subtle">{displayText(alarm.assetId, 'Unassigned asset')}</p>
            </div>
            <StatusBadge {...badgeProps(alarm)} />
          </div>
          <p className="mt-2 text-caption text-ink-tertiary">{displayText(alarm.raisedAt, 'No timestamp')}</p>
        </button>
        </div>
      ))}
    </div>
  );
}
