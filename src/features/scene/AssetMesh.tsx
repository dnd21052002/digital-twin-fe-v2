import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';

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
  if (key.includes('pdu') || key.includes('power')) return { size: [0.65, 2.4, 0.85], color: '#4b365f' };
  return { size: [1, 1, 1], color: '#334155' };
}

export function AssetMesh({ node, selected = false, onAssetSelect }: AssetMeshProps) {
  const [hovered, setHovered] = useState(false);
  const shape = shapeFor(node.category);
  const tone = statusMeta(node.status).tone;
  const statusColor = statusMeta(node.status).token;
  const isSensor = node.category.toLowerCase().includes('sensor');
  const y = shape.size[1] / 2;
  const emissive = selected || hovered ? '#1d9bf0' : shape.emissive ?? '#000000';
  const handleClick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onAssetSelect?.(node.assetId); };
  return (
    <group position={node.position} rotation={node.rotation ?? [0, 0, 0]} scale={node.scale ?? [1, 1, 1]} onClick={handleClick} onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)}>
      {isSensor ? (
        <mesh position={[0, y + 0.15, 0]}>
          <sphereGeometry args={[shape.size[0], 20, 20]} />
          <meshStandardMaterial color={shape.color} emissive={emissive} emissiveIntensity={selected || hovered ? 1.2 : 0.45} />
        </mesh>
      ) : (
        <mesh position={[0, y, 0]}>
          <boxGeometry args={shape.size} />
          <meshStandardMaterial color={shape.color} emissive={emissive} emissiveIntensity={selected || hovered ? 0.25 : 0.04} roughness={0.65} metalness={0.25} />
          <Edges color={selected ? '#7dd3fc' : '#475569'} />
        </mesh>
      )}
      {node.category.toLowerCase().includes('rack') && Array.from({ length: 5 }).map((_, index) => (
        <mesh key={index} position={[0, 0.65 + index * 0.45, -0.515]}>
          <boxGeometry args={[0.95, 0.035, 0.025]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>
      ))}
      <mesh position={[shape.size[0] / 2 + 0.035, Math.max(0.35, y), -0.52]}>
        <boxGeometry args={[0.08, Math.max(0.35, shape.size[1] * 0.72), 0.04]} />
        <meshBasicMaterial color={tone === 'unknown' ? '#64748b' : statusColor} />
      </mesh>
      {selected && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}><ringGeometry args={[1.05, 1.28, 48]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.9} /></mesh>}
    </group>
  );
}
