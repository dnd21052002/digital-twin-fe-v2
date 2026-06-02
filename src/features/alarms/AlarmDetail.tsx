import { useCallback, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayText } from '../../lib/display';
import type { Severity } from '../../lib/status';
import { useAlarmQuery, useAcknowledgeAlarm, useAssignAlarm, useNearestCamerasQuery, useResolveAlarm, useSopQuery, useUsersQuery } from './queries';
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

function isAckable(state?: string) { return state === 'new' || state === 'open'; }
function isResolvable(state?: string) { return state !== 'resolved' && state !== 'closed' && state !== 'auto_cleared'; }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section role="region" aria-label={title} className="rounded-xl border border-border-subtle bg-bg-panel p-4"><h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>{children}</section>;
}

// ── Action buttons ──

type ABProps = { alarmId: string; state: string | undefined; onStateChange: () => void };

function ActionButtons({ alarmId, state, onStateChange }: ABProps) {
  const [ao, setAo] = useState(false);
  const [ro, setRo] = useState(false);
  const [res, setRes] = useState('');
  const ak = useAcknowledgeAlarm();
  const as = useAssignAlarm();
  const rv = useResolveAlarm();
  const { data: users } = useUsersQuery();

  const onAck = useCallback(() => ak.mutate({ alarmId }, { onSuccess: onStateChange }), [alarmId, ak, onStateChange]);
  const onAssign = useCallback((uid: string) => as.mutate({ alarmId, assigneeUserId: uid }, { onSuccess() { setAo(false); onStateChange(); } }), [alarmId, as, onStateChange]);
  const onResolve = useCallback(() => { if (!res.trim()) return; rv.mutate({ alarmId, resolution: res.trim() }, { onSuccess() { setRo(false); setRes(''); onStateChange(); } }); }, [alarmId, res, rv, onStateChange]);

  return (
    <Section title="Actions">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={ak.isPending || !isAckable(state)} onClick={onAck}>{ak.isPending ? 'Ack…' : 'Acknowledge'}</Button>
        <div className="relative">
          <Button variant="secondary" size="sm" disabled={as.isPending} onClick={() => setAo(!ao)}>{as.isPending ? 'Assign…' : 'Assign'}</Button>
          {ao && users && <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-56 overflow-y-auto rounded-lg border border-border-strong bg-bg-elevated p-1 shadow-lg">
            {users.length === 0 && <p className="p-2 text-xs text-text-muted">No users</p>}
            {users.map((u) => <button key={u.id} type="button" className="w-full rounded-md px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-surface" onClick={() => onAssign(u.id)}>{u.name}</button>)}
          </div>}
        </div>
        <div className="relative">
          <Button variant="danger" size="sm" disabled={rv.isPending || !isResolvable(state)} onClick={() => setRo(true)}>{rv.isPending ? 'Resolve…' : 'Resolve'}</Button>
          {ro && <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border-strong bg-bg-elevated p-3 shadow-lg">
            <label className="text-xs font-medium text-text-secondary">Resolution note</label>
            <textarea className="mt-1 w-full rounded-md border border-border-subtle bg-bg-surface p-2 text-sm text-text-primary placeholder:text-text-muted" rows={3} placeholder="Describe…" value={res} onChange={(e) => setRes(e.target.value)} autoFocus />
            <div className="mt-2 flex gap-2">
              <Button variant="danger" size="sm" disabled={!res.trim() || rv.isPending} onClick={onResolve}>Confirm</Button>
              <Button variant="ghost" size="sm" onClick={() => setRo(false)}>Cancel</Button>
            </div>
          </div>}
        </div>
      </div>
      {ak.isError && <p className="mt-2 text-xs text-critical">{(ak.error as Error)?.message}</p>}
      {as.isError && <p className="mt-2 text-xs text-critical">{(as.error as Error)?.message}</p>}
      {rv.isError && <p className="mt-2 text-xs text-critical">{(rv.error as Error)?.message}</p>}
    </Section>
  );
}

// ── Timeline ──

const EV_LABELS: Record<string, string> = {
  acknowledged: 'Acknowledged', ack: 'Acknowledged', assigned: 'Assigned',
  resolved: 'Resolved', resolve: 'Resolved', created: 'Created', raised: 'Alarm raised',
  escalated: 'Escalated', updated: 'Updated', commented: 'Comment added', note: 'Note added',
};
const EV_ICONS: Record<string, string> = {
  acknowledged: '✓', ack: '✓', assigned: '→', resolved: '✕', resolve: '✕',
  created: '●', raised: '●', escalated: '▲', updated: '✎', commented: '💬', note: '📝',
};
function eLabel(et: string) { return EV_LABELS[et.toLowerCase()] ?? et; }
function eIcon(et: string) { return EV_ICONS[et.toLowerCase()] ?? '○'; }

function TimelineSection({ alarmId }: { alarmId: string }) {
  const { data: alarm } = useAlarmQuery(alarmId);
  const tl = alarm?.timeline ?? [];
  if (tl.length === 0) return <Section title="Timeline"><EmptyState title="No events" message="No timeline events recorded for this alarm." /></Section>;

  return (
    <Section title={`Timeline (${tl.length})`}>
      <ol className="space-y-0">{tl.map((ev, i) => {
        const payloadText = ev.payload && typeof ev.payload === 'object' ? String((ev.payload as Record<string, unknown>).note ?? (ev.payload as Record<string, unknown>).comment ?? '') : null;
        return (
        <li key={ev.id || i} className="flex gap-3 pb-4 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-surface text-xs" aria-hidden="true">{eIcon(ev.eventType)}</span>
            {i < tl.length - 1 && <div className="mt-1 w-px flex-1 bg-border-subtle" />}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-text-primary">{eLabel(ev.eventType)}</p>
            <p className="mt-0.5 text-xs text-text-muted">
              {ev.occurredAt ? new Date(ev.occurredAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''}
              {ev.actorId && ` by ${ev.actorId}`}
            </p>
            {payloadText && <p className="mt-1 text-xs text-text-secondary">{payloadText}</p>}
          </div>
        </li>);
      })}</ol>
    </Section>
  );
}

// ── Nearest cameras ──

function CamerasSection({ alarmId }: { alarmId: string }) {
  const { data: cams, isLoading, isError, error, refetch } = useNearestCamerasQuery(alarmId);

  if (isLoading) return <Section title="Nearest cameras"><LoadingState label="Loading cameras" /></Section>;
  if (isError) return <Section title="Nearest cameras"><ErrorState title="Cameras unavailable" message={error instanceof Error ? error.message : 'Unable to load cameras.'} onRetry={() => void refetch()} /></Section>;
  if (!cams || cams.length === 0) return <Section title="Nearest cameras"><EmptyState title="No cameras" message="No CCTV cameras found near this alarm location." /></Section>;

  return (
    <Section title={`Nearest cameras (${cams.length})`}>
      <div className="space-y-2">{cams.map((cam) => (
        <div key={cam.cameraId} className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-surface p-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">{cam.name}</p>
            <p className="text-xs text-text-muted">Coverage: {cam.coveragePct}%</p>
          </div>
          {cam.streamUrl && <Button variant="ghost" size="sm" onClick={() => window.open(cam.streamUrl, '_blank', 'noopener')}>View</Button>}
        </div>
      ))}</div>
    </Section>
  );
}

// ── SOP ──

function SopSection({ alarmId }: { alarmId: string }) {
  const { data: sop, isLoading, isError, error, refetch } = useSopQuery(alarmId);

  if (isLoading) return <Section title="SOP"><LoadingState label="Loading SOP" /></Section>;
  if (isError) return <Section title="SOP"><ErrorState title="SOP unavailable" message={error instanceof Error ? error.message : 'Unable to load SOP.'} onRetry={() => void refetch()} /></Section>;
  if (!sop) return <Section title="SOP"><EmptyState title="No SOP" message="No standard operating procedure linked to this alarm rule." /></Section>;

  return (
    <Section title={`SOP: ${sop.sop.title}`}>
      {sop.sop.summary && <p className="mb-3 text-sm text-text-secondary">{sop.sop.summary}</p>}
      <ol className="space-y-3">{sop.steps.map((step) => (
        <li key={step.stepNumber} className="rounded-lg border border-border-subtle bg-bg-surface p-3">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{step.stepNumber}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">{step.instruction}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                {step.estimatedMinutes != null && <span>⏱ {step.estimatedMinutes} min</span>}
                {step.requiresRole && <span>🔒 {step.requiresRole}</span>}
              </div>
              {step.expectedOutcome && <p className="mt-1 text-xs text-text-secondary">→ {step.expectedOutcome}</p>}
            </div>
          </div>
        </li>
      ))}</ol>
    </Section>
  );
}

// ── Main component ──

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
        {alarm.message && !alarm.description && <p className="mt-3 text-sm text-text-secondary">{alarm.message}</p>}
      </div>

      <ActionButtons alarmId={alarm.id} state={alarm.status} onStateChange={() => void refetch()} />

      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="Asset" value={alarm.assetId} />
        <Field label="Status" value={alarm.status} />
        <Field label="Raised" value={alarm.raisedAt} />
        <Field label="Owner" value={alarm.owner} />
        <Field label="Source" value={alarm.source} />
        <Field label="Location" value={alarm.location} />
        {alarm.currentValue != null && <Field label="Current value" value={alarm.currentValue} />}
        {alarm.thresholdValue != null && <Field label="Threshold" value={alarm.thresholdValue} />}
        {alarm.forecastValue != null && <Field label="Forecast" value={alarm.forecastValue} />}
        {alarm.ackedBy && <Field label="Acknowledged by" value={alarm.ackedBy} />}
        {alarm.assignedTo && <Field label="Assigned to" value={alarm.assignedTo} />}
        {alarm.resolutionNote && <Field label="Resolution note" value={alarm.resolutionNote} />}
      </dl>

      <TimelineSection alarmId={alarm.id} />
      <CamerasSection alarmId={alarm.id} />
      <SopSection alarmId={alarm.id} />
      {alarm.relatedAlarms && alarm.relatedAlarms.length > 0 && <RelatedAlarms alarms={alarm.relatedAlarms} />}
    </article>
  );
}

