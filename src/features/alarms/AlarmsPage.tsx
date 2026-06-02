import { EmptyState } from '../../components/ui/EmptyState';
import { Panel } from '../../components/ui/Panel';

export function AlarmsPage() {
  return (
    <Panel title="Alarms" subtitle="Incident triage queue">
      <EmptyState title="No alarms connected" message="Alarm streams will appear here after backend alarm data is wired." />
    </Panel>
  );
}
