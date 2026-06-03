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
  return <span className={`inline-flex items-center rounded-pill border px-2.5 py-0.5 text-caption font-medium ${meta.className}`}>{text}</span>;
}
