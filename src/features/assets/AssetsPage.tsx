import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Panel } from '../../components/ui/Panel';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { AssetSummary } from '../../lib/api/types';
import { displayText } from '../../lib/display';
import { AssetSearch } from './AssetSearch';
import { useAssetsQuery } from '../twin/queries';

export function AssetsPage() {
  const [filter, setFilter] = useState('');
  const { data = [], isLoading, isError, error, refetch } = useAssetsQuery();
  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((asset) => [asset.tag, asset.name, asset.category, asset.status].some((value) => displayText(value, '').toLowerCase().includes(needle)));
  }, [data, filter]);

  return (
    <div className="space-y-5">
      <Panel title="Asset search" subtitle="Search by tag, name, category">
        <AssetSearch />
      </Panel>
      <Panel title="Assets" subtitle="Asset registry">
        <div className="mb-4">
          <input
            className="w-full rounded-md border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter by tag, name, category, status"
            aria-label="Filter assets"
          />
        </div>
        {isLoading ? <LoadingState label="Loading assets" /> : null}
        {isError ? <ErrorState title="Assets unavailable" message={error instanceof Error ? error.message : 'Unable to load assets.'} onRetry={() => void refetch()} /> : null}
        {!isLoading && !isError && data.length === 0 ? <EmptyState title="No assets connected" message="Asset list and health summaries will appear here when registry data is available." /> : null}
        {!isLoading && !isError && data.length > 0 ? (
          <DataTable<AssetSummary & Record<string, unknown>>
            rows={filtered as Array<AssetSummary & Record<string, unknown>>}
            getRowKey={(asset) => asset.id}
            columns={[
              { key: 'tag', header: 'Tag', accessor: 'tag', render: (value, row) => <Link className="text-primary hover:underline" to={`/assets/${row.id}`}>{displayText(value, row.id)}</Link> },
              { key: 'name', header: 'Name', accessor: 'name' },
              { key: 'category', header: 'Category', accessor: 'category' },
              { key: 'status', header: 'Status', accessor: 'status', render: (value) => <StatusBadge status={value} /> },
              { key: 'twin', header: 'Twin', accessor: 'id', render: (value) => <Link className="text-primary hover:underline" to={`/twin?assetId=${encodeURIComponent(String(value))}`}>Open in Twin</Link> },
            ]}
          />
        ) : null}
      </Panel>
    </div>
  );
}
