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

function thresholdStatus(metric: LatestMetric): { label: string; color: string } | undefined {
  const t = metric.thresholds;
  const v = typeof metric.value === 'number' ? metric.value : undefined;
  if (v === undefined || !t) return undefined;
  if (t.critHigh !== undefined && v > t.critHigh) return { label: `> ${t.critHigh} ${metric.unit ?? ''}`, color: 'text-critical' };
  if (t.critLow !== undefined && v < t.critLow) return { label: `< ${t.critLow} ${metric.unit ?? ''}`, color: 'text-critical' };
  if (t.warnHigh !== undefined && v > t.warnHigh) return { label: `> ${t.warnHigh} ${metric.unit ?? ''}`, color: 'text-warning' };
  if (t.warnLow !== undefined && v < t.warnLow) return { label: `< ${t.warnLow} ${metric.unit ?? ''}`, color: 'text-warning' };
  return undefined;
}

export function LatestMetricCards({ metrics, selectedMetricKey, onSelectMetric }: { metrics: LatestMetric[]; selectedMetricKey?: string | null; onSelectMetric?: (key: string) => void }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{metrics.map((metric) => {
    const thresholdStat = thresholdStatus(metric);
    const qualityText = `Quality: ${qualityLabel(metric.quality)}`;
    return (<button key={metric.key} type="button" className={`text-left rounded-lg transition-shadow ${selectedMetricKey === metric.key ? 'ring-2 ring-primary ring-offset-2 ring-offset-canvas' : ''}`} onClick={() => onSelectMetric?.(metric.key)} aria-pressed={selectedMetricKey === metric.key}>
      <MetricCard label={metric.name} value={metric.value} {...(metric.unit ? { unit: metric.unit } : {})} quality={qualityText} timestamp={formatTime(metric.timestamp)} />
      {thresholdStat && <p className={`mt-1 px-4 text-caption ${thresholdStat.color}`}>⚠ {thresholdStat.label}</p>}
    </button>);
  })}</div>;
}
