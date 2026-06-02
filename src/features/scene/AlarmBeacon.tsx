import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { useRef } from 'react';

import type { SceneVec3 } from './layout';

export type SceneAlarm = { id: string; assetId: string; severity?: string; status?: string; acknowledged?: boolean };
export type AlarmBeaconProps = { position: SceneVec3; alarm: SceneAlarm };

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

export function AlarmBeacon({ position, alarm }: AlarmBeaconProps) {
  const ring = useRef<Mesh>(null);
  const reducedMotion = useReducedMotion();
  const acknowledged = alarm.acknowledged || alarm.status?.toLowerCase().includes('ack');
  const critical = alarm.severity?.toLowerCase() === 'critical';
  const color = acknowledged ? '#64748b' : critical ? '#ef4444' : '#f59e0b';
  useFrame(({ clock }) => {
    if (reducedMotion || !ring.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.18;
    ring.current.scale.setScalar(pulse);
  });
  return <group position={[position[0], position[1] + 3.8, position[2]]}><mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.55, 0.72, 40]} /><meshBasicMaterial color={color} transparent opacity={acknowledged ? 0.45 : 0.9} /></mesh><pointLight color={color} intensity={acknowledged ? 0.25 : 1.1} distance={5} /></group>;
}
