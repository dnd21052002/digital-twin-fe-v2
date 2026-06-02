import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../../lib/api/client';
import { normalizeList } from '../../lib/api/normalizers';

export type TelemetryRange = '1h' | '6h' | '24h';
export type LatestMetric = { key: string; name: string; value: number | string | boolean | null; unit?: string; quality?: number | string; timestamp?: string; threshold?: number; raw?: unknown };
export type LatestMetrics = { assetId: string; items: LatestMetric[]; raw?: unknown };
export type TimeseriesPoint = { timestamp: string; value: number | null; raw?: unknown };
export type Timeseries = { assetId: string; metricKey: string; unit?: string; from?: string; to?: string; interval?: string; points: TimeseriesPoint[]; raw?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function unwrapData(value: unknown): unknown { return isRecord(value) && 'data' in value && (Array.isArray(value.data) || isRecord(value.data)) ? value.data : value; }
function firstString(source: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
    if (isRecord(value)) { const nested = firstString(value, ['label', 'name', 'title', 'id', 'key']); if (nested) return nested; }
  }
  return fallback;
}
function numeric(value: unknown): number | undefined { return typeof value === 'number' && Number.isFinite(value) ? value : typeof value === 'string' && value.trim() && Number.isFinite(Number(value)) ? Number(value) : undefined; }
function scalar(value: unknown): LatestMetric['value'] { return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean' || value === null ? value : null; }

function normalizeLatestMetric(value: unknown, index: number): LatestMetric {
  const record = isRecord(value) ? value : {};
  const key = firstString(record, ['key', 'metricKey', 'metric_key', 'name', 'id'], `metric-${index + 1}`);
  const rawValue = 'value' in record ? record.value : value;
  const metric: LatestMetric = { key, name: firstString(record, ['name', 'label', 'title', 'key', 'metricKey', 'metric_key'], key), value: scalar(rawValue), raw: value };
  const unit = firstString(record, ['unit', 'uom']);
  const timestamp = firstString(record, ['timestamp', 'time', 'ts', 'recordedAt', 'recorded_at']);
  const threshold = numeric(record.threshold ?? record.alarmThreshold ?? record.alarm_threshold);
  const quality = record.quality ?? record.qualityCode ?? record.quality_code;
  if (unit) metric.unit = unit;
  if (timestamp) metric.timestamp = timestamp;
  if (typeof quality === 'number' || typeof quality === 'string') metric.quality = quality;
  if (threshold !== undefined) metric.threshold = threshold;
  return metric;
}
function objectMetrics(value: unknown): LatestMetric[] {
  const source = isRecord(value) && isRecord(value.metrics) ? value.metrics : value;
  if (!isRecord(source)) return [];
  return Object.entries(source).filter(([key]) => !['assetId', 'asset_id', 'id', 'from', 'to', 'interval'].includes(key)).map(([key, entry], index) => isRecord(entry) ? normalizeLatestMetric({ key, ...entry }, index) : { key, name: key, value: scalar(entry), raw: entry });
}
export function normalizeLatestMetrics(value: unknown): LatestMetrics {
  const root = isRecord(value) ? value : {};
  const source = unwrapData(value);
  const explicitList = isRecord(source) && ('items' in source || 'data' in source) && (Array.isArray(source.items) || Array.isArray(source.data));
  const array = normalizeList(source);
  return { assetId: firstString(root, ['assetId', 'asset_id', 'id']), items: explicitList ? array.map(normalizeLatestMetric) : array.length > 0 ? array.map(normalizeLatestMetric) : objectMetrics(source), raw: value };
}
export function normalizeTimeseries(value: unknown): Timeseries {
  const root = isRecord(value) ? value : {};
  const source = unwrapData(value);
  const record = isRecord(source) ? source : root;
  const pointInput = record.points ?? record.items ?? record.data ?? record.series ?? source;
  const points = normalizeList(pointInput).map((point, index) => { const row = isRecord(point) ? point : {}; return { timestamp: firstString(row, ['timestamp', 'time', 'ts'], String(index)), value: numeric(row.value) ?? null, raw: point }; });
  const unit = firstString(record, ['unit', 'uom']);
  const from = firstString(record, ['from', 'start']);
  const to = firstString(record, ['to', 'end']);
  const interval = firstString(record, ['interval', 'step']);
  return { assetId: firstString(record, ['assetId', 'asset_id']), metricKey: firstString(record, ['metricKey', 'metric_key', 'metric', 'key']), unit, from, to, interval, points, raw: value };
}
export function rangeToWindow(range: TelemetryRange, now = new Date()) { const hours = range === '24h' ? 24 : range === '6h' ? 6 : 1; const to = now; const from = new Date(to.getTime() - hours * 60 * 60 * 1000); return { from: from.toISOString(), to: to.toISOString() }; }
export function useLatestMetricsQuery(assetId: string | null | undefined) { return useQuery<LatestMetrics>({ queryKey: ['telemetry', 'latest', assetId], queryFn: async () => normalizeLatestMetrics(await apiRequest<unknown>(`/assets/${assetId}/metrics/latest`)), enabled: Boolean(assetId) }); }
export function useTimeseriesQuery(assetId: string | null | undefined, metricKey: string | null | undefined, range: TelemetryRange) {
  const window = rangeToWindow(range);
  return useQuery<Timeseries>({ queryKey: ['telemetry', 'timeseries', assetId, metricKey, range], queryFn: async () => { const params = new URLSearchParams({ metric: metricKey ?? '', from: window.from, to: window.to, limit: '1000' }); return normalizeTimeseries(await apiRequest<unknown>(`/assets/${assetId}/metrics/timeseries?${params.toString()}`)); }, enabled: Boolean(assetId && metricKey) });
}
