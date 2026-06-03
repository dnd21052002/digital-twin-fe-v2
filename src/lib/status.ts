export type StatusTone = 'critical' | 'warning' | 'success' | 'maintenance' | 'unknown';
export type Severity = 'info' | 'warning' | 'critical';
export type AlarmState = 'new' | 'acknowledged' | 'resolved';

export type StatusMeta = {
  tone: StatusTone;
  label: string;
  className: string;
  token: string;
};

const STATUS_ALIASES: Record<string, StatusTone> = {
  critical: 'critical',
  error: 'critical',
  offline: 'critical',
  warning: 'warning',
  degraded: 'warning',
  normal: 'success',
  online: 'success',
  healthy: 'success',
  maintenance: 'maintenance',
  unknown: 'unknown',
  inactive: 'unknown',
  missing: 'unknown',
};

const TONE_LABELS: Record<StatusTone, string> = {
  critical: 'Critical',
  warning: 'Warning',
  success: 'Normal',
  maintenance: 'Maintenance',
  unknown: 'Unknown',
};

const TONE_CLASSES: Record<StatusTone, string> = {
  critical: 'border-critical/40 bg-critical/10 text-critical',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  success: 'border-success/40 bg-success/10 text-success',
  maintenance: 'border-maintenance/40 bg-maintenance/10 text-maintenance',
  unknown: 'border-unknown/40 bg-unknown/10 text-ink-muted',
};

const SEVERITY_LABELS: Record<Severity, string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
};

const STATE_LABELS: Record<AlarmState, string> = {
  new: 'New',
  acknowledged: 'Acknowledged',
  resolved: 'Resolved',
};

export function normalizeStatus(status: unknown): StatusTone {
  if (typeof status !== 'string') return 'unknown';
  return STATUS_ALIASES[status.trim().toLowerCase()] ?? 'unknown';
}

export function statusMeta(status: unknown): StatusMeta {
  const tone = normalizeStatus(status);
  return { tone, label: TONE_LABELS[tone], className: TONE_CLASSES[tone], token: `var(--${tone})` };
}

export function severityMeta(severity: Severity): StatusMeta {
  const tone: StatusTone = severity === 'critical' ? 'critical' : severity === 'warning' ? 'warning' : 'success';
  return { tone, label: SEVERITY_LABELS[severity], className: TONE_CLASSES[tone], token: `var(--${tone})` };
}

export function alarmStateLabel(state: AlarmState): string {
  return STATE_LABELS[state];
}
