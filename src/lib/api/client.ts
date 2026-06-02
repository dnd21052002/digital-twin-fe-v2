import { getAccessToken, getRefreshToken, setTokens } from '../../features/auth/authStorage';
import { normalizeAuthTokens } from './normalizers';

const DEFAULT_BASE_URL = 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  auth?: boolean;
  body?: unknown;
  headers?: Record<string, string>;
}

function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiBaseUrl().replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) return response.json();
  return response.text();
}

function errorMessage(status: number, body: unknown): string {
  if (typeof body === 'string' && body.trim()) return body;
  if (typeof body === 'object' && body !== null) {
    const record = body as Record<string, unknown>;
    for (const key of ['message', 'error', 'detail']) {
      if (typeof record[key] === 'string' && record[key].trim()) return record[key];
    }
  }
  return `Request failed with status ${status}`;
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const body = await parseResponse(response);
  if (!response.ok) return false;
  const tokens = normalizeAuthTokens(body);
  if (!tokens.accessToken) return false;
  setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken ?? refreshToken });
  return true;
}

async function request<T>(path: string, options: ApiRequestOptions = {}, retried = false): Promise<T> {
  const { auth = true, body, headers = {}, ...init } = options;
  const requestHeaders: Record<string, string> = { Accept: 'application/json', ...headers };
  const hasBody = body !== undefined;
  if (hasBody && !requestHeaders['Content-Type']) requestHeaders['Content-Type'] = 'application/json';
  const accessToken = getAccessToken();
  if (auth !== false && accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`;

  const fetchInit: RequestInit = { ...init, headers: requestHeaders };
  if (hasBody) fetchInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  const response = await fetch(buildUrl(path), fetchInit);
  const parsed = await parseResponse(response);

  if (response.status === 401 && auth !== false && !retried && getRefreshToken()) {
    const refreshed = await refreshTokens();
    if (refreshed) return request<T>(path, options, true);
  }

  if (!response.ok) throw new ApiError(response.status, errorMessage(response.status, parsed), parsed);
  return parsed as T;
}

export function apiRequest<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return request<T>(path, options);
}
