import { Html } from '@react-three/drei';
import type { SceneLayout } from './layout';

export type SceneLabelsProps = { layout: SceneLayout; selectedAssetId?: string | null | undefined };

export function SceneLabels({ layout, selectedAssetId }: SceneLabelsProps) {
  const selected = layout.nodes.find((node) => node.assetId === selectedAssetId);
  return <group>
    {layout.rows.map((row) => <Html key={`${row.zoneLabel}-${row.label}`} position={[row.position[0], 0.15, row.position[2] + 2]} center><span className="rounded border border-border-subtle bg-bg-panel/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{row.label}</span></Html>)}
    {selected && <Html position={[selected.position[0], selected.position[1] + 3.9, selected.position[2]]} center><span className="rounded-md border border-primary bg-bg-panel px-2 py-1 text-xs font-semibold text-text-primary shadow-lg">{selected.label}</span></Html>}
  </group>;
}
