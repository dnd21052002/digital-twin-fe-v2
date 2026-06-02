import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../../lib/api/client';
import { normalizeList } from '../../lib/api/normalizers';
import type { AlarmSummary } from '../../lib/api/types';

export type AlarmFilters = {
  assetId?: string | null;
  severity?: string;
  status?: string;
};

export interface AlarmDetail extends AlarmSummary {
  description?: string;
  location?: string;
  source?: string;
  owner?: string;
  resolvedAt?: string;
  relatedAlarms?: AlarmSummary[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function firstString(source: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
    if (isRecord(value)) {
      const nested = firstString(value, ['label', 'name', 'title', 'id']);
      if (nested) return nested;
    }
  }
  return fallback;
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && 'data' in value) return value.data;
  return value;
}

function withQuery(path: string, filters?: AlarmFilters): string {
  const params = new URLSearchParams();
  if (filters?.assetId) params.set('assetId', filters.assetId);
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.status) params.set('status', filters.status);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function normalizeAlarmSummary(value: unknown): AlarmSummary {
  const record = isRecord(value) ? value : {};
  const id = firstString(record, ['id', 'alarmId', 'alarm_id'], 'alarm');
  const alarm: AlarmSummary = { id, title: firstString(record, ['title', 'name', 'message', 'summary'], id), raw: value };
  const severity = firstString(record, ['severity', 'level', 'priority']);
  const status = firstString(record, ['status', 'state', 'workflowState', 'workflow_state']);
  const assetId = firstString(record, ['assetId', 'asset_id', 'asset']);
  const raisedAt = firstString(record, ['raisedAt', 'raised_at', 'createdAt', 'created_at', 'timestamp']);
  if (severity) alarm.severity = severity;
  if (status) alarm.status = status;
  if (assetId) alarm.assetId = assetId;
  if (raisedAt) alarm.raisedAt = raisedAt;
  return alarm;
}

export function normalizeAlarmDetail(value: unknown): AlarmDetail {
  const record = isRecord(value) ? value : {};
  const detail: AlarmDetail = { ...normalizeAlarmSummary(value) };
  const description = firstString(record, ['description', 'detail', 'body', 'message']);
  const location = firstString(record, ['location', 'site', 'area']);
  const source = firstString(record, ['source', 'system', 'sensor']);
  const owner = firstString(record, ['owner', 'assignee', 'assignedTo', 'assigned_to']);
  const resolvedAt = firstString(record, ['resolvedAt', 'resolved_at', 'closedAt', 'closed_at']);
  const relatedInput = record.relatedAlarms ?? record.related_alarms ?? record.related;
  if (description) detail.description = description;
  if (location) detail.location = location;
  if (source) detail.source = source;
  if (owner) detail.owner = owner;
  if (resolvedAt) detail.resolvedAt = resolvedAt;
  const relatedAlarms = normalizeList(relatedInput).map(normalizeAlarmSummary);
  if (relatedAlarms.length > 0) detail.relatedAlarms = relatedAlarms;
  return detail;
}

export function useAlarmsQuery(filters?: AlarmFilters) {
  const normalizedFilters: AlarmFilters = {};
  if (filters?.assetId) normalizedFilters.assetId = filters.assetId;
  if (filters?.severity) normalizedFilters.severity = filters.severity;
  if (filters?.status) normalizedFilters.status = filters.status;
  return useQuery<AlarmSummary[]>({
    queryKey: ['alarms', normalizedFilters],
    queryFn: async () => normalizeList(unwrapData(await apiRequest<unknown>(withQuery('/alarms', normalizedFilters)))).map(normalizeAlarmSummary),
  });
}

export function useAlarmQuery(id: string | null | undefined) {
  return useQuery<AlarmDetail>({
    queryKey: ['alarms', id],
    queryFn: async () => normalizeAlarmDetail(unwrapData(await apiRequest<unknown>(`/alarms/${id}`))),
    enabled: Boolean(id),
  });
}
