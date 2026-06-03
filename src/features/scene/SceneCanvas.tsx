import { Canvas, useThree } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import type { AssetSummary, FacilityNode, SceneManifest, Viewpoint } from '../../lib/api/types';
import type { ViewerLayer } from '../twin/viewerStore';
import { AlarmBeacon, type SceneAlarm } from './AlarmBeacon';
import { AssetMesh } from './AssetMesh';
import { LayerOverlays } from './LayerOverlays';
import { buildSceneLayout } from './layout';
import { SceneLabels } from './SceneLabels';

export type SceneCanvasProps = {
  manifest?: SceneManifest | null | undefined;
  assets: AssetSummary[];
  facilityTree?: FacilityNode[] | undefined;
  selectedAssetId?: string | null | undefined;
  activeLayers: ViewerLayer[];
  alarms?: SceneAlarm[];
  onAssetSelect?: ((assetId: string) => void) | undefined;
  onAlarmClick?: ((alarm: SceneAlarm) => void) | undefined;
  viewpoints?: Viewpoint[] | undefined;
};

function fitCameraToBounds(camera: THREE.Camera, size: [number, number, number], controls?: { target: THREE.Vector3; update: () => void } | null) {
  const maxDim = Math.max(size[0], size[2]);
  const fov = (camera as THREE.PerspectiveCamera).fov ?? 50;
  const distance = (maxDim / 2) / Math.tan((fov * Math.PI) / 360) * 1.4;
  camera.position.set(distance * 0.7, distance * 0.55, distance * 0.7);
  camera.lookAt(0, 0, 0);
  if (controls) {
    controls.target.set(0, 0.8, 0);
    controls.update();
  }
}

function ViewpointController({ viewpoints: _viewpoints, sceneSize }: { viewpoints: Viewpoint[] | undefined; sceneSize: [number, number, number] }) {
  void _viewpoints;
  const { camera } = useThree();
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

  useEffect(() => {
    fitCameraToBounds(camera, sceneSize, controlsRef.current);
  }, [camera, sceneSize]);

  const goTo = useCallback((vp: Viewpoint) => {
    const target = vp.target ?? [0, 0, 0];
    const startPos = [camera.position.x, camera.position.y, camera.position.z];
    const startTarget = controlsRef.current?.target?.toArray() ?? [0, 0, 0];
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(
        { x: startPos[0], y: startPos[1], z: startPos[2] } as THREE.Vector3,
        { x: vp.position[0], y: vp.position[1], z: vp.position[2] } as THREE.Vector3,
        ease,
      );
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(
          { x: startTarget[0], y: startTarget[1], z: startTarget[2] } as THREE.Vector3,
          { x: target[0], y: target[1], z: target[2] } as THREE.Vector3,
          ease,
        );
        controlsRef.current.update();
      }
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [camera]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__viewpointGoTo = goTo;
    return () => { delete (window as unknown as Record<string, unknown>).__viewpointGoTo; };
  }, [goTo]);

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} target={[0, 0.8, 0]} maxPolarAngle={Math.PI / 2.08} />;
}

function FloorTiles({ size }: { size: [number, number, number] }) {
  const floorSize = Math.max(60, size[0] + 20, size[2] + 20);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[floorSize, floorSize]} />
      <meshStandardMaterial color="#08090a" roughness={0.92} metalness={0.03} />
    </mesh>
    <Grid args={[floorSize, floorSize]} cellColor="#1a1c20" sectionColor="#2a2d32" position={[0, 0.01, 0]} infiniteGrid={false} fadeDistance={floorSize * 0.8} fadeStrength={1.8} />
  </group>;
}

function ViewpointButtons({ viewpoints }: { viewpoints: Viewpoint[] | undefined }) {
  if (!viewpoints || viewpoints.length === 0) return null;
  return (
    <div className="absolute right-3 top-3 z-10 flex flex-wrap gap-1.5">
      {viewpoints.map((vp) => (
        <Button key={vp.id} size="sm" variant="secondary" className="h-7 px-2 text-[0.7rem]" onClick={() => {
          const goTo = (window as unknown as Record<string, unknown>).__viewpointGoTo as ((vp: Viewpoint) => void) | undefined;
          goTo?.(vp);
        }}>
          {vp.name}
        </Button>
      ))}
    </div>
  );
}

export function SceneCanvas({ manifest, assets, facilityTree, selectedAssetId, activeLayers, alarms = [], onAssetSelect, onAlarmClick, viewpoints }: SceneCanvasProps) {
  const layout = useMemo(() => buildSceneLayout({ manifest, assets, facilityTree }), [manifest, assets, facilityTree]);
  if (layout.nodes.length === 0) return <EmptyState title="No scene assets" message="This scene has no placeable assets yet." />;
  const alarmByAsset = new Map(alarms.map((alarm) => [alarm.assetId, alarm]));
  return <div className="relative h-[610px] overflow-hidden rounded-lg border border-hairline bg-canvas">
    <Canvas camera={{ position: [10, 7.5, 11], fov: 45 }} shadows>
      <color attach="background" args={["#010102"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 8]} intensity={1.25} castShadow />
      <pointLight position={[-6, 6, -6]} intensity={0.35} color="#5e6ad2" />
      <FloorTiles size={layout.bounds.size} />
      <LayerOverlays layout={layout} activeLayers={activeLayers} />
      {layout.nodes.map((node) => <AssetMesh key={node.assetId} node={node} selected={node.assetId === selectedAssetId} onAssetSelect={onAssetSelect} />)}
      {activeLayers.includes('alarm') && layout.nodes.map((node) => { const alarm = alarmByAsset.get(node.assetId); return alarm ? <AlarmBeacon key={alarm.id} position={node.position} alarm={alarm} onAlarmClick={onAlarmClick} /> : null; })}
      <SceneLabels layout={layout} selectedAssetId={selectedAssetId} />
      <ViewpointController viewpoints={viewpoints} sceneSize={layout.bounds.size} />
    </Canvas>
    <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-hairline bg-surface-1/85 px-3 py-2 font-mono text-caption text-ink-subtle">
      {layout.nodes.length} assets · {layout.rows.length} rows · {layout.zones.length} zones{layout.thermalGrid.length > 0 ? ` · ${layout.thermalGrid.length} thermal cells` : ''}
    </div>
    <ViewpointButtons viewpoints={viewpoints} />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-canvas/80 to-transparent" />
  </div>;
}
