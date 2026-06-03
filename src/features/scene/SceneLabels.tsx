import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { Camera } from 'three';

import type { SceneLayout, SceneNode, SceneRow, SceneZone } from './layout';

export type SceneLabelsProps = { layout: SceneLayout; selectedAssetId?: string | null | undefined };

/** Abbreviate long asset names */
function abbrev(name: string, max = 18): string {
  if (name.length <= max) return name;
  return name.slice(0, Math.max(4, max - 3)) + '..' + name.slice(-2);
}

/** Zone label at zone center-top */
function ZoneLabel({ zone }: { zone: SceneZone }) {
  return (
    <Html position={[zone.position[0], 1.2, zone.position[2] - zone.size[2] / 2 - 1.8]} center>
      <span className="rounded border border-primary/30 bg-surface-1/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary/80">{zone.label}</span>
    </Html>
  );
}

/** Row/aisle label with distance-based visibility */
function RowLabel({ row }: { row: SceneRow }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const dist = camera.position.distanceTo({ x: row.position[0], y: 0, z: row.position[2] } as Parameters<Camera['position']['distanceTo']>[0]);
    setVisible(dist < 28);
  });
  return (
    <Html ref={ref} position={[row.position[0], 0.15, row.position[2] + 2]} center>
      {visible && (
        <span className="rounded border border-hairline bg-surface-1/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
          {row.aisleLabel ? `${row.aisleLabel} · ${row.label}` : row.label}
        </span>
      )}
    </Html>
  );
}

/** Asset label: only on selected asset (full) or abbreviated at close distance */
function AssetLabel({ node, selected }: { node: SceneNode; selected: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showAbbrev, setShowAbbrev] = useState(true);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const dist = camera.position.distanceTo({ x: node.position[0], y: 0, z: node.position[2] } as Parameters<Camera['position']['distanceTo']>[0]);
    // Show full label only when close (< 12 units) or selected
    setShowAbbrev(dist > 12 && !selected);
  });
  if (selected) {
    return (
      <Html position={[node.position[0], node.position[1] + 3.9, node.position[2]]} center>
        <span className="rounded-md border border-primary bg-surface-1 px-2 py-1 text-caption font-medium text-ink">{node.label}</span>
      </Html>
    );
  }
  return (
    <Html ref={ref} position={[node.position[0], node.position[1] + 3.2, node.position[2]]} center>
      {!showAbbrev && (
        <span className="rounded border border-hairline bg-surface-1/70 px-1.5 py-0.5 text-[9px] text-ink-tertiary">{abbrev(node.label)}</span>
      )}
    </Html>
  );
}

export function SceneLabels({ layout, selectedAssetId }: SceneLabelsProps) {
  return <group>
    {/* Zone labels */}
    {layout.zones.map((zone) => <ZoneLabel key={`zl-${zone.label}`} zone={zone} />)}
    {/* Row labels with aisle */}
    {layout.rows.map((row) => <RowLabel key={`rl-${row.zoneLabel}-${row.label}`} row={row} />)}
    {/* Asset labels (abbreviated at distance, full on selected) */}
    {layout.nodes.map((node) => <AssetLabel key={`al-${node.assetId}`} node={node} selected={node.assetId === selectedAssetId} />)}
  </group>;
}
