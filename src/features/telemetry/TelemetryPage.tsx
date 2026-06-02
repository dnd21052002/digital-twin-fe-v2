import { useState } from 'react';

import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Panel } from '../../components/ui/Panel';
import { useAlarmsQuery } from '../alarms/queries';
import { useViewerStore } from '../twin/viewerStore';
import { LatestMetricCards } from './LatestMetricCards';
import { MetricRangeTabs } from './MetricRangeTabs';
import { MetricTrendChart } from './MetricTrendChart';
import { useLatestMetricsQuery, useTimeseriesQuery, type TelemetryRange } from './queries';

export function TelemetryPage() {
  const selectedAssetId = useViewerStore((state) => state.selectedAssetId);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);
  const [range, setRange] = useState<TelemetryRange>('1h');
  const latest = useLatestMetricsQuery(selectedAssetId);
  const metrics = latest.data?.items ?? [];
  const effectiveMetricKey = metrics.some((metric) => metric.key === selectedMetricKey) ? selectedMetricKey : metrics[0]?.key ?? null;
  const trend = useTimeseriesQuery(selectedAssetId, effectiveMetricKey, range);
  const alarms = useAlarmsQuery(selectedAssetId ? { assetId: selectedAssetId } : undefined);


  if (!selectedAssetId) return <Panel title="Telemetry Center" subtitle="Selected-asset signal trends"><EmptyState title="Select an asset" message="Choose an asset from the twin viewer, facility tree, or asset search to inspect telemetry." /></Panel>;

  return <div className="space-y-5">
    <Panel title="Telemetry Center" subtitle={`Latest metrics for ${selectedAssetId}`} actions={<MetricRangeTabs range={range} onChange={setRange} />}>
      {latest.isLoading ? <LoadingState label="Loading latest metrics" /> : latest.isError ? <ErrorState title="Latest telemetry unavailable" message={latest.error instanceof Error ? latest.error.message : 'Unable to load latest metrics.'} onRetry={() => void latest.refetch()} /> : metrics.length === 0 ? <EmptyState title="No telemetry metrics" message={`No telemetry metrics were returned for ${selectedAssetId}.`} /> : <LatestMetricCards metrics={metrics} selectedMetricKey={effectiveMetricKey} onSelectMetric={setSelectedMetricKey} />}
    </Panel>
    {metrics.length > 0 && <MetricTrendChart assetId={selectedAssetId} metrics={metrics} selectedMetricKey={effectiveMetricKey} onMetricChange={setSelectedMetricKey} {...(trend.data ? { series: trend.data } : {})} isLoading={trend.isLoading} isError={trend.isError} {...(trend.error instanceof Error ? { errorMessage: trend.error.message } : {})} onRetry={() => void trend.refetch()} relatedAlarms={alarms.data ?? []} />}
  </div>;
}
