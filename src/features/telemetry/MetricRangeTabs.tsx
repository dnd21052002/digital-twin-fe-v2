import { Button } from '../../components/ui/Button';
import type { TelemetryRange } from './queries';

const RANGES: Array<{ id: TelemetryRange; label: string; aria: string }> = [
  { id: '1h', label: '1h', aria: 'Show 1 hour telemetry trend' },
  { id: '6h', label: '6h', aria: 'Show 6 hour telemetry trend' },
  { id: '24h', label: '24h', aria: 'Show 24 hour telemetry trend' },
];
export function MetricRangeTabs({ range, onChange }: { range: TelemetryRange; onChange: (range: TelemetryRange) => void }) {
  return <div role="group" aria-label="Telemetry range" className="flex gap-2">{RANGES.map((item) => <Button key={item.id} size="sm" variant={range === item.id ? 'primary' : 'secondary'} aria-pressed={range === item.id} aria-label={item.aria} onClick={() => onChange(item.id)}>{item.label}</Button>)}</div>;
}
