# 3D Scene

## Goal

Represent data-center spatial context clearly enough for operators to locate assets, understand alarm location, and inspect facility zones.

## Required Backend Data

Ideal scene manifest:

```ts
type SceneManifest = {
  id: string;
  name: string;
  units: 'meters';
  origin: [number, number, number];
  bounds: { min: [number, number, number]; max: [number, number, number] };
  assets: SceneAssetNode[];
};

type SceneAssetNode = {
  assetId: string;
  label: string;
  category: string | { code?: string; name?: string };
  status: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  parentId?: string;
};
```

Current backend may return:

```json
{ "scene": {}, "meshes": [], "textures": [] }
```

Frontend must normalize this safely.

## Procedural Fallback

When geometry is missing, synthesize layout from facility/assets:

1. Group by site/building/floor/hall/zone/row/rackPosition.
2. Build halls as floor zones.
3. Build rows as parallel rack lines.
4. Place racks in rack slots.
5. Place unlocated assets in an "Unplaced" zone.

Fallback layout:

```text
Hall A
  Cold Aisle
  Row A: Rack 001 002 003 004
  Hot Aisle
  Row B: Rack 005 006 007 008
```

## Object Types

### Rack

- tall cabinet
- dark metal body
- front door grid
- side status strip
- top label

### Server

- blade module inside rack or standalone short cabinet
- front slots/blades
- small LED indicators

### Sensor

- small wall/floor/ceiling node
- glow marker
- label only on selection/hover

### Cooling/CRAC

- larger floor unit
- airflow arrows when layer enabled

### PDU/Power

- narrow side module
- power path lines when layer enabled

## Layers

- X-Ray: wireframe interiors
- Thermal: heatmap plane / asset color overlay
- Airflow: directional arrows
- Power Path: line overlays
- Alarm: beacons/rings above affected assets

## Camera / Controls

Modes:

- Orbit: inspection mode
- Fly: facility overview
- Focus: camera transitions to selected asset

Need viewpoints:

- Default scene overview
- Hall overview
- Row overview
- Selected asset close-up

## Labeling

Rules:

- Do not show all full labels at once.
- Show full label on hover/selection.
- Show row/aisle labels always.
- Abbreviate dense asset labels.

## GLTF Roadmap

Add model registry later:

```ts
const modelRegistry = {
  RACK: '/models/rack.glb',
  SERVER: '/models/server.glb',
  SENSOR: '/models/sensor.glb',
  PDU: '/models/pdu.glb',
  CRAC: '/models/crac.glb',
};
```

Use:

- Drei `useGLTF`
- instancing for repeated racks/servers
- LOD for large scenes
- procedural fallback remains available
