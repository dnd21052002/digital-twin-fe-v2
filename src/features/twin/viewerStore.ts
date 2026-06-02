import { create } from 'zustand';

export type ViewerLayer = 'thermal' | 'airflow' | 'power' | 'xray' | 'alarm';
export type ViewerDrawer = 'alarms' | 'telemetry' | 'assets' | 'layers';

export type ViewerState = {
  selectedSceneId: string | null;
  selectedAssetId: string | null;
  selectedAlarmId: string | null;
  layers: ViewerLayer[];
  drawer: ViewerDrawer | null;
  selectScene: (id: string | null) => void;
  selectAsset: (id: string | null) => void;
  selectAlarm: (alarmId: string | null, assetId?: string | null) => void;
  toggleLayer: (layer: ViewerLayer) => void;
  openDrawer: (drawer: ViewerDrawer) => void;
  closeDrawer: () => void;
};

export const useViewerStore = create<ViewerState>((set) => ({
  selectedSceneId: null,
  selectedAssetId: null,
  selectedAlarmId: null,
  layers: [],
  drawer: null,
  selectScene: (selectedSceneId) => set({ selectedSceneId }),
  selectAsset: (selectedAssetId) => set({ selectedAssetId }),
  selectAlarm: (selectedAlarmId, selectedAssetId) =>
    set((state) => ({
      selectedAlarmId,
      selectedAssetId: selectedAssetId === undefined ? state.selectedAssetId : selectedAssetId,
    })),
  toggleLayer: (layer) =>
    set((state) => ({
      layers: state.layers.includes(layer) ? state.layers.filter((item) => item !== layer) : [...state.layers, layer],
    })),
  openDrawer: (drawer) => set({ drawer }),
  closeDrawer: () => set({ drawer: null }),
}));
