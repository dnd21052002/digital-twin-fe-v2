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
  return <span className={`inline-flex items-center rounded-pill border px-2 py-0.5 text-[11px] font-medium leading-tight ${meta.className}`}>{text}</span>;
}
