import { useEffect } from 'react';

import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { displayText } from '../../lib/display';
import { useScenesQuery } from './queries';
import { useViewerStore } from './viewerStore';

export function SceneSelector() {
  const { data = [], isLoading, isError, error, refetch } = useScenesQuery();
  const selectedSceneId = useViewerStore((state) => state.selectedSceneId);
  const selectScene = useViewerStore((state) => state.selectScene);

  useEffect(() => {
    const firstScene = data[0];
    if (!selectedSceneId && firstScene) selectScene(firstScene.id);
  }, [data, selectedSceneId, selectScene]);

  if (isLoading) return <LoadingState label="Loading scenes" />;
  if (isError) return <ErrorState title="Scenes unavailable" message={error instanceof Error ? error.message : 'Unable to load scenes.'} onRetry={() => void refetch()} />;
  if (data.length === 0) return <EmptyState title="No scenes" message="No scene records were returned by the backend." />;

  return (
    <label className="block text-sm text-text-secondary">
      Scene
      <select
        className="mt-2 w-full rounded-md border border-border-subtle bg-bg-elevated px-3 py-2 text-text-primary"
        value={selectedSceneId ?? ''}
        onChange={(event) => selectScene(event.target.value || null)}
      >
        {data.map((scene) => <option key={scene.id} value={scene.id}>{displayText(scene.name, scene.id)}</option>)}
      </select>
    </label>
  );
}
