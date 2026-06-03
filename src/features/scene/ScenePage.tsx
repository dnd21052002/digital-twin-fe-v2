import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Panel } from '../../components/ui/Panel';
import { useAlarmsQuery } from '../alarms/queries';
import { useAssetsQuery, useFacilityTreeQuery, useSceneManifestQuery, useViewpointsQuery } from '../twin/queries';
import { useViewerStore } from '../twin/viewerStore';
import { SceneCanvas } from './SceneCanvas';

export function ScenePage() {
  const selectedSceneId = useViewerStore((state) => state.selectedSceneId);
  const selectedAssetId = useViewerStore((state) => state.selectedAssetId);
  const activeLayers = useViewerStore((state) => state.layers);
  const selectAsset = useViewerStore((state) => state.selectAsset);
  const selectAlarm = useViewerStore((state) => state.selectAlarm);

  const { data: manifest, isLoading: manifestLoading, isError: manifestError, error: manifestErr, refetch: refetchManifest } = useSceneManifestQuery(selectedSceneId);
  const { data: facilityTree } = useFacilityTreeQuery();
  const { data: assets = [], isLoading: assetsLoading } = useAssetsQuery();
  const { data: alarms = [] } = useAlarmsQuery();
  const { data: viewpoints } = useViewpointsQuery(selectedSceneId);

  const sceneAlarms = alarms.filter((alarm): alarm is typeof alarm & { assetId: string } => Boolean(alarm.assetId));

  const loading = manifestLoading || assetsLoading;
  const error = manifestError;

  return (
    <Panel title="3D Scene" subtitle="Digital twin workspace">
      {!selectedSceneId ? (
        <div className="flex items-center justify-center py-16 text-ink-tertiary">Select a scene from the twin controls to begin.</div>
      ) : loading ? (
        <LoadingState label="Loading scene workspace" />
      ) : error ? (
        <ErrorState title="Scene unavailable" message={manifestErr instanceof Error ? manifestErr.message : 'Unable to load scene manifest.'} onRetry={() => void refetchManifest()} />
      ) : (
        <SceneCanvas
          manifest={manifest}
          assets={assets}
          facilityTree={facilityTree}
          selectedAssetId={selectedAssetId}
          activeLayers={activeLayers}
          alarms={sceneAlarms}
          viewpoints={viewpoints}
          onAssetSelect={selectAsset}
          onAlarmClick={(alarm) => selectAlarm(alarm.id, alarm.assetId)}
        />
      )}
    </Panel>
  );
}
