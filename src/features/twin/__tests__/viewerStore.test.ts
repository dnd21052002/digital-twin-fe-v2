import { beforeEach, describe, expect, it } from 'vitest';

import { useViewerStore } from '../viewerStore';

describe('viewerStore', () => {
  beforeEach(() => {
    useViewerStore.setState({
      selectedSceneId: null,
      selectedAssetId: null,
      selectedAlarmId: null,
      layers: [],
      drawer: null,
    });
  });

  it('selectAlarm sets selected alarm and optional asset', () => {
    useViewerStore.getState().selectAlarm('alarm-1', 'asset-2');

    expect(useViewerStore.getState().selectedAlarmId).toBe('alarm-1');
    expect(useViewerStore.getState().selectedAssetId).toBe('asset-2');
  });

  it('toggleLayer adds then removes a layer', () => {
    useViewerStore.getState().toggleLayer('thermal');

    expect(useViewerStore.getState().layers).toEqual(['thermal']);

    useViewerStore.getState().toggleLayer('thermal');

    expect(useViewerStore.getState().layers).toEqual([]);
  });
});
