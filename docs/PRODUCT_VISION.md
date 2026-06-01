# Product Vision

## Goal

Build an operator-grade Digital Twin Command Center for data-center operations.

The UI must help operators answer five questions in seconds:

1. Which facility area has risk?
2. Which alarm matters most?
3. Which asset is affected?
4. Which telemetry changed?
5. What should the operator do next?

## Positioning

Frontend v2 is not a decorative 3D demo. It is an incident-aware operational system.

Primary users:

- NOC operators
- Data-center facility operators
- Site reliability / infrastructure teams
- Maintenance supervisors

Primary workflows:

- Monitor facility health
- Investigate alarms
- Inspect asset telemetry
- Locate assets in 3D context
- Follow SOP/camera/maintenance hints

## Product Principles

### Operator-first

Critical status, alarms, and metrics take priority over visuals.

### 3D as context

The 3D scene explains spatial relationships: site, floor, hall, zone, aisle, rack, asset. It must not hide operational data.

### Alarm-driven workflow

Alarms are first-class. Selecting an alarm should select the affected asset, move/mark the 3D view, and open the relevant context panel.

### Progressive detail

Show summary first, then details on selection. Avoid forcing operators to scan dense panels before seeing risk.

### Resilient to partial backend data

If geometry, location, telemetry, or alarms are missing, show explicit empty states and safe fallbacks. Never crash.

## Success Criteria

- Login works against real backend.
- Command center loads in under 3 seconds locally.
- Facility hierarchy, scenes, assets, alarms, and telemetry are reachable.
- Operator can select asset in 3D and see details.
- Operator can open global alarms and jump to asset context.
- UI handles empty metrics and missing scene geometry.
- Interface looks enterprise/industrial, not toy/cyberpunk demo.
