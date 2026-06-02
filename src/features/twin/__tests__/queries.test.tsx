import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAssetQuery, useAssetsQuery, useFacilityTreeQuery, useSceneManifestQuery, useScenesQuery } from '../queries';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('twin queries', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      const payloads: Record<string, unknown> = {
        '/api/v1/facility/tree': { data: { items: [{ id: 'site-1', title: 'Site', category: { name: 'Campus' }, children: [{ assetId: 'asset-1', name: 'Pump' }] }] } },
        '/api/v1/scenes': { items: [{ scene_id: 'scene-1', title: 'Main Scene' }] },
        '/api/v1/scenes/scene-1/manifest': { scene: { id: 'scene-1', title: 'Main' }, assets: [{ asset_id: 'mesh-1', src: '/mesh.glb', category: 'Model' }] },
        '/api/v1/assets': { data: { items: [{ asset_id: 'asset-1', title: 'Pump', category: { label: 'HVAC' }, state: 'online', tag: 'P-100' }] } },
        '/api/v1/assets/asset-1': { data: { id: 'asset-1', name: 'Pump', category: { name: 'HVAC' }, status: { name: 'Online' }, location: { name: 'North Plant' }, model: 'M1', serial: 'S1', tag: 'P-100' } },
      };
      return new Response(JSON.stringify(payloads[path]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('fetches facility tree from /facility/tree and normalizes nested data', async () => {
    const { result } = renderHook(() => useFacilityTreeQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/facility/tree', expect.any(Object));
    expect(result.current.data?.[0]).toMatchObject({ id: 'site-1', name: 'Site', category: 'campus' });
    expect(result.current.data?.[0]?.children?.[0]).toMatchObject({ id: 'asset-1', name: 'Pump' });
  });

  it('fetches scenes and manifest only when scene id exists', async () => {
    const scenes = renderHook(() => useScenesQuery(), { wrapper });
    const skipped = renderHook(() => useSceneManifestQuery(null), { wrapper });

    await waitFor(() => expect(scenes.result.current.isSuccess).toBe(true));

    expect(scenes.result.current.data?.[0]).toMatchObject({ id: 'scene-1', name: 'Main Scene' });
    expect(skipped.result.current.fetchStatus).toBe('idle');

    const manifest = renderHook(() => useSceneManifestQuery('scene-1'), { wrapper });
    await waitFor(() => expect(manifest.result.current.isSuccess).toBe(true));
    expect(manifest.result.current.data?.assets[0]).toMatchObject({ id: 'mesh-1', url: '/mesh.glb', category: 'model' });
  });

  it('fetches assets with limit and normalizes asset detail display fields safely', async () => {
    const assets = renderHook(() => useAssetsQuery(), { wrapper });
    const asset = renderHook(() => useAssetQuery('asset-1'), { wrapper });

    await waitFor(() => expect(assets.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(asset.result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/assets?limit=50', expect.any(Object));
    expect(assets.result.current.data?.[0]).toMatchObject({ id: 'asset-1', name: 'Pump', category: 'hvac', status: 'online', tag: 'P-100' });
    expect(asset.result.current.data).toMatchObject({ id: 'asset-1', category: 'hvac', status: 'Online', location: 'North Plant', model: 'M1', serial: 'S1', tag: 'P-100' });
  });
});
