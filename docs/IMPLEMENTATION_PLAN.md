# Frontend v2 Implementation Plan

## Phase V2-0 — Repository Setup

- Scaffold Vite React TypeScript app.
- Add React Router, TanStack Query, Zustand.
- Add Tailwind CSS and shadcn/ui.
- Add React Three Fiber, Drei, Recharts.
- Add Dockerfile, nginx.conf, .dockerignore.
- Add `.env.example` with real backend default.

## Phase V2-1 — Design System

Create:

```text
src/styles/tokens.css
src/components/ui/Button.tsx
src/components/ui/Panel.tsx
src/components/ui/StatusBadge.tsx
src/components/ui/MetricCard.tsx
src/components/ui/EmptyState.tsx
src/components/ui/ErrorState.tsx
src/components/ui/LoadingState.tsx
src/components/ui/Drawer.tsx
src/components/ui/DataTable.tsx
```

Goals:

- remove ad-hoc raw color usage
- centralize status colors
- consistent panel/card/button/list states
- accessible focus/hover/selected states

## Phase V2-2 — Auth + API Foundation

Implement:

- centralized API client
- token injection
- one-time refresh retry
- auth storage wrapper
- login page
- protected routes
- route-level error boundary

Quality gates:

- login validation test
- API error parsing test
- protected route redirect test

## Phase V2-3 — Command Center Shell

Implement:

- top command bar
- left nav rail
- facility tree panel
- center 3D workspace
- right context inspector
- global drawer system

Primary route:

```text
/twin
```

## Phase V2-4 — Core Backend Integration

Wire real APIs:

- `/facility/tree`
- `/scenes`
- `/scenes/{sceneId}/manifest`
- `/assets?limit=50`
- `/assets/{assetId}`

Normalize backend data at adapter boundaries.

Never render raw objects directly into React text nodes.

## Phase V2-5 — 3D Scene Upgrade

Implement:

- manifest normalization
- procedural fallback layout
- rack/server/sensor/cooling geometry
- row/aisle labels
- selected asset highlight
- alarm beacons
- layer overlays

Fallback priority:

1. real manifest asset positions
2. facility/rackPosition-derived layout
3. synthesized hall/row grid
4. unplaced zone

## Phase V2-6 — Alarm Center

Implement:

- global alarm page/drawer
- `/alarms?limit=50`
- `/alarms?assetId=<assetId>&limit=50`
- `/alarms/{alarmId}`
- severity/state filters
- alarm detail timeline
- select alarm -> select/focus asset

## Phase V2-7 — Telemetry Center

Implement:

- latest metric cards
- metric selector
- timeseries chart
- 1h/6h/24h range selector
- empty/error/loading states
- chart tooltip with units

APIs:

- `/assets/{assetId}/metrics/latest`
- `/assets/{assetId}/metrics/timeseries`

## Phase V2-8 — Asset Search + Deep Links

Implement:

- `/assets`
- `/assets/:assetId`
- URL query sync for `sceneId`, `assetId`, `alarmId`, `layer`
- global search by asset tag/name/category

## Phase V2-9 — Docker + Verification

For every release:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
docker build -t twin-frontend-app:v2 .
docker rm -f twin-frontend-app || true
docker run -d --name twin-frontend-app -p 8080:80 twin-frontend-app:v2
curl http://localhost:8080/health
curl -I http://localhost:8080
```

Manual smoke:

- login admin/Admin@123456
- open `/twin`
- load facility/scenes/assets
- select asset in 3D
- view detail/metrics/chart
- open Alarm Center
- select alarm and verify linked asset selection
- open Telemetry Center

## Phase V2-10 — GLTF Model Pipeline

Optional after procedural layout is solid.

Add:

```text
public/models/rack.glb
public/models/server.glb
public/models/sensor.glb
public/models/pdu.glb
public/models/crac.glb
```

Implement model registry and category mapping.

Use instancing/LOD for performance.
