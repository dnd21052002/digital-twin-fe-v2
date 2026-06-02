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
    <div className="space-y-3">
      <input
        className="w-full rounded-xl border border-white/[0.08] bg-bg-elevated px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-[color:var(--border-accent)] focus:ring-2 focus:ring-primary/20"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search tag, name, category"
        aria-label="Search assets"
      />
      {filtered.length === 0 ? (
        <EmptyState title="No matching assets" message="Try a different tag, name, or category." />
      ) : (
        <div className={compact ? 'max-h-[19rem] space-y-1.5 overflow-auto pr-1' : 'space-y-2'}>
          {filtered.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent bg-white/[0.02] px-3 py-2.5 text-left transition hover:border-white/[0.08] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => { selectAsset(asset.id); onSelect?.(asset); }}
            >
              <span className="min-w-0">
                <span className="block truncate font-mono text-xs font-semibold text-text-primary">{displayText(asset.tag ?? asset.name, asset.id)}</span>
                <span className="mt-0.5 block truncate text-xs text-text-secondary">{displayText(asset.name)} · {displayText(asset.category)}</span>
              </span>
              <StatusBadge status={asset.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
