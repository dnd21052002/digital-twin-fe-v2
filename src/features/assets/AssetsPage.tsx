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
  const { data = [], isLoading, isError, error, refetch } = useAssetsQuery();

  return (
    <div className="space-y-5">
      <Panel title="Asset search" subtitle="Search by tag, name, category">
        <AssetSearch />
      </Panel>
      <Panel title="Assets" subtitle="Asset registry">
        {isLoading ? <LoadingState label="Loading assets" /> : null}
        {isError ? <ErrorState title="Assets unavailable" message={error instanceof Error ? error.message : 'Unable to load assets.'} onRetry={() => void refetch()} /> : null}
        {!isLoading && !isError && data.length === 0 ? <EmptyState title="No assets connected" message="Asset list and health summaries will appear here when registry data is available." /> : null}
        {!isLoading && !isError && data.length > 0 ? (
          <DataTable<AssetSummary & Record<string, unknown>>
            rows={data as Array<AssetSummary & Record<string, unknown>>}
            getRowKey={(asset) => asset.id}
            columns={[
              { key: 'tag', header: 'Tag', accessor: 'tag', render: (value, row) => <Link className="text-primary hover:underline" to={`/assets/${row.id}`}>{displayText(value, row.id)}</Link> },
              { key: 'name', header: 'Name', accessor: 'name' },
              { key: 'category', header: 'Category', accessor: 'category' },
              { key: 'status', header: 'Status', accessor: 'status', render: (value) => <StatusBadge status={value} /> },
            ]}
          />
        ) : null}
      </Panel>
    </div>
  );
}
