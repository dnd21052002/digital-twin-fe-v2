import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { displayText } from '../../lib/display';
import { SceneCanvas } from '../scene/SceneCanvas';
import { AssetSearch } from '../assets/AssetSearch';
import { AssetInspector } from './AssetInspector';
import { FacilityTree } from './FacilityTree';
import { useAlarmsQuery } from '../alarms/queries';
import { useAssetsQuery, useSceneManifestQuery } from './queries';
import { SceneSelector } from './SceneSelector';
import { useViewerStore, type ViewerLayer } from './viewerStore';

const layers: ViewerLayer[] = ['thermal', 'airflow', 'power', 'xray', 'alarm'];
const layerSet = new Set<ViewerLayer>(layers);

function parseLayers(params: URLSearchParams): ViewerLayer[] {
  const parsed = params
    .getAll('layer')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter((value): value is ViewerLayer => layerSet.has(value as ViewerLayer));
  return Array.from(new Set(parsed));
}

function buildTwinSearch(state: Pick<ReturnType<typeof useViewerStore.getState>, 'selectedSceneId' | 'selectedAssetId' | 'selectedAlarmId' | 'layers'>) {
  const params = new URLSearchParams();
  if (state.selectedSceneId) params.set('sceneId', state.selectedSceneId);
  if (state.selectedAssetId) params.set('assetId', state.selectedAssetId);
  if (state.selectedAlarmId) params.set('alarmId', state.selectedAlarmId);
  state.layers.forEach((layer) => params.append('layer', layer));
  const query = params.toString();
  return query ? `?${query}` : '';
}

function useTwinDeepLinks() {
  const location = useLocation();
  const navigate = useNavigate();
  const hydrated = useRef(false);
  const setDeepLinkState = useViewerStore((state) => state.setDeepLinkState);
  const selectedSceneId = useViewerStore((state) => state.selectedSceneId);
  const selectedAssetId = useViewerStore((state) => state.selectedAssetId);
  const selectedAlarmId = useViewerStore((state) => state.selectedAlarmId);
  const activeLayers = useViewerStore((state) => state.layers);
  const initialSearch = useRef(location.search);

  useEffect(() => {
    const params = new URLSearchParams(initialSearch.current);
    setDeepLinkState({
      selectedSceneId: params.get('sceneId'),
      selectedAssetId: params.get('assetId'),
      selectedAlarmId: params.get('alarmId'),
      layers: parseLayers(params),
    });
    hydrated.current = true;
  }, [setDeepLinkState]);

  useEffect(() => {
    if (!hydrated.current) return;
    const nextSearch = buildTwinSearch({ selectedSceneId, selectedAssetId, selectedAlarmId, layers: activeLayers });
    if (nextSearch !== location.search) navigate({ pathname: location.pathname, search: nextSearch }, { replace: true });
  }, [activeLayers, location.pathname, location.search, navigate, selectedAlarmId, selectedAssetId, selectedSceneId]);
}

function LayerToggles() {
  const active = useViewerStore((state) => state.layers);
  const toggleLayer = useViewerStore((state) => state.toggleLayer);
  return (
    <div className="flex flex-wrap gap-2">
      {layers.map((layer) => (
        <Button key={layer} size="sm" variant={active.includes(layer) ? 'primary' : 'secondary'} onClick={() => toggleLayer(layer)}>
          {layer}
        </Button>
      ))}
    </div>
  );
}

function Workspace() {
  const selectedSceneId = useViewerStore((state) => state.selectedSceneId);
  const selectedAssetId = useViewerStore((state) => state.selectedAssetId);
  const activeLayers = useViewerStore((state) => state.layers);
  const selectAsset = useViewerStore((state) => state.selectAsset);
  const { data: manifest, isLoading, isError, error, refetch } = useSceneManifestQuery(selectedSceneId);
  const { data: assets = [], isLoading: assetsLoading, isError: assetsError, error: assetsErrorValue, refetch: refetchAssets } = useAssetsQuery();
  const { data: alarms = [] } = useAlarmsQuery({ status: 'open' });
  const sceneAlarms = alarms.filter((alarm): alarm is typeof alarm & { assetId: string } => Boolean(alarm.assetId));

  if (!selectedSceneId) return <EmptyState title="3D Digital Twin Workspace" message="Choose a scene to load the digital twin workspace." />;
  if (isLoading || assetsLoading) return <LoadingState label="Loading scene workspace" />;
  if (isError) return <ErrorState title="Scene manifest unavailable" message={error instanceof Error ? error.message : 'Unable to load scene manifest.'} onRetry={() => void refetch()} />;
  if (assetsError) return <ErrorState title="Assets unavailable" message={assetsErrorValue instanceof Error ? assetsErrorValue.message : 'Unable to load assets.'} onRetry={() => void refetchAssets()} />;
  if (!manifest) return <EmptyState title="Empty scene manifest" message="The selected scene has no manifest data yet." />;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-primary">3D Digital Twin Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">{displayText(manifest.name, selectedSceneId)}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Procedural command scene generated from manifest positions, asset metadata, and fallback rack layout.</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-text-muted">Selected asset</p>
          <p className="mt-1 font-mono text-sm font-semibold text-primary">{displayText(selectedAssetId, 'None')}</p>
        </div>
      </div>
      <SceneCanvas manifest={manifest} assets={assets} selectedAssetId={selectedAssetId} activeLayers={activeLayers} alarms={sceneAlarms} onAssetSelect={selectAsset} />
    </div>
  );
}

export function TwinPage() {
  useTwinDeepLinks();
  return (
    <div className="grid gap-5 xl:grid-cols-[330px_minmax(680px,1fr)_380px]">
      <Panel title="Twin controls" subtitle="Scene, facility, assets, layers" className="space-y-5">
        <SceneSelector />
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Facility</h3>
          <FacilityTree />
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Assets</h3>
          <AssetSearch compact />
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Layers</h3>
          <LayerToggles />
        </div>
      </Panel>
      <Panel>
        <Workspace />
      </Panel>
      <Panel title="Inspector" subtitle="Selected asset context">
        <AssetInspector />
      </Panel>
    </div>
  );
}
