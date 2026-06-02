import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { displayText } from '../../lib/display';
import { AssetSearch } from '../assets/AssetSearch';
import { AssetInspector } from './AssetInspector';
import { FacilityTree } from './FacilityTree';
import { useSceneManifestQuery } from './queries';
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
  const { data: manifest, isLoading, isError, error, refetch } = useSceneManifestQuery(selectedSceneId);

  if (!selectedSceneId) return <EmptyState title="No scene selected" message="Choose a scene to load the digital twin workspace." />;
  if (isLoading) return <LoadingState label="Loading scene manifest" />;
  if (isError) return <ErrorState title="Scene manifest unavailable" message={error instanceof Error ? error.message : 'Unable to load scene manifest.'} onRetry={() => void refetch()} />;
  if (!manifest || manifest.assets.length === 0) return <EmptyState title="Empty scene manifest" message="The selected scene has no manifest assets yet." />;

  return (
    <div className="min-h-[480px] rounded-xl border border-border-subtle bg-bg-surface p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">3D Digital Twin Workspace</p>
      <h1 className="mt-3 text-2xl font-semibold text-text-primary">{displayText(manifest.name, selectedSceneId)}</h1>
      <p className="mt-2 text-sm text-text-secondary">Task 6 will render the 3D scene. Current manifest assets: {manifest.assets.length}.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border-subtle bg-bg-panel p-4">
          <p className="text-xs text-text-muted">Selected scene</p>
          <p className="mt-1 font-medium text-text-primary">{displayText(selectedSceneId)}</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-panel p-4">
          <p className="text-xs text-text-muted">Selected asset</p>
          <p className="mt-1 font-medium text-text-primary">{displayText(selectedAssetId)}</p>
        </div>
      </div>
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
      <Panel title="3D Digital Twin Workspace" subtitle="Real scene manifest data, placeholder renderer">
        <Workspace />
      </Panel>
      <Panel title="Asset inspector" subtitle="Selected asset details">
        <AssetInspector />
      </Panel>
    </div>
  );
}
