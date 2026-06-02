import { EmptyState } from '../../components/ui/EmptyState';
import { Panel } from '../../components/ui/Panel';

export function AssetDetailPage() {
  return (
    <Panel title="Asset detail" subtitle="Selected asset workspace">
      <EmptyState title="Asset detail pending" message="Asset command history, health, and relationships will appear here after registry data is available." />
    </Panel>
  );
}
