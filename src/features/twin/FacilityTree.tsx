import { Button } from '../../components/ui/Button';
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
      <Button variant="ghost" size="sm" className="w-full justify-start" style={{ paddingLeft: `${depth * 12 + 8}px` }} disabled={!canSelect} onClick={() => selectAsset(node.id)}>
        <span className="truncate">{displayText(node.name, node.id)}</span>
        {node.category && <span className="text-text-muted">{displayText(node.category)}</span>}
      </Button>
      {node.children && node.children.length > 0 && <ul className="mt-1 space-y-1">{node.children.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} />)}</ul>}
    </li>
  );
}

export function FacilityTree() {
  const { data = [], isLoading, isError, error, refetch } = useFacilityTreeQuery();
  if (isLoading) return <LoadingState label="Loading facility" />;
  if (isError) return <ErrorState title="Facility unavailable" message={error instanceof Error ? error.message : 'Unable to load facility tree.'} onRetry={() => void refetch()} />;
  if (data.length === 0) return <EmptyState title="No facility hierarchy" message="Facility tree returned no nodes." />;
  return <ul className="space-y-1">{data.map((node) => <TreeNode key={node.id} node={node} />)}</ul>;
}
