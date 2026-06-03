import type { TelemetryRange } from './queries';

const RANGES: Array<{ id: TelemetryRange; label: string; aria: string }> = [
  { id: '1h', label: '1h', aria: 'Show 1 hour telemetry trend' },
  { id: '6h', label: '6h', aria: 'Show 6 hour telemetry trend' },
  { id: '24h', label: '24h', aria: 'Show 24 hour telemetry trend' },
];
export function MetricRangeTabs({ range, onChange }: { range: TelemetryRange; onChange: (range: TelemetryRange) => void }) {
  return <div role="group" aria-label="Telemetry range" className="flex gap-1">{RANGES.map((item) => (
    <button
      key={item.id}
      type="button"
      className={`rounded-md px-2.5 py-1 text-caption font-medium transition-colors ${range === item.id ? 'bg-primary text-on-primary' : 'border border-hairline bg-surface-2 text-ink-subtle hover:text-ink-muted'}`}
      aria-pressed={range === item.id}
      aria-label={item.aria}
      onClick={() => onChange(item.id)}
    >{item.label}</button>
  ))}</div>;
}
