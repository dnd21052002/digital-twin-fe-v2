import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';

import { EmptyState } from '../../components/ui/EmptyState';
import type { AssetSummary, FacilityNode, SceneManifest } from '../../lib/api/types';
import type { ViewerLayer } from '../twin/viewerStore';
import { AlarmBeacon, type SceneAlarm } from './AlarmBeacon';
import { AssetMesh } from './AssetMesh';
import { LayerOverlays } from './LayerOverlays';
import { buildSceneLayout } from './layout';
import { SceneLabels } from './SceneLabels';

export type SceneCanvasProps = {
  manifest?: SceneManifest | null;
  assets: AssetSummary[];
  facilityTree?: FacilityNode[] | undefined;
  selectedAssetId?: string | null | undefined;
  activeLayers: ViewerLayer[];
  alarms?: SceneAlarm[];
  onAssetSelect?: ((assetId: string) => void) | undefined;
};

function FloorTiles() {
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[42, 42]} /><meshStandardMaterial color="#07111f" roughness={0.92} metalness={0.03} /></mesh>
    <Grid args={[42, 42]} cellColor="#17324d" sectionColor="#1d5f8f" position={[0, 0.01, 0]} infiniteGrid={false} fadeDistance={34} fadeStrength={1.8} />
  </group>;
}

export function SceneCanvas({ manifest, assets, facilityTree, selectedAssetId, activeLayers, alarms = [], onAssetSelect }: SceneCanvasProps) {
  const layout = useMemo(() => buildSceneLayout({ manifest, assets, facilityTree }), [manifest, assets, facilityTree]);
  if (layout.nodes.length === 0) return <EmptyState title="No scene assets" message="This scene has no placeable assets yet." />;
  const alarmByAsset = new Map(alarms.map((alarm) => [alarm.assetId, alarm]));
  return <div className="relative h-[610px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#020617] shadow-inner shadow-black">
    <Canvas camera={{ position: [10, 7.5, 11], fov: 45 }} shadows>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 8]} intensity={1.25} castShadow />
      <pointLight position={[-6, 6, -6]} intensity={0.35} color="#38bdf8" />
      <FloorTiles />
      <LayerOverlays layout={layout} activeLayers={activeLayers} />
      {layout.nodes.map((node) => <AssetMesh key={node.assetId} node={node} selected={node.assetId === selectedAssetId} onAssetSelect={onAssetSelect} />)}
      {activeLayers.includes('alarm') && layout.nodes.map((node) => { const alarm = alarmByAsset.get(node.assetId); return alarm ? <AlarmBeacon key={alarm.id} position={node.position} alarm={alarm} /> : null; })}
      <SceneLabels layout={layout} selectedAssetId={selectedAssetId} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} target={[layout.bounds.center[0], 0.8, layout.bounds.center[2]]} maxPolarAngle={Math.PI / 2.08} />
    </Canvas>
    <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/[0.08] bg-bg-panel/85 px-3 py-2 font-mono text-[0.7rem] text-text-secondary backdrop-blur">
      {layout.nodes.length} assets · {layout.rows.length} rows · {layout.zones.length} zones
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg-base/80 to-transparent" />
  </div>;
}
