import { useMemo, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { AssetSummary } from '../../lib/api/types';
import { displayText } from '../../lib/display';
import { useAssetsQuery } from '../twin/queries';
import { useViewerStore } from '../twin/viewerStore';

type AssetSearchProps = { onSelect?: (asset: AssetSummary) => void; compact?: boolean };

export function AssetSearch({ onSelect, compact }: AssetSearchProps) {
  const [query, setQuery] = useState('');
  const selectAsset = useViewerStore((state) => state.selectAsset);
  const { data = [], isLoading, isError, error, refetch } = useAssetsQuery();
  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return data;
    return data.filter((asset) => [asset.name, asset.tag, asset.category].some((value) => displayText(value, '').toLowerCase().includes(needle)));
  }, [data, query]);

  if (isLoading) return <LoadingState label="Loading assets" />;
  if (isError) return <ErrorState title="Assets unavailable" message={error instanceof Error ? error.message : 'Unable to load assets.'} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-md border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search tag, name, category"
        aria-label="Search assets"
      />
      {filtered.length === 0 ? (
        <EmptyState title="No matching assets" message="Try a different tag, name, or category." />
      ) : (
        <div className={compact ? 'max-h-72 space-y-2 overflow-auto' : 'space-y-2'}>
          {filtered.map((asset) => (
            <Button key={asset.id} className="w-full justify-between text-left" variant="ghost" onClick={() => { selectAsset(asset.id); onSelect?.(asset); }}>
              <span>
                <span className="block text-text-primary">{displayText(asset.tag ?? asset.name, asset.id)}</span>
                <span className="block text-xs text-text-secondary">{displayText(asset.name)} · {displayText(asset.category)}</span>
              </span>
              <StatusBadge status={asset.status} />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
