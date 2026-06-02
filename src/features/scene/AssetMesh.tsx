import { useMemo, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Edges, Outlines } from '@react-three/drei';

import { statusMeta } from '../../lib/status';
import type { SceneNode, SceneVec3 } from './layout';

export type AssetMeshProps = { node: SceneNode; selected?: boolean; onAssetSelect?: ((assetId: string) => void) | undefined };

type Shape = { size: SceneVec3; color: string; emissive?: string };

function shapeFor(category: string): Shape {
  const key = category.toLowerCase();
  if (key.includes('rack')) return { size: [1.15, 3.2, 1], color: '#172033' };
  if (key.includes('server')) return { size: [1.35, 0.55, 0.8], color: '#24314f' };
  if (key.includes('sensor')) return { size: [0.45, 0.45, 0.45], color: '#45d6ff', emissive: '#0b5f7a' };
  if (key.includes('cool') || key.includes('crac') || key.includes('hvac')) return { size: [1.7, 1.5, 1.25], color: '#31546a' };
  if (key.includes('ups') || key.includes('battery') || key.includes('generator')) return { size: [1.4, 2.3, 1.2], color: '#4a3d2c' };
  if (key.includes('pdu') || key.includes('power')) return { size: [0.65, 2.4, 0.85], color: '#4b365f' };
  return { size: [1, 1, 1], color: '#334155' };
}

/** RU line detail for rack front face */
function RackRULines({ height, count = 10 }: { height: number; count?: number }) {
  const lines = useMemo(() => Array.from({ length: count }), [count]);
  const spacing = (height - 0.4) / Math.max(count - 1, 1);
  return <group>{lines.map((_, index) => <mesh key={index} position={[0, 0.2 + index * spacing, -0.515]}><boxGeometry args={[0.95, 0.03, 0.02]} /><meshBasicMaterial color="#64748b" transparent opacity={0.5} /></mesh>)}</group>;
}

/** Vent detail for cooling units */
function VentMarkers({ depth, ..._rest }: { width: number; depth: number }) {
  void _rest;
  return <group position={[0, 0.25, 0]}>
    {[0, 0.4, -0.4].map((xOff, i) => <mesh key={i} position={[xOff, 0, depth / 2 + 0.01]}><boxGeometry args={[0.12, 0.04, 0.02]} /><meshBasicMaterial color="#64748b" /></mesh>)}
  </group>;
}

/** Battery indicator for UPS */
function UPSIndicator() {
  return <group position={[0.75, 0.3, 0.5]}>
    <mesh><boxGeometry args={[0.08, 0.16, 0.08]} /><meshBasicMaterial color="#22c55e" /></mesh>
  </group>;
}

/** Blade detail for servers */
function ServerBlades({ depth, ..._rest2 }: { width: number; depth: number }) {
  void _rest2;
  return <group position={[0, -0.05, 0]}>
    {[0, 0.12, -0.12].map((xOff, i) => <mesh key={i} position={[xOff, 0, depth / 2 + 0.005]}><boxGeometry args={[0.08, 0.02, 0.015]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.7} /></mesh>)}
  </group>;
}

export function AssetMesh({ node, selected = false, onAssetSelect }: AssetMeshProps) {
  const [hovered, setHovered] = useState(false);
  const shape = shapeFor(node.category);
  const key = node.category.toLowerCase();
  const tone = statusMeta(node.status).tone;
  const statusColor = statusMeta(node.status).token;
  const isSensor = key.includes('sensor');
  const isRack = key.includes('rack');
  const isCooling = key.includes('cool') || key.includes('crac') || key.includes('hvac');
  const isUPS = key.includes('ups') || key.includes('battery') || key.includes('generator');
  const isServer = key.includes('server');
  const y = shape.size[1] / 2;
  const emissive = selected || hovered ? '#1d9bf0' : shape.emissive ?? '#000000';
  const handleClick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onAssetSelect?.(node.assetId); };
  return (
    <group
      position={node.position}
      rotation={node.rotation ?? [0, 0, 0]}
      scale={node.scale ?? [1, 1, 1]}
      onClick={handleClick}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {isSensor ? (
        <mesh position={[0, y + 0.15, 0]}>
          <sphereGeometry args={[shape.size[0], 20, 20]} />
          <meshStandardMaterial color={shape.color} emissive={emissive} emissiveIntensity={selected || hovered ? 1.2 : 0.45} />
          {hovered && <Outlines thickness={0.03} color="#38bdf8" />}
        </mesh>
      ) : (
        <mesh position={[0, y, 0]}>
          <boxGeometry args={shape.size} />
          <meshStandardMaterial color={shape.color} emissive={emissive} emissiveIntensity={selected || hovered ? 0.25 : 0.04} roughness={0.65} metalness={0.25} />
          <Edges color={selected ? '#7dd3fc' : hovered ? '#38bdf8' : '#475569'} />
          {hovered && <Outlines thickness={0.02} color="#38bdf8" />}
        </mesh>
      )}
      {/* Rack RU lines */}
      {isRack && <RackRULines height={shape.size[1]} count={8} />}
      {/* Server blade detail */}
      {isServer && <ServerBlades width={shape.size[0]} depth={shape.size[2]} />}
      {/* Cooling vent markers */}
      {isCooling && <VentMarkers width={shape.size[0]} depth={shape.size[2]} />}
      {/* UPS battery indicator */}
      {isUPS && <UPSIndicator />}
      {/* Status strip on side */}
      <mesh position={[shape.size[0] / 2 + 0.035, Math.max(0.35, y), -0.52]}>
        <boxGeometry args={[0.08, Math.max(0.35, shape.size[1] * 0.72), 0.04]} />
        <meshBasicMaterial color={tone === 'unknown' ? '#64748b' : statusColor} />
      </mesh>
      {/* Selected ring */}
      {selected && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}><ringGeometry args={[1.05, 1.28, 48]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.9} /></mesh>}
    </group>
  );
}
