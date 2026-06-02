import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TwinPage } from '../TwinPage';
import { useViewerStore } from '../viewerStore';

vi.mock('../queries', () => ({
  useSceneManifestQuery: () => ({ data: { id: 's1', name: 'Scene 1', assets: [] }, isLoading: false, isError: false, refetch: vi.fn() }),
  useAssetsQuery: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
  useScenesQuery: () => ({ data: [{ id: 's1', name: 'Scene 1' }], isLoading: false, isError: false, refetch: vi.fn() }),
  useFacilityTreeQuery: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
  useAssetQuery: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useViewpointsQuery: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
}));

vi.mock('../../alarms/queries', () => ({
  useAlarmsQuery: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
}));

vi.mock('../../telemetry/queries', () => ({
  useLatestMetricsQuery: () => ({ data: { items: [] }, isLoading: false, isError: false, refetch: vi.fn() }),
}));

vi.mock('../../scene/SceneCanvas', () => ({
  SceneCanvas: () => <div data-testid="scene-canvas" />,
}));

let currentSearch = '';

function LocationProbe() {
  const location = useLocation();
  useEffect(() => {
    currentSearch = location.search;
  }, [location.search]);
  return null;
}

function renderTwin(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/twin" element={<><LocationProbe /><TwinPage /></>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('twin deep links', () => {
  beforeEach(() => {
    currentSearch = '';
    useViewerStore.setState({
      selectedSceneId: null,
      selectedAssetId: null,
      selectedAlarmId: null,
      layers: [],
      drawer: null,
    });
  });

  it('initializes viewer store from repeated and comma-separated query layers', async () => {
    renderTwin('/twin?sceneId=s1&assetId=a1&alarmId=al1&layer=thermal,alarm&layer=thermal');

    await waitFor(() => {
      expect(useViewerStore.getState()).toMatchObject({
        selectedSceneId: 's1',
        selectedAssetId: 'a1',
        selectedAlarmId: 'al1',
        layers: ['thermal', 'alarm'],
      });
    });
  });

  it('updates the URL query when viewer store selection changes', async () => {
    renderTwin('/twin');

    useViewerStore.getState().selectScene('s1');
    useViewerStore.getState().selectAsset('a1');
    useViewerStore.getState().selectAlarm('al1');
    useViewerStore.getState().toggleLayer('thermal');
    useViewerStore.getState().toggleLayer('alarm');

    await waitFor(() => {
      expect(currentSearch).toBe('?sceneId=s1&assetId=a1&alarmId=al1&layer=thermal&layer=alarm');
    });
  });
});
