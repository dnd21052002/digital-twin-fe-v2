import { Link, useParams } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayText } from '../../lib/display';
import { useAssetQuery } from '../twin/queries';

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
      <dt className="text-xs uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text-primary">{displayText(value)}</dd>
    </div>
  );
}

export function AssetDetailPage() {
  const { assetId } = useParams();
  const { data: asset, isLoading, isError, error, refetch } = useAssetQuery(assetId);

  return (
    <Panel
      title="Asset detail"
      subtitle={assetId ? `Asset ${assetId}` : 'Selected asset workspace'}
      actions={assetId ? <Link to={`/twin?assetId=${encodeURIComponent(assetId)}`}><Button>Open in twin</Button></Link> : null}
    >
      {!assetId ? <EmptyState title="No asset selected" message="Open an asset from the registry." /> : null}
      {assetId && isLoading ? <LoadingState label="Loading asset" /> : null}
      {assetId && isError ? <ErrorState title="Asset unavailable" message={error instanceof Error ? error.message : 'Unable to load asset.'} onRetry={() => void refetch()} /> : null}
      {assetId && !isLoading && !isError && !asset ? <EmptyState title="Asset not found" message="The backend returned no detail record." /> : null}
      {asset ? (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{displayText(asset.name, asset.id)}</h1>
            <p className="mt-1 text-text-secondary">{displayText(asset.tag, asset.id)}</p>
            <div className="mt-3"><StatusBadge status={asset.status} /></div>
          </div>
          <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Category" value={asset.category} />
            <Field label="Status" value={asset.status} />
            <Field label="Location" value={asset.location} />
            <Field label="Model" value={asset.model} />
            <Field label="Serial" value={asset.serial} />
            <Field label="Description" value={asset.description} />
          </dl>
        </div>
      ) : null}
    </Panel>
  );
}
