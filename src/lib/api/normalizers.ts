import type {
  AlarmSummary,
  AssetDetail,
  AssetSummary,
  FacilityNode,
  LatestMetricsResponse,
  LoginResponse,
  MetricPoint,
  SceneAssetNode,
  SceneManifest,
  SceneSummary,
  User,
} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function firstString(source: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  return fallback;
}

export function normalizeList<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!isRecord(value)) return [];
  if (Array.isArray(value.items)) return value.items as T[];
  if (Array.isArray(value.data)) return value.data as T[];
  if (isRecord(value.data) && Array.isArray(value.data.items)) return value.data.items as T[];
  return [];
}

export function categoryToLabel(value: unknown): string {
  if (typeof value === 'string') return value.trim() || 'Unknown';
  if (isRecord(value)) return firstString(value, ['label', 'name', 'title', 'id'], 'Unknown');
  return 'Unknown';
}

export function normalizeCategory(value: unknown): string {
  const label = categoryToLabel(value).toLowerCase().trim();
  return label === 'unknown' ? 'unknown' : label.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function normalizeUser(value: unknown): User | undefined {
  if (!isRecord(value)) return undefined;
  const id = firstString(value, ['id', 'userId', 'user_id', 'sub'], 'user');
  const user: User = { id, name: firstString(value, ['name', 'displayName', 'display_name', 'email'], id), raw: value };
  const email = firstString(value, ['email']);
  const role = firstString(value, ['role']);
  const avatarUrl = firstString(value, ['avatarUrl', 'avatar_url']);
  if (email) user.email = email;
  if (role) user.role = role;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  return user;
}

export function normalizeAuthTokens(value: unknown) {
  const root = isRecord(value) ? value : {};
  const data = isRecord(root.data) ? root.data : root;
  const sources = [data.tokens, root.tokens, data, root].filter(isRecord);
  const accessToken = sources.reduce(
    (token, source) => token || firstString(source, ['accessToken', 'access_token', 'token', 'jwt']),
    '',
  );
  const refreshToken = sources.reduce(
    (token, source) => token || firstString(source, ['refreshToken', 'refresh_token']),
    '',
  );
  return refreshToken ? { accessToken, refreshToken } : { accessToken };
}

export function normalizeLoginResponse(value: unknown): LoginResponse {
  const root = isRecord(value) ? value : {};
  const data = isRecord(root.data) ? root.data : root;
  const login: LoginResponse = { tokens: normalizeAuthTokens(value), raw: value };
  const user = normalizeUser(data.user ?? root.user ?? data.me);
  if (user) login.user = user;
  return login;
}

export function normalizeSceneManifest(value: unknown): SceneManifest {
  const root = isRecord(value) ? value : {};
  const scene = isRecord(root.scene) ? root.scene : root;
  const assetInputs = Array.isArray(root.assets)
    ? root.assets.map((asset) => ({ asset, type: 'asset' }))
    : [
        ...normalizeList(root.meshes).map((asset) => ({ asset, type: 'mesh' })),
        ...normalizeList(root.textures).map((asset) => ({ asset, type: 'texture' })),
      ];
  return {
    id: firstString(scene, ['id', 'sceneId', 'scene_id'], 'scene'),
    name: firstString(scene, ['name', 'title'], 'Scene'),
    assets: assetInputs.map(({ asset, type }, index) => normalizeSceneAsset(asset, type, index)),
    raw: value,
  };
}

export function normalizeSceneAsset(value: unknown, fallbackType = 'asset', index = 0): SceneAssetNode {
  const record = isRecord(value) ? value : {};
  const type = firstString(record, ['type', 'kind'], fallbackType || 'asset');
  return {
    id: firstString(record, ['id', 'assetId', 'asset_id'], `${type}-${index}`),
    type,
    url: firstString(record, ['url', 'src', 'href', 'path']),
    category: normalizeCategory(record.category ?? type),
    raw: value,
  };
}

export function normalizeSceneSummary(value: unknown): SceneSummary {
  const record = isRecord(value) ? value : {};
  const id = firstString(record, ['id', 'sceneId', 'scene_id'], 'scene');
  const scene: SceneSummary = { id, name: firstString(record, ['name', 'title'], id), raw: value };
  const description = firstString(record, ['description']);
  const thumbnailUrl = firstString(record, ['thumbnailUrl', 'thumbnail_url']);
  if (description) scene.description = description;
  if (thumbnailUrl) scene.thumbnailUrl = thumbnailUrl;
  return scene;
}

export function normalizeAssetSummary(value: unknown): AssetSummary {
  const record = isRecord(value) ? value : {};
  const id = firstString(record, ['id', 'assetId', 'asset_id'], 'asset');
  const asset: AssetSummary = { id, name: firstString(record, ['name', 'title'], id), category: normalizeCategory(record.category), raw: value };
  const status = firstString(record, ['status', 'state']);
  if (status) asset.status = status;
  return asset;
}

export function normalizeAssetDetail(value: unknown): AssetDetail {
  const summary = normalizeAssetSummary(value);
  const record = isRecord(value) ? value : {};
  const detail: AssetDetail = { ...summary };
  const description = firstString(record, ['description']);
  if (description) detail.description = description;
  if (isRecord(record.metadata)) detail.metadata = record.metadata;
  return detail;
}

export function normalizeFacilityNode(value: unknown): FacilityNode {
  const record = isRecord(value) ? value : {};
  const id = firstString(record, ['id', 'nodeId', 'node_id'], 'facility');
  const node: FacilityNode = { id, name: firstString(record, ['name', 'title'], id), category: normalizeCategory(record.category), children: normalizeList(record.children).map(normalizeFacilityNode), raw: value };
  const type = firstString(record, ['type']);
  const parentId = firstString(record, ['parentId', 'parent_id']);
  if (type) node.type = type;
  if (parentId) node.parentId = parentId;
  return node;
}

export function normalizeAlarmSummary(value: unknown): AlarmSummary {
  const record = isRecord(value) ? value : {};
  const id = firstString(record, ['id', 'alarmId', 'alarm_id'], 'alarm');
  const alarm: AlarmSummary = { id, title: firstString(record, ['title', 'name', 'message'], id), raw: value };
  const severity = firstString(record, ['severity', 'level']);
  const status = firstString(record, ['status', 'state']);
  const assetId = firstString(record, ['assetId', 'asset_id']);
  const raisedAt = firstString(record, ['raisedAt', 'raised_at', 'createdAt', 'created_at']);
  if (severity) alarm.severity = severity;
  if (status) alarm.status = status;
  if (assetId) alarm.assetId = assetId;
  if (raisedAt) alarm.raisedAt = raisedAt;
  return alarm;
}

export function normalizeLatestMetrics(value: unknown): LatestMetricsResponse {
  const record = isRecord(value) ? value : {};
  const source = isRecord(record.metrics) ? record.metrics : record;
  const metrics: Record<string, number | string | boolean | null> = {};
  for (const [key, metric] of Object.entries(source)) {
    if (['string', 'number', 'boolean'].includes(typeof metric) || metric === null) metrics[key] = metric as number | string | boolean | null;
    else if (isRecord(metric) && (typeof metric.value === 'number' || typeof metric.value === 'string' || typeof metric.value === 'boolean' || metric.value === null)) metrics[key] = metric.value;
  }
  return { metrics, raw: value };
}

export function normalizeTimeseries(value: unknown) {
  const series = normalizeList<unknown>(isRecord(value) && 'series' in value ? value.series : value).map<MetricPoint>((point, index) => {
    const record = isRecord(point) ? point : {};
    const rawValue = record.value;
    const metric: MetricPoint = { timestamp: firstString(record, ['timestamp', 'time', 'ts'], String(index)), value: typeof rawValue === 'number' ? rawValue : null, raw: point };
    const unit = firstString(record, ['unit']);
    if (unit) metric.unit = unit;
    return metric;
  });
  return { series, raw: value };
}
