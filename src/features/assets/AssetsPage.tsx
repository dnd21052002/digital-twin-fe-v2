import { EmptyState } from '../../components/ui/EmptyState';
import { Panel } from '../../components/ui/Panel';

export function AssetsPage() {
  return (
    <Panel title="Assets" subtitle="Asset registry">
      <EmptyState title="No assets connected" message="Asset list and health summaries will appear here when registry data is available." />
    </Panel>
  );
}
