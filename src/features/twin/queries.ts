import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../../lib/api/client';
import {
  normalizeAssetDetail,
  normalizeAssetSummary,
  normalizeFacilityNode,
  normalizeList,
  normalizeSceneManifest,
  normalizeSceneSummary,
  normalizeViewpoint,
} from '../../lib/api/normalizers';
import type { AssetDetail, AssetSummary, FacilityNode, SceneManifest, SceneSummary, Viewpoint } from '../../lib/api/types';

function unwrapData(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'data' in value) return (value as Record<string, unknown>).data;
  return value;
}

export function useFacilityTreeQuery() {
  return useQuery<FacilityNode[]>({
    queryKey: ['facility', 'tree'],
    queryFn: async () => normalizeList(await apiRequest<unknown>('/facility/tree')).map(normalizeFacilityNode),
  });
}

export function useScenesQuery() {
  return useQuery<SceneSummary[]>({
    queryKey: ['scenes'],
    queryFn: async () => normalizeList(await apiRequest<unknown>('/scenes')).map(normalizeSceneSummary),
  });
}

export function useSceneManifestQuery(sceneId: string | null | undefined) {
  return useQuery<SceneManifest>({
    queryKey: ['scenes', sceneId, 'manifest'],
    queryFn: async () => normalizeSceneManifest(unwrapData(await apiRequest<unknown>(`/scenes/${sceneId}/manifest`))),
    enabled: Boolean(sceneId),
  });
}

export function useViewpointsQuery(sceneId: string | null | undefined) {
  return useQuery<Viewpoint[]>({
    queryKey: ['viewpoints', sceneId],
    queryFn: async () => normalizeList(await apiRequest<unknown>(`/viewpoints${sceneId ? `?sceneId=${sceneId}` : ''}`)).map(normalizeViewpoint),
    enabled: true,
  });
}

export function useAssetsQuery() {
  return useQuery<AssetSummary[]>({
    queryKey: ['assets', { limit: 50 }],
    queryFn: async () => normalizeList(await apiRequest<unknown>('/assets?limit=50')).map(normalizeAssetSummary),
  });
}

export function useAssetQuery(assetId: string | null | undefined) {
  return useQuery<AssetDetail>({
    queryKey: ['assets', assetId],
    queryFn: async () => normalizeAssetDetail(unwrapData(await apiRequest<unknown>(`/assets/${assetId}`))),
    enabled: Boolean(assetId),
  });
}
