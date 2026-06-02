import { MetricCard } from '../../components/ui/MetricCard';
import type { LatestMetric } from './queries';

function qualityLabel(quality: LatestMetric['quality']) {
  if (quality === 0 || String(quality).toLowerCase() === 'good') return 'Good';
  if (quality === 1 || String(quality).toLowerCase() === 'warning') return 'Warning';
  if (quality === undefined || quality === null || quality === '') return 'Unknown';
  return Number(quality) >= 2 || String(quality).toLowerCase() === 'critical' ? 'Critical' : 'Unknown';
}
function formatTime(value?: string) {
  if (!value) return 'No timestamp';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
export function LatestMetricCards({ metrics, selectedMetricKey, onSelectMetric }: { metrics: LatestMetric[]; selectedMetricKey?: string | null; onSelectMetric?: (key: string) => void }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{metrics.map((metric) => (
    <button key={metric.key} type="button" className={`text-left ${selectedMetricKey === metric.key ? 'rounded-xl ring-2 ring-primary' : ''}`} onClick={() => onSelectMetric?.(metric.key)} aria-pressed={selectedMetricKey === metric.key}>
      <MetricCard label={metric.name} value={metric.value} {...(metric.unit ? { unit: metric.unit } : {})} quality={`Quality: ${qualityLabel(metric.quality)}`} timestamp={formatTime(metric.timestamp)} />
    </button>
  ))}</div>;
}
