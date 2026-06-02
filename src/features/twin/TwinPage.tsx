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
import { useAssetsQuery, useSceneManifestQuery } from './queries';
import { SceneSelector } from './SceneSelector';
import { useViewerStore, type ViewerLayer } from './viewerStore';

const layers: ViewerLayer[] = ['thermal', 'airflow', 'power', 'xray', 'alarm'];

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

  if (!selectedSceneId) return <EmptyState title="No scene selected" message="Choose a scene to load the digital twin workspace." />;
  if (isLoading || assetsLoading) return <LoadingState label="Loading scene workspace" />;
  if (isError) return <ErrorState title="Scene manifest unavailable" message={error instanceof Error ? error.message : 'Unable to load scene manifest.'} onRetry={() => void refetch()} />;
  if (assetsError) return <ErrorState title="Assets unavailable" message={assetsErrorValue instanceof Error ? assetsErrorValue.message : 'Unable to load assets.'} onRetry={() => void refetchAssets()} />;
  if (!manifest) return <EmptyState title="Empty scene manifest" message="The selected scene has no manifest data yet." />;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary">3D Digital Twin Workspace</p>
        <h1 className="mt-3 text-2xl font-semibold text-text-primary">{displayText(manifest.name, selectedSceneId)}</h1>
        <p className="mt-2 text-sm text-text-secondary">Procedural data-center scene from manifest positions and asset location data.</p>
      </div>
      <SceneCanvas manifest={manifest} assets={assets} selectedAssetId={selectedAssetId} activeLayers={activeLayers} onAssetSelect={selectAsset} />
    </div>
  );
}

export function TwinPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
      <Panel title="Twin controls" subtitle="Scene, facility, assets, layers" className="space-y-5">
        <SceneSelector />
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Facility</h3>
          <FacilityTree />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Assets</h3>
          <AssetSearch compact />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Layers</h3>
          <LayerToggles />
        </div>
      </Panel>
      <Panel title="3D Digital Twin Workspace" subtitle="Procedural command scene">
        <Workspace />
      </Panel>
      <Panel title="Asset inspector" subtitle="Selected asset details">
        <AssetInspector />
      </Panel>
    </div>
  );
}
