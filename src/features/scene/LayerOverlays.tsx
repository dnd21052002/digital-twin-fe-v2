import type { ViewerLayer } from '../twin/viewerStore';
import type { SceneLayout } from './layout';

export type LayerOverlaysProps = { layout: SceneLayout; activeLayers: ViewerLayer[] };

export function LayerOverlays({ layout, activeLayers }: LayerOverlaysProps) {
  const { center, size } = layout.bounds;
  return <group>
    {activeLayers.includes('thermal') && <mesh position={[center[0], 0.07, center[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[size[0] + 4, size[2] + 4, 1, 1]} /><meshBasicMaterial color="#ef4444" transparent opacity={0.16} /></mesh>}
    {activeLayers.includes('airflow') && layout.rows.map((row) => <group key={`air-${row.zoneLabel}-${row.label}`} position={[row.position[0], 0.12, row.position[2] + 1.5]}><mesh rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.18, 0.55, 3]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.75} /></mesh><mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 0.9, 8]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.5} /></mesh></group>)}
    {activeLayers.includes('power') && layout.rows.map((row) => <mesh key={`pwr-${row.zoneLabel}-${row.label}`} position={[row.position[0], 0.09, row.position[2] - 1.15]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, Math.max(2, row.assetIds.length * 2.3), 8]} /><meshBasicMaterial color="#facc15" transparent opacity={0.75} /></mesh>)}
    {activeLayers.includes('xray') && <mesh position={[center[0], 1.2, center[2]]}><boxGeometry args={[size[0] + 2, 2.4, size[2] + 2]} /><meshBasicMaterial color="#93c5fd" wireframe transparent opacity={0.14} /></mesh>}
  </group>;
}
