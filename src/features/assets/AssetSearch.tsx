import { useMemo, useState } from 'react';

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
    <div className="space-y-2">
      <input
        className="w-full rounded-md border border-hairline bg-surface-2 px-3 py-2 text-body-sm text-ink outline-none placeholder:text-ink-tertiary focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search tag, name, category"
        aria-label="Search assets"
      />
      {filtered.length === 0 ? (
        <EmptyState title="No matching assets" message="Try a different tag, name, or category." />
      ) : (
        <div className={compact ? 'max-h-[19rem] space-y-0.5 overflow-auto' : 'space-y-1'}>
          {filtered.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
              onClick={() => { selectAsset(asset.id); onSelect?.(asset); }}
            >
              <span className="min-w-0">
                <span className="block truncate font-mono text-caption font-medium text-ink">{displayText(asset.tag ?? asset.name, asset.id)}</span>
                <span className="mt-0.5 block truncate text-caption text-ink-subtle">{displayText(asset.name)} · {displayText(asset.category)}</span>
              </span>
              <StatusBadge status={asset.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
