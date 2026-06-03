import { useMemo } from 'react';
import type { ViewerLayer } from '../twin/viewerStore';
import type { SceneLayout, SceneThermalCell } from './layout';

export type LayerOverlaysProps = { layout: SceneLayout; activeLayers: ViewerLayer[] };

/** Heat color from 0-1 value */
function heatColor(heat: number): string {
  if (heat < 0.2) return '#3b82f6'; // cool blue
  if (heat < 0.4) return '#22c55e'; // normal green
  if (heat < 0.6) return '#eab308'; // warm yellow
  if (heat < 0.8) return '#f97316'; // hot orange
  return '#ef4444'; // critical red
}

/** Single thermal cell tile */
function ThermalTile({ cell }: { cell: SceneThermalCell }) {
  return (
    <mesh position={[cell.x, 0.05, cell.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.3, 2.3]} />
      <meshBasicMaterial color={heatColor(cell.heat)} transparent opacity={0.25} depthWrite={false} />
    </mesh>
  );
}

/** Airflow arrow for a row */
function AirflowArrow({ position, direction = 1 }: { position: [number, number, number]; direction?: number }) {
  return (
    <group position={[position[0], 0.12, position[2]]}>
      <mesh rotation={[0, 0, (-Math.PI / 2) * direction]}>
        <coneGeometry args={[0.18, 0.55, 3]} />
        <meshBasicMaterial color="#5e6ad2" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0.45 * direction, 0, 0]} rotation={[0, 0, (Math.PI / 2) * direction]}>
        <cylinderGeometry args={[0.035, 0.035, 0.9, 8]} />
        <meshBasicMaterial color="#5e6ad2" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/** Power path line along a row */
function PowerPath({ rowPosition, assetCount, zoneLabel, label }: { rowPosition: [number, number, number]; assetCount: number; zoneLabel: string; label: string }) {
  const len = Math.max(2, assetCount * 2.3);
  return (
    <mesh key={`pwr-${zoneLabel}-${label}`} position={[rowPosition[0], 0.09, rowPosition[2] - 1.15]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.035, len, 8]} />
      <meshBasicMaterial color="#facc15" transparent opacity={0.75} />
    </mesh>
  );
}

export function LayerOverlays({ layout, activeLayers }: LayerOverlaysProps) {
  const { center, size } = layout.bounds;
  const thermalCells = useMemo(() => {
    if (!activeLayers.includes('thermal')) return [];
    return layout.thermalGrid;
  }, [activeLayers, layout.thermalGrid]);

  return <group>
    {/* Thermal grid: per-zone colored tiles */}
    {thermalCells.map((cell, i) => <ThermalTile key={`th-${cell.zoneLabel}-${i}`} cell={cell} />)}
    {/* Thermal zone labels */}
    {activeLayers.includes('thermal') && layout.zones.map((zone) => (
      <mesh key={`tz-${zone.label}`} position={[zone.position[0], 0.06, zone.position[2] + zone.size[2] / 2 + 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[zone.size[0] - 1, 0.8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    ))}
    {/* Airflow: arrows per row */}
    {activeLayers.includes('airflow') && layout.rows.map((row) => (
      <AirflowArrow key={`air-${row.zoneLabel}-${row.label}`} position={[row.position[0], 0.12, row.position[2] + 1.5]} direction={row.aisleLabel === 'Hot' ? -1 : 1} />
    ))}
    {/* Power paths: lines along rows */}
    {activeLayers.includes('power') && layout.rows.map((row) => (
      <PowerPath key={`pwr-${row.zoneLabel}-${row.label}`} rowPosition={row.position} assetCount={row.assetIds.length} zoneLabel={row.zoneLabel} label={row.label} />
    ))}
    {/* X-Ray: wireframe overlay */}
    {activeLayers.includes('xray') && <mesh position={[center[0], 1.2, center[2]]}><boxGeometry args={[size[0] + 2, 2.4, size[2] + 2]} /><meshBasicMaterial color="#7a7fad" wireframe transparent opacity={0.14} /></mesh>}
  </group>;
}
