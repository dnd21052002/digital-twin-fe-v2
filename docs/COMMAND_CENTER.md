# Command Center

## Purpose

Main workspace for operators to monitor facility state, navigate the Digital Twin, inspect assets, and respond to alarms.

## Screen Regions

### Top Command Bar

Contents:

- app name
- site/facility selector
- API/backend status
- global search
- active incident count
- current user/logout

### Left Spatial Navigation

Contents:

- facility tree
- scene selector
- asset search
- layer toggles

Behavior:

- selecting hierarchy node focuses/filter scene
- selecting scene loads manifest
- missing scene geometry falls back to synthesized layout

### Center Digital Twin Workspace

Contents:

- 3D scene
- floor/aisle/rack layout
- selected asset highlight
- alarm beacons
- active layer overlays

### Right Context Inspector

States:

- no selection: show helpful empty state
- asset selected: show identity, metrics, related alarms
- alarm selected: show detail, current/threshold, timeline, SOP/camera hints

### Bottom Timeline Strip

Optional later:

- recent alarms
- telemetry events
- operator actions

## Key Workflows

### Asset Investigation

```text
select asset -> inspector opens -> metrics + alarms load -> chart metric selectable
```

### Alarm Investigation

```text
open Alarm Center -> select alarm -> 3D focuses asset -> alarm detail opens -> related telemetry visible
```

### Facility Navigation

```text
select site/floor/hall/row -> scene filters/highlights that area -> asset list narrows
```

## Empty States

- No scenes: show asset-shell fallback and message that backend geometry is missing.
- No metrics: explain that selected asset has no metric data.
- No alarms: show healthy state.
- No location: place asset in Unplaced zone.

## Error States

Use consistent error panel:

- title
- short cause
- retry button
- support/debug hint only in dev mode

Never show raw stack trace to operator.
