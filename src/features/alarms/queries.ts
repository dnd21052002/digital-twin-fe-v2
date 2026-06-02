import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../../lib/api/client';
import { normalizeList, normalizeNearestCamera, normalizeSopResponse } from '../../lib/api/normalizers';
import type { AlarmEvent, AlarmSummary, NearestCamera, SopResponse } from '../../lib/api/types';

export type AlarmFilters = {
  assetId?: string | null;
  severity?: string;
  status?: string;
};

export interface AlarmDetail extends AlarmSummary {
  description?: string;
  message?: string | null;
  status?: string;
  severity?: string;
  location?: string;
  source?: string;
  owner?: string;
  assetId?: string;
  raisedAt?: string;
  resolvedAt?: string;
  ackedBy?: string | null;
  ackedAt?: string | null;
  assignedTo?: string | null;
  assignedAt?: string | null;
  resolutionNote?: string | null;
  forecastValue?: number | null;
  thresholdValue?: number | null;
  currentValue?: number | null;
  rule?: { id: string; code: string; name: string } | null;
  relatedAlarms?: AlarmSummary[];
  timeline?: AlarmEvent[];
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

// ── Dependent queries ──

export function useAlarmTimelineQuery(alarmId: string | null | undefined) {
  return useQuery<AlarmEvent[]>({
    queryKey: ['alarms', alarmId, 'timeline'],
    queryFn: async () => {
      const detail = await apiRequest<unknown>(`/alarms/${alarmId}`);
      const rec = isRecord(detail) ? detail : {};
      const events = rec.timeline ?? rec.events ?? [];
      return normalizeList(events).map((e: unknown) => {
        const r = isRecord(e) ? e : {};
        const id = firstString(r, ['id', 'eventId', 'event_id'], `evt-${Math.random()}`);
        return {
          id,
          occurredAt: firstString(r, ['occurredAt', 'occurred_at', 'timestamp', 'ts']),
          actorId: firstString(r, ['actorId', 'actor_id']) || null,
          eventType: firstString(r, ['eventType', 'event_type', 'type']),
          payload: 'payload' in r ? r.payload : null,
        };
      });
    },
    enabled: Boolean(alarmId),
  });
}

export function useNearestCamerasQuery(alarmId: string | null | undefined) {
  return useQuery<NearestCamera[]>({
    queryKey: ['alarms', alarmId, 'nearest-cameras'],
    queryFn: async () => {
      const data = await apiRequest<unknown>(`/alarms/${alarmId}/nearest-cameras`);
      return normalizeList(unwrapData(data)).map(normalizeNearestCamera);
    },
    enabled: Boolean(alarmId),
  });
}

export function useSopQuery(alarmId: string | null | undefined) {
  return useQuery<SopResponse | null>({
    queryKey: ['alarms', alarmId, 'sop'],
    queryFn: async () => {
      try {
        const data = await apiRequest<unknown>(`/alarms/${alarmId}/sop`);
        return normalizeSopResponse(unwrapData(data));
      } catch (err) {
        if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) return null;
        throw err;
      }
    },
    enabled: Boolean(alarmId),
  });
}

// ── Mutations ──

export function useAcknowledgeAlarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ alarmId, comment }: { alarmId: string; comment?: string }) => {
      return apiRequest<{ ok: true }>(`/alarms/${alarmId}/acknowledge`, {
        method: 'POST',
        body: comment ? { comment } : undefined,
      });
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['alarms', variables.alarmId] });
      qc.invalidateQueries({ queryKey: ['alarms'] });
    },
  });
}

export function useAssignAlarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ alarmId, assigneeUserId }: { alarmId: string; assigneeUserId: string }) => {
      return apiRequest<{ ok: true }>(`/alarms/${alarmId}/assign`, {
        method: 'POST',
        body: { assigneeUserId },
      });
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['alarms', variables.alarmId] });
      qc.invalidateQueries({ queryKey: ['alarms'] });
    },
  });
}

export function useResolveAlarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ alarmId, resolution }: { alarmId: string; resolution: string }) => {
      return apiRequest<{ ok: true }>(`/alarms/${alarmId}/resolve`, {
        method: 'POST',
        body: { resolution },
      });
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['alarms', variables.alarmId] });
      qc.invalidateQueries({ queryKey: ['alarms'] });
    },
  });
}

// ── Users for assign dropdown ──

export function useUsersQuery() {
  return useQuery<{ id: string; name: string }[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const data = await apiRequest<unknown>('/users');
      return normalizeList(unwrapData(data)).map((u: unknown) => {
        const r = isRecord(u) ? u : {};
        return { id: firstString(r, ['id', 'userId', 'user_id']), name: firstString(r, ['name', 'displayName', 'display_name'], 'User') };
      });
    },
    staleTime: 120_000,
  });
}
