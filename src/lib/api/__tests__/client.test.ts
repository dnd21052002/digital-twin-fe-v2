import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuth, setTokens } from '../../../features/auth/authStorage';
import { apiRequest } from '../client';

describe('apiRequest', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('refreshes once on 401 then retries the protected request with the new token', async () => {
    setTokens({ accessToken: 'old-token', refreshToken: 'refresh-token' });
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/assets') && fetchMock.mock.calls.length === 1) {
        expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer old-token');
        return new Response(JSON.stringify({ message: 'expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.endsWith('/auth/refresh')) {
        expect(init?.body).toBe(JSON.stringify({ refreshToken: 'refresh-token' }));
        return new Response(JSON.stringify({ data: { access_token: 'new-token' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.endsWith('/assets')) {
        expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer new-token');
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`unexpected url ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest<{ ok: boolean }>('/assets')).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('throws ApiError with parsed error body and message for non-ok JSON responses', async () => {
    clearAuth();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ error: 'No access', detail: 'missing role' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(apiRequest('/alarms', { auth: false })).rejects.toMatchObject({
      status: 403,
      message: 'No access',
      body: { error: 'No access', detail: 'missing role' },
    });
  });
});
