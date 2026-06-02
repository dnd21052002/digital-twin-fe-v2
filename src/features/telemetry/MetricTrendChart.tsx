import { ReferenceDot, ReferenceLine, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import type { AlarmDetail } from '../alarms/queries';
import type { LatestMetric, Timeseries } from './queries';

function timeLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
function alarmTimestamp(alarm: AlarmDetail) { return alarm.raisedAt ?? ''; }
export function MetricTrendChart({ assetId, metrics, selectedMetricKey, onMetricChange, series, isLoading, isError, errorMessage, onRetry, relatedAlarms = [] }: { assetId: string; metrics: LatestMetric[]; selectedMetricKey: string | null; onMetricChange: (key: string) => void; series?: Timeseries; isLoading?: boolean; isError?: boolean; errorMessage?: string; onRetry?: () => void; relatedAlarms?: AlarmDetail[] }) {
  const selected = metrics.find((metric) => metric.key === selectedMetricKey) ?? metrics[0];
  const points = series?.points ?? [];
  const unit = series?.unit ?? selected?.unit;
  if (!selected) return <EmptyState title="No metric selected" message={`No trend metric is available for ${assetId}.`} />;
  return <section className="rounded-xl border border-border-subtle bg-bg-panel p-4" aria-label="Telemetry trend">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <label className="grid gap-1 text-sm text-text-secondary">Metric
        <select className="rounded-md border border-border-strong bg-bg-surface px-3 py-2 text-text-primary" value={selected.key} onChange={(event) => onMetricChange(event.target.value)}>
          {metrics.map((metric) => <option key={metric.key} value={metric.key}>{metric.name}</option>)}
        </select>
      </label>
      <p className="text-xs text-text-muted">Threshold/alarm markers shown when telemetry metadata is present.</p>
    </div>
    {isLoading ? <LoadingState label="Loading telemetry trend" /> : isError ? <ErrorState title="Telemetry trend unavailable" message={errorMessage ?? 'Unable to load telemetry trend.'} {...(onRetry ? { onRetry } : {})} /> : points.length === 0 ? <EmptyState title="No trend samples" message="This metric has no samples in the selected range." /> :
      <div className="h-72" role="img" aria-label={`${selected.name} trend chart`}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 10, right: 18, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={timeLabel} minTickGap={28} />
          <YAxis {...(unit ? { unit: ` ${unit}` } : {})} width={64} />
          <Tooltip labelFormatter={(value) => timeLabel(String(value))} formatter={(value) => [`${value}${unit ? ` ${unit}` : ''}`, selected.name]} />
          {selected.threshold !== undefined && <ReferenceLine y={selected.threshold} stroke="var(--warning)" strokeDasharray="4 4" label="Threshold" />}
          {relatedAlarms.map((alarm) => <ReferenceDot key={alarm.id} x={alarmTimestamp(alarm)} y={selected.threshold ?? points[0]?.value ?? 0} r={4} fill="var(--critical)" stroke="var(--critical)" />)}
          <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} connectNulls />
        </LineChart></ResponsiveContainer>
      </div>}
  </section>;
}
