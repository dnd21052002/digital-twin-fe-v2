# Design System

## Style Direction

Industrial dark command center.

Avoid excessive neon, random glows, and toy-like cyberpunk styling. Use contrast, spacing, and status color discipline.

## Color Tokens

```css
:root {
  --bg-base: #050A12;
  --bg-surface: #0A1220;
  --bg-elevated: #101B2D;
  --bg-panel: #0B1524;

  --border-subtle: #1E2B3D;
  --border-strong: #2B3D52;

  --text-primary: #E6EEF8;
  --text-secondary: #8EA3B8;
  --text-muted: #4F6478;

  --primary: #14B8FF;
  --success: #00C896;
  --warning: #F59E0B;
  --critical: #EF4444;
  --maintenance: #8B5CF6;
  --unknown: #64748B;
}
```

## Status Semantics

| Status | Color | Use |
| --- | --- | --- |
| Critical/Error | `--critical` | Critical alarms, offline/error assets |
| Warning | `--warning` | Warning alarms, elevated metrics |
| Normal/Online | `--success` | healthy assets and metrics |
| Maintenance | `--maintenance` | maintenance state |
| Unknown/Inactive | `--unknown` | missing/unknown data |

Do not rely on color only. Include labels/icons.

## Typography

Recommended:

- UI font: Inter or Geist Sans
- Numeric/data font: JetBrains Mono or IBM Plex Mono

Rules:

- body text >= 13-14px desktop
- labels can be 10-11px only with high contrast
- use tabular numbers for metrics
- avoid all-caps except compact labels

## Spacing

Use 4/8px rhythm:

```text
4, 8, 12, 16, 24, 32, 48
```

Panel padding:

- compact controls: 8-12px
- panels/cards: 16px
- page sections: 24px

## Component Primitives

Create shared primitives:

```text
components/ui/Button.tsx
components/ui/Panel.tsx
components/ui/StatusBadge.tsx
components/ui/MetricCard.tsx
components/ui/EmptyState.tsx
components/ui/LoadingState.tsx
components/ui/ErrorState.tsx
components/ui/DataTable.tsx
components/ui/Drawer.tsx
components/ui/Tabs.tsx
```

## Interaction States

Each interactive element needs:

- default
- hover
- focus-visible
- active/pressed
- selected
- disabled

Focus ring:

```css
outline: 2px solid var(--primary);
outline-offset: 2px;
```

## Motion

- micro-interactions: 150-250ms
- drawers: 200-300ms
- use transform/opacity only
- respect `prefers-reduced-motion`

## Accessibility

- text contrast >= 4.5:1 where possible
- icon-only buttons require `aria-label`
- tables/lists keyboard navigable
- errors include recovery action
- no raw stack trace in operator UI
