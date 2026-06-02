export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  raw?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse {
  user?: User;
  tokens: AuthTokens;
  raw?: unknown;
}

export interface FacilityNode {
  id: string;
  name: string;
  type?: string;
  category?: string;
  parentId?: string;
  children?: FacilityNode[];
  raw?: unknown;
}

export interface SceneAssetNode {
  id: string;
  type: string;
  url: string;
  category?: string;
  raw?: unknown;
}

export interface SceneManifest {
  id: string;
  name: string;
  assets: SceneAssetNode[];
  raw?: unknown;
}

export interface SceneSummary {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  raw?: unknown;
}

export interface AssetSummary {
  id: string;
  name: string;
  tag?: string;
  category?: string;
  status?: string;
  raw?: unknown;
}

export interface AssetDetail extends AssetSummary {
  description?: string;
  location?: string;
  model?: string;
  serial?: string;
  metadata?: Record<string, unknown>;
}

export interface AlarmSummary {
  id: string;
  title: string;
  severity?: string;
  status?: string;
  assetId?: string;
  raisedAt?: string;
  raw?: unknown;
}

export interface MetricPoint {
  timestamp: string;
  value: number | null;
  unit?: string;
  raw?: unknown;
}

export interface LatestMetricsResponse {
  metrics: Record<string, number | string | boolean | null>;
  raw?: unknown;
}

export interface TimeseriesResponse {
  series: MetricPoint[];
  raw?: unknown;
}

export interface Viewpoint {
  id: string;
  name: string;
  position: [number, number, number];
  target?: [number, number, number];
  category?: string;
  raw?: unknown;
}

export interface AlarmEvent {
  id: string;
  occurredAt: string;
  actorId: string | null;
  eventType: string;
  payload: unknown;
  raw?: unknown;
}

export interface NearestCamera {
  cameraId: string;
  name: string;
  streamUrl: string;
  coveragePct: number;
  priority: number;
  raw?: unknown;
}

export interface SopDocument {
  id: string;
  code: string;
  title: string;
  summary: string | null;
  raw?: unknown;
}

export interface SopStep {
  stepNumber: number;
  instruction: string;
  expectedOutcome: string | null;
  requiresRole: string | null;
  estimatedMinutes: number | null;
  raw?: unknown;
}

export interface SopResponse {
  sop: SopDocument;
  steps: SopStep[];
  raw?: unknown;
}
