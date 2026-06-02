import { EmptyState } from '../../components/ui/EmptyState';
import { Panel } from '../../components/ui/Panel';

export function TwinPage() {
  return (
    <Panel title="Twin workspace" subtitle="Primary operations view">
      <EmptyState title="Command workspace pending" message="Twin command workspace awaiting core data, model health, and operator workflows." />
    </Panel>
  );
}
