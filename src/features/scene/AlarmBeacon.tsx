import { useEffect, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import type { Mesh, MeshBasicMaterial as MeshBasicMat } from 'three';

import type { SceneVec3 } from './layout';

export type SceneAlarm = { id: string; assetId: string; severity?: string; status?: string; acknowledged?: boolean };
export type AlarmBeaconProps = { position: SceneVec3; alarm: SceneAlarm; onAlarmClick?: ((alarm: SceneAlarm) => void) | undefined };

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const onChange = () => setReduced(query.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

export function AlarmBeacon({ position, alarm, onAlarmClick }: AlarmBeaconProps) {
  const sphere = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);
  const reducedMotion = useReducedMotion();
  const acknowledged = alarm.acknowledged || alarm.status?.toLowerCase().includes('ack');
  const critical = alarm.severity?.toLowerCase() === 'critical';
  const color = acknowledged ? '#64748b' : critical ? '#ef4444' : '#f59e0b';
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 3) * 0.15;
    if (sphere.current) sphere.current.scale.setScalar(pulse);
    if (glow.current) {
      glow.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
      (glow.current.material as unknown as MeshBasicMat).opacity = 0.3 + Math.sin(t * 2.5) * 0.1;
    }
  });
  const handleClick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onAlarmClick?.(alarm); };
  return (
    <group position={[position[0], position[1] + 3.8, position[2]]} onClick={handleClick}>
      {/* Glow aura */}
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 1.0, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Pulsating sphere */}
      <mesh ref={sphere}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={acknowledged ? 0.5 : 0.9} />
      </mesh>
      <pointLight color={color} intensity={acknowledged ? 0.25 : 1.1} distance={5} />
    </group>
  );
}
