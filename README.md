# Twin@P.CN Frontend v2

Professional UI/UX redesign documentation for the Twin@P.CN data-center Digital Twin web app.

## Purpose

Frontend v2 shifts the product from a demo-style 3D dashboard to an operator-grade command center.

Core journey:

```text
Login -> Command Center -> Select facility/scene/asset -> Inspect metrics + alarms -> Take action
```

## Docs

- [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md) — product direction and operator-first principles
- [`docs/UX_ARCHITECTURE.md`](docs/UX_ARCHITECTURE.md) — routes, layout, navigation, interaction model
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — tokens, palette, typography, components
- [`docs/COMMAND_CENTER.md`](docs/COMMAND_CENTER.md) — main workspace layout and behavior
- [`docs/THREE_D_SCENE.md`](docs/THREE_D_SCENE.md) — 3D scene, procedural fallback, GLTF roadmap
- [`docs/ALARMS.md`](docs/ALARMS.md) — alarm center UX and API integration
- [`docs/TELEMETRY.md`](docs/TELEMETRY.md) — telemetry cards/charts UX and API integration
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — phased build plan

## Recommended stack

```text
Vite + React + TypeScript + React Router + TanStack Query + Zustand + Tailwind CSS + shadcn/ui + React Three Fiber + Drei + Recharts
```

## Backend

Base URL:

```text
http://localhost:3000/api/v1
```

Sprint 1 endpoints are real:

- Auth: `/auth/login`, `/auth/logout`, `/auth/refresh`, `/me`
- Core: `/facility/tree`, `/scenes`, `/scenes/{sceneId}/manifest`, `/assets`, `/assets/{assetId}`
- Telemetry: `/assets/{assetId}/metrics/latest`, `/assets/{assetId}/metrics/timeseries`
- Alarms: `/alarms`, `/alarms/{alarmId}`

## Git

This folder is initialized as a standalone git repository. Add remote when available:

```bash
git remote add origin <repo-url>
git push -u origin main
```
