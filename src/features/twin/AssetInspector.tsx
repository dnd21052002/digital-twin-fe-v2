import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayText } from '../../lib/display';
import { useAssetQuery } from './queries';
import { RelatedAlarms } from '../alarms/RelatedAlarms';
import { LatestMetricCards } from '../telemetry/LatestMetricCards';
import { useLatestMetricsQuery } from '../telemetry/queries';
import { useViewerStore } from './viewerStore';

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-3">
      <dt className="text-xs uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text-primary">{displayText(value)}</dd>
    </div>
  );
}

export function AssetInspector() {
  const selectedAssetId = useViewerStore((state) => state.selectedAssetId);
  const { data: asset, isLoading, isError, error, refetch } = useAssetQuery(selectedAssetId);
  const latestMetrics = useLatestMetricsQuery(selectedAssetId);

  if (!selectedAssetId) return <EmptyState title="No asset selected" message="Select an asset from search or facility hierarchy." />;
  if (isLoading) return <LoadingState label="Loading asset" />;
  if (isError) return <ErrorState title="Asset unavailable" message={error instanceof Error ? error.message : 'Unable to load asset.'} onRetry={() => void refetch()} />;
  if (!asset) return <EmptyState title="Asset not found" message="The selected asset did not return detail data." />;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{displayText(asset.name, asset.id)}</h3>
        <p className="text-sm text-text-secondary">{displayText(asset.tag, asset.id)}</p>
        <div className="mt-2"><StatusBadge status={asset.status} /></div>
      </div>
      <dl className="grid gap-3">
        <Field label="Category" value={asset.category} />
        <Field label="Status" value={asset.status} />
        <Field label="Location" value={asset.location} />
        <Field label="Model" value={asset.model} />
        <Field label="Serial" value={asset.serial} />
      </dl>
      <section className="rounded-xl border border-border-subtle bg-bg-surface p-3" aria-label="Latest telemetry summary">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-text-primary">Latest telemetry</h4>
          <a className="text-xs font-semibold text-primary hover:underline" href="/telemetry">Open trend</a>
        </div>
        {latestMetrics.isLoading ? <LoadingState label="Loading telemetry summary" /> : latestMetrics.isError ? <ErrorState title="Telemetry unavailable" message={latestMetrics.error instanceof Error ? latestMetrics.error.message : 'Unable to load telemetry.'} onRetry={() => void latestMetrics.refetch()} /> : (latestMetrics.data?.items ?? []).length === 0 ? <EmptyState title="No telemetry metrics" message="No latest metrics returned for this asset." /> : <LatestMetricCards metrics={(latestMetrics.data?.items ?? []).slice(0, 2)} />}
      </section>
      <RelatedAlarms assetId={asset.id} />
    </div>
  );
}
