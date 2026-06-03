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
    <div className="rounded-md border border-hairline bg-surface-2 p-3">
      <dt className="text-caption text-ink-tertiary">{label}</dt>
      <dd className="mt-1 font-mono text-body-sm font-medium text-ink">{displayText(value)}</dd>
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
      <div className="rounded-lg border border-hairline bg-surface-2 p-4">
        <p className="text-eyebrow text-primary">Selected Asset</p>
        <h3 className="mt-2 text-card-title font-medium text-ink">{displayText(asset.name, asset.id)}</h3>
        <p className="mt-1 font-mono text-body-sm text-ink-muted">{displayText(asset.tag, asset.id)}</p>
        <div className="mt-3"><StatusBadge status={asset.status} /></div>
      </div>
      <dl className="grid gap-2">
        <Field label="Category" value={asset.category} />
        <Field label="Status" value={asset.status} />
        <Field label="Location" value={asset.location} />
        <Field label="Model" value={asset.model} />
        <Field label="Serial" value={asset.serial} />
      </dl>
      <section className="rounded-lg border border-hairline bg-surface-1 p-4" aria-label="Latest telemetry summary">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-body-sm font-medium text-ink">Latest Telemetry</h4>
          <a className="text-caption font-medium text-primary hover:text-primary-hover transition-colors" href="/telemetry">Open trend</a>
        </div>
        {latestMetrics.isLoading ? <LoadingState label="Loading telemetry summary" /> : latestMetrics.isError ? <ErrorState title="Telemetry unavailable" message={latestMetrics.error instanceof Error ? latestMetrics.error.message : 'Unable to load telemetry.'} onRetry={() => void latestMetrics.refetch()} /> : (latestMetrics.data?.items ?? []).length === 0 ? <EmptyState title="No telemetry metrics" message="No latest metrics returned for this asset." /> : <LatestMetricCards metrics={(latestMetrics.data?.items ?? []).slice(0, 2)} />}
      </section>
      <RelatedAlarms assetId={asset.id} />
    </div>
  );
}
