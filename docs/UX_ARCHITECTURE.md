# UX Architecture

## Route Map

```text
/login
/twin
/alarms
/telemetry
/assets
/assets/:assetId
/scenes/:sceneId
```

Deep-linkable workspace state:

```text
/twin?sceneId=<id>&assetId=<id>&alarmId=<id>&layer=thermal
```

## Command Center Layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Top Command Bar                                                       │
├──────────────┬───────────────────────────────────────┬───────────────┤
│ Left Nav     │ 3D Digital Twin Workspace             │ Context Panel │
│ Facility     │ Scene / Layers / Selection            │ Asset/Alarm   │
│ Assets       │                                       │ Metrics/SOP   │
├──────────────┴───────────────────────────────────────┴───────────────┤
│ Event Timeline / Alarm Queue / Telemetry Strip                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Navigation

Use desktop-first left rail rather than mobile-style bottom nav.

Primary navigation:

- Twin
- Alarms
- Telemetry
- Assets
- Reports
- Settings

Inside Twin workspace:

- Scene selector
- Facility tree
- Layers
- Viewpoints
- Search

## Panels

### Left Panel

Purpose: spatial navigation.

Contents:

- facility tree
- site/building/floor/hall/zone/row/rack hierarchy
- scene selector
- asset search/filter

### Center Workspace

Purpose: spatial context.

Contents:

- React Three Fiber scene
- floor grid/tiles
- row/aisle/rack layout
- status overlays
- layer overlays
- selected asset highlight

### Right Context Panel

Purpose: selected entity detail.

Modes:

- Asset Detail
- Alarm Detail
- Telemetry Detail
- SOP/Camera Detail later

### Global Drawers

Purpose: global lists without losing scene context.

Drawers:

- Alarm Center
- Telemetry Center
- Asset Search
- Layer Settings

## Interaction Rules

- Selecting asset in 3D opens asset inspector.
- Selecting alarm opens alarm detail and selects linked asset.
- Selecting facility tree node filters or focuses scene.
- Selecting telemetry metric updates chart.
- Esc closes drawers.
- Focus states must be visible.
- Every async section has loading, empty, error, retry states.

## Responsive Behavior

Desktop >= 1280px:

- full command center layout
- left rail + right inspector always available

Tablet 768-1279px:

- collapsible left rail
- right inspector as drawer

Mobile < 768px:

- not primary target for Sprint 2
- provide usable fallback: tabs + drawers + no dense 3D controls
