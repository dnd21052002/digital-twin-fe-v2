import { EmptyState } from '../../components/ui/EmptyState';
import { Panel } from '../../components/ui/Panel';

export function ScenePage() {
  return (
    <Panel title="Scene" subtitle="3D scene workspace">
      <EmptyState title="Scene pending" message="Scene playback and spatial context will appear here after scene data is connected." />
    </Panel>
  );
}
