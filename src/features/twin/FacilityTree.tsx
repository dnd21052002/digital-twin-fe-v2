import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import type { FacilityNode } from '../../lib/api/types';
import { displayText } from '../../lib/display';
import { useFacilityTreeQuery } from './queries';
import { useViewerStore } from './viewerStore';

function hasAsset(node: FacilityNode) {
  return node.type === 'asset' || node.category === 'asset' || Boolean(node.raw && typeof node.raw === 'object' && ('assetId' in node.raw || 'asset_id' in node.raw));
}

function TreeNode({ node, depth = 0 }: { node: FacilityNode; depth?: number }) {
  const selectAsset = useViewerStore((state) => state.selectAsset);
  const canSelect = hasAsset(node);
  return (
    <li>
      <button
        type="button"
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-body-sm transition-colors ${canSelect ? 'text-ink hover:bg-surface-2 cursor-pointer' : 'text-ink-tertiary cursor-default'}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        disabled={!canSelect}
        onClick={() => selectAsset(node.id)}
      >
        <span className="truncate">{displayText(node.name, node.id)}</span>
        {node.category && <span className="ml-auto text-caption text-ink-tertiary">{displayText(node.category)}</span>}
      </button>
      {node.children && node.children.length > 0 && <ul className="mt-0.5">{node.children.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} />)}</ul>}
    </li>
  );
}

export function FacilityTree() {
  const { data = [], isLoading, isError, error, refetch } = useFacilityTreeQuery();
  if (isLoading) return <LoadingState label="Loading facility" />;
  if (isError) return <ErrorState title="Facility unavailable" message={error instanceof Error ? error.message : 'Unable to load facility tree.'} onRetry={() => void refetch()} />;
  if (data.length === 0) return <EmptyState title="No facility hierarchy" message="Facility tree returned no nodes." />;
  return <ul className="space-y-0.5">{data.map((node) => <TreeNode key={node.id} node={node} />)}</ul>;
}
