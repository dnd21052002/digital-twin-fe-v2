import { alarmStateLabel, severityMeta, statusMeta, type AlarmState, type Severity } from '../../lib/status';

export type StatusBadgeProps = {
  status?: unknown;
  severity?: Severity;
  state?: AlarmState;
  label?: string;
};

export function StatusBadge({ status, severity, state, label }: StatusBadgeProps) {
  const meta = severity ? severityMeta(severity) : statusMeta(status);
  const text = label ?? (state ? alarmStateLabel(state) : meta.label);
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{text}</span>;
}
