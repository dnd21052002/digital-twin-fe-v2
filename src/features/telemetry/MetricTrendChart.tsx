import { useMemo } from 'react';
import { ReferenceLine, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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

function isAnomaly(value: number | null, thresholds: LatestMetric['thresholds']): boolean {
  if (value === null || value === undefined || !thresholds) return false;
  if (thresholds.critHigh !== undefined && value > thresholds.critHigh) return true;
  if (thresholds.critLow !== undefined && value < thresholds.critLow) return true;
  if (thresholds.warnHigh !== undefined && value > thresholds.warnHigh) return true;
  if (thresholds.warnLow !== undefined && value < thresholds.warnLow) return true;
  return false;
}

export function MetricTrendChart({ assetId, metrics, selectedMetricKey, onMetricChange, series, isLoading, isError, errorMessage, onRetry, relatedAlarms = [] }: { assetId: string; metrics: LatestMetric[]; selectedMetricKey: string | null; onMetricChange: (key: string) => void; series?: Timeseries; isLoading?: boolean; isError?: boolean; errorMessage?: string; onRetry?: () => void; relatedAlarms?: AlarmDetail[] }) {
  const selected = metrics.find((metric) => metric.key === selectedMetricKey) ?? metrics[0];
  const points = useMemo(() => series?.points ?? [], [series?.points]);
  const unit = series?.unit ?? selected?.unit;
  const thresholds = selected?.thresholds;
  const threshold = selected?.threshold;

  const thresholdLines = useMemo(() => {
    if (!thresholds) return [];
    const lines: { y: number; stroke: string; label: string }[] = [];
    if (thresholds.critHigh !== undefined) lines.push({ y: thresholds.critHigh, stroke: 'var(--critical)', label: 'Crit High' });
    if (thresholds.warnHigh !== undefined) lines.push({ y: thresholds.warnHigh, stroke: 'var(--warning)', label: 'Warn High' });
    if (thresholds.warnLow !== undefined) lines.push({ y: thresholds.warnLow, stroke: 'var(--warning)', label: 'Warn Low' });
    if (thresholds.critLow !== undefined) lines.push({ y: thresholds.critLow, stroke: 'var(--critical)', label: 'Crit Low' });
    return lines;
  }, [thresholds]);

  const anomalyPoints = useMemo(() => {
    return points.filter((p) => p.value !== null && isAnomaly(p.value, thresholds));
  }, [points, thresholds]);

  if (!selected) return <EmptyState title="No metric selected" message={`No trend metric is available for ${assetId}.`} />;
  return <section className="rounded-lg border border-hairline bg-surface-1 p-4" aria-label="Telemetry trend">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <label className="grid gap-1 text-body-sm text-ink-muted">Metric
        <select className="rounded-md border border-hairline-strong bg-surface-2 px-3 py-2 text-body-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus" value={selected.key} onChange={(event) => onMetricChange(event.target.value)}>
          {metrics.map((metric) => <option key={metric.key} value={metric.key}>{metric.name}</option>)}
        </select>
      </label>
      <p className="text-caption text-ink-tertiary">{thresholdLines.length > 0 ? 'Yellow=warn, Red=crit · Anomaly dots' : 'Threshold markers shown when data present.'}</p>
    </div>
    {isLoading ? <LoadingState label="Loading telemetry trend" /> : isError ? <ErrorState title="Telemetry trend unavailable" message={errorMessage ?? 'Unable to load telemetry trend.'} {...(onRetry ? { onRetry } : {})} /> : points.length === 0 ? <EmptyState title="No trend samples" message="This metric has no samples in the selected range." /> :
      <div className="h-72" role="img" aria-label={`${selected.name} trend chart`}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 10, right: 18, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
          <XAxis dataKey="timestamp" tickFormatter={timeLabel} minTickGap={28} stroke="var(--ink-tertiary)" fontSize={11} />
          <YAxis {...(unit ? { unit: ` ${unit}` } : {})} width={64} stroke="var(--ink-tertiary)" fontSize={11} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--hairline-strong)', borderRadius: '8px', fontSize: '13px', color: 'var(--ink)' }}
            labelFormatter={(value) => timeLabel(String(value))}
            formatter={(value, name, props) => {
              const point = props.payload as Record<string, unknown>;
              const pointVal = point.value as number | null;
              const anomaly = pointVal !== null && (isAnomaly(pointVal, thresholds) || (threshold !== undefined && pointVal > threshold));
              const label = anomaly ? `⚠ Anomaly: ${value}${unit ? ` ${unit}` : ''}` : `${value}${unit ? ` ${unit}` : ''}`;
              return [label, selected.name];
            }}
          />
          {threshold !== undefined && <ReferenceLine y={threshold} stroke="var(--warning)" strokeDasharray="4 4" label="Threshold" />}
          {thresholdLines.map((tl) => (
            <ReferenceLine key={tl.label} y={tl.y} stroke={tl.stroke} strokeDasharray="4 4" label={tl.label} />
          ))}
          {relatedAlarms.map((alarm) => {
            const ts = alarmTimestamp(alarm);
            return <ReferenceLine key={alarm.id} x={ts} stroke="var(--critical)" strokeDasharray="2 2" label="Alarm" />;
          })}
          <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} connectNulls />
        </LineChart></ResponsiveContainer>
        {anomalyPoints.length > 0 && <p className="mt-2 text-caption text-ink-tertiary">{anomalyPoints.length} anomalous sample(s) detected</p>}
      </div>}
  </section>;
}
