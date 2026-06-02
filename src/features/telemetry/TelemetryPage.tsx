import { EmptyState } from '../../components/ui/EmptyState';
import { Panel } from '../../components/ui/Panel';

export function TelemetryPage() {
  return (
    <Panel title="Telemetry" subtitle="Live signal overview">
      <EmptyState title="No telemetry connected" message="Telemetry charts and sensor summaries will appear here after core data integration." />
    </Panel>
  );
}
