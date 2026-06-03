import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Panel } from '../../components/ui/Panel';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useCapacitySummaryQuery } from './queries';

function capacityColor(used: number, total: number): 'success' | 'warning' | 'critical' | 'primary' {
  if (total <= 0) return 'primary';
  const pct = used / total;
  if (pct >= 0.9) return 'critical';
  if (pct >= 0.75) return 'warning';
  return 'success';
}

export function CapacitySummarySection() {
  const cap = useCapacitySummaryQuery();

  if (cap.isLoading) return <Panel title="Capacity Summary" subtitle="Power, cooling & space utilization"><LoadingState label="Loading capacity data" /></Panel>;
  if (cap.isError) return <Panel title="Capacity Summary" subtitle="Power, cooling & space utilization"><ErrorState title="Capacity data unavailable" message={cap.error instanceof Error ? cap.error.message : 'Unable to load capacity summary.'} onRetry={() => void cap.refetch()} /></Panel>;
  if (!cap.data) return <Panel title="Capacity Summary" subtitle="Power, cooling & space utilization"><EmptyState title="No capacity data" message="Capacity summary is not available." /></Panel>;

  const { power, cooling, space } = cap.data;

  return <Panel title="Capacity Summary" subtitle="Power, cooling & space utilization">
    <div className="space-y-4">
      <ProgressBar value={power.used} max={power.total} label="Power" unit={power.unit} color={capacityColor(power.used, power.total)} />
      <ProgressBar value={cooling.used} max={cooling.total} label="Cooling" unit={cooling.unit} color={capacityColor(cooling.used, cooling.total)} />
      <ProgressBar value={space.used} max={space.total} label="Space" unit={space.unit} color={capacityColor(space.used, space.total)} />
    </div>
  </Panel>;
}
