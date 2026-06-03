import { useFrame } from '@react-three/fiber';
import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Edges, Outlines } from '@react-three/drei';
import type { Camera } from 'three';

import { statusMeta } from '../../lib/status';
import type { SceneNode, SceneVec3 } from './layout';
import { resolveAssetModel, type ResolvedAssetModel } from './modelRegistry';

export type AssetMeshProps = { node: SceneNode; selected?: boolean; onAssetSelect?: ((assetId: string) => void) | undefined };

const LOD_DISTANCES = { high: 15, medium: 30 } as const;

function useLodLevel(position: SceneVec3): 'high' | 'medium' | 'low' {
  const [level, setLevel] = useState<'high' | 'medium' | 'low'>('high');

  useFrame(({ camera }) => {
    const dist = camera.position.distanceTo({ x: position[0], y: position[1], z: position[2] } as Parameters<Camera['position']['distanceTo']>[0]);
    const next = dist < LOD_DISTANCES.high ? 'high' : dist < LOD_DISTANCES.medium ? 'medium' : 'low';
    if (next !== level) setLevel(next);
  });

  return level;
}

function RackRULines({ height, count = 8 }: { height: number; count?: number }) {
  const lines = Array.from({ length: count });
  const spacing = (height - 0.4) / Math.max(count - 1, 1);
  return <group>{lines.map((_, i) => <mesh key={i} position={[0, 0.2 + i * spacing, -0.515]}><boxGeometry args={[0.95, 0.03, 0.02]} /><meshBasicMaterial color="#3e3e44" transparent opacity={0.5} /></mesh>)}</group>;
}

function VentMarkers({ depth }: { depth: number }) {
  return <group position={[0, 0.25, 0]}>
    {[0, 0.4, -0.4].map((xOff, i) => <mesh key={i} position={[xOff, 0, depth / 2 + 0.01]}><boxGeometry args={[0.12, 0.04, 0.02]} /><meshBasicMaterial color="#3e3e44" /></mesh>)}
  </group>;
}

function UPSIndicator() {
  return <group position={[0.75, 0.3, 0.5]}>
    <mesh><boxGeometry args={[0.08, 0.16, 0.08]} /><meshBasicMaterial color="#27a644" /></mesh>
  </group>;
}

function ServerBlades({ depth }: { depth: number }) {
  return <group position={[0, -0.05, 0]}>
    {[0, 0.12, -0.12].map((xOff, i) => <mesh key={i} position={[xOff, 0, depth / 2 + 0.005]}><boxGeometry args={[0.08, 0.02, 0.015]} /><meshBasicMaterial color="#5e6ad2" transparent opacity={0.7} /></mesh>)}
  </group>;
}

function ProceduralGeometry({ model, isSensor, selected, hovered, emissive }: { model: ResolvedAssetModel; isSensor: boolean; selected: boolean; hovered: boolean; emissive: string }) {
  const size = model.proceduralSize;
  const y = size[1] / 2;

  if (isSensor || model.proceduralType === 'sphere') {
    return (
      <mesh position={[0, y + 0.15, 0]}>
        <sphereGeometry args={[size[0], 16, 16]} />
        <meshStandardMaterial color={model.proceduralColor} emissive={emissive} emissiveIntensity={selected || hovered ? 1.2 : 0.45} />
        {hovered && <Outlines thickness={0.03} color="#5e6ad2" />}
      </mesh>
    );
  }

  return (
    <mesh position={[0, y, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={model.proceduralColor} emissive={emissive} emissiveIntensity={selected || hovered ? 0.25 : 0.04} roughness={0.65} metalness={0.25} />
      <Edges color={selected ? '#828fff' : hovered ? '#5e6ad2' : '#2a2d32'} />
      {hovered && <Outlines thickness={0.02} color="#5e6ad2" />}
    </mesh>
  );
}

function Details({ model }: { model: ResolvedAssetModel }) {
  const size = model.proceduralSize;
  return <group>
    {model.details.includes('ru-lines') && <RackRULines height={size[1]} />}
    {model.details.includes('blades') && <ServerBlades depth={size[2]} />}
    {model.details.includes('vents') && <VentMarkers depth={size[2]} />}
    {model.details.includes('indicator') && <UPSIndicator />}
  </group>;
}

function StatusStrip({ size, tone, statusColor }: { size: SceneVec3; tone: string; statusColor: string }) {
  const y = size[1] / 2;
  return (
    <mesh position={[size[0] / 2 + 0.035, Math.max(0.35, y), -0.52]}>
      <boxGeometry args={[0.08, Math.max(0.35, size[1] * 0.72), 0.04]} />
      <meshBasicMaterial color={tone === 'unknown' ? '#3e3e44' : statusColor} />
    </mesh>
  );
}

function SelectedRing() {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
    <ringGeometry args={[1.05, 1.28, 48]} />
    <meshBasicMaterial color="#5e6ad2" transparent opacity={0.9} />
  </mesh>;
}

function SimplifiedMesh({ model, selected, emissive }: { model: ResolvedAssetModel; selected: boolean; hovered: boolean; emissive: string }) {
  const size = model.proceduralSize;
  const y = size[1] / 2;
  return (
    <mesh position={[0, y, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={model.proceduralColor} emissive={emissive} emissiveIntensity={selected ? 0.15 : 0.02} roughness={0.7} metalness={0.2} />
    </mesh>
  );
}

export function AssetMesh({ node, selected = false, onAssetSelect }: AssetMeshProps) {
  const [hovered, setHovered] = useState(false);
  const lodLevel = useLodLevel(node.position);
  const model = resolveAssetModel(node.category);
  const tone = statusMeta(node.status).tone;
  const statusColor = statusMeta(node.status).token;
  const isSensor = model.category === 'sensor';
  const emissive = selected || hovered ? '#5e6ad2' : model.proceduralEmissive ?? '#000000';

  const handleClick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onAssetSelect?.(node.assetId); };

  if (lodLevel === 'low') {
    return (
      <group position={node.position} onClick={handleClick}>
        <SimplifiedMesh model={model} selected={selected} hovered={hovered} emissive={emissive} />
      </group>
    );
  }

  return (
    <group
      position={node.position}
      rotation={node.rotation ?? [0, 0, 0]}
      scale={node.scale ?? [1, 1, 1]}
      onClick={handleClick}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <ProceduralGeometry model={model} isSensor={isSensor} selected={selected} hovered={hovered} emissive={emissive} />
      {lodLevel === 'high' && <Details model={model} />}
      <StatusStrip size={model.proceduralSize} tone={tone} statusColor={statusColor} />
      {selected && <SelectedRing />}
    </group>
  );
}
