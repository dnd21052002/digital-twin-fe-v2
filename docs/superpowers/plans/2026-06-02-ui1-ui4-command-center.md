# UI-1 to UI-4 Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Twin@P.CN frontend v2 from docs into operator-grade Digital Twin Command Center through UI-4: design system, command shell, 3D procedural scene, alarms, telemetry, Docker.

**Architecture:** Scaffold Vite React TS app. Keep API normalization at `src/lib/api/*`, auth at `src/features/auth/*`, shared UI primitives at `src/components/ui/*`, command workspace at `src/features/twin/*`, 3D scene at `src/features/scene/*`, alarms/telemetry/assets as focused feature folders. Use TanStack Query for server state, Zustand for selected scene/asset/alarm/layers.

**Tech Stack:** Vite, React, TypeScript strict, React Router, TanStack Query, Zustand, Tailwind CSS, React Three Fiber, Drei, Recharts, Vitest, Testing Library, Docker, Nginx.

---

## File Structure

- Create `package.json` — scripts/deps.
- Create `vite.config.ts`, `tsconfig*.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html` — build config.
- Create `Dockerfile`, `nginx.conf`, `.dockerignore`, `.env.example` — SPA container + `/health`.
- Create `src/main.tsx`, `src/App.tsx`, `src/router.tsx` — app bootstrap/routes/error boundary.
- Create `src/styles/index.css`, `src/styles/tokens.css` — design tokens + Tailwind base.
- Create `src/components/ui/*.tsx` — Button, Panel, StatusBadge, MetricCard, states, Drawer, DataTable, Tabs.
- Create `src/lib/api/client.ts` — fetch wrapper with Authorization + refresh retry once.
- Create `src/lib/api/normalizers.ts` — backend shape adapters; no raw object rendering.
- Create `src/lib/api/types.ts` — shared domain types.
- Create `src/features/auth/*` — login, auth store/storage, protected route.
- Create `src/features/layout/*` — AppShell, top bar, nav rail.
- Create `src/features/twin/*` — `/twin` command center shell, facility tree, scene selector, inspector.
- Create `src/features/scene/*` — R3F scene, procedural layout, geometry, beacons/layers.
- Create `src/features/alarms/*` — `/alarms`, list/filter/detail, related alarms.
- Create `src/features/telemetry/*` — `/telemetry`, metric cards/chart/range.
- Create `src/features/assets/*` — `/assets`, `/assets/:assetId`, search/list/detail.
- Create tests under `src/**/__tests__/*.test.tsx` and `src/lib/api/__tests__/*.test.ts`.

---

### Task 1: Scaffold app + tooling

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.env.example`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `src/styles/tokens.css`

- [ ] **Step 1: Create package manifest**

`package.json` must include scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Deps: `@vitejs/plugin-react`, `typescript`, `vite`, `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `tailwindcss`, `postcss`, `autoprefixer`, `@react-three/fiber`, `@react-three/drei`, `three`, `recharts`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.

- [ ] **Step 2: Add strict TypeScript config**

Use `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `jsx: react-jsx`.

- [ ] **Step 3: Add Tailwind + tokens**

`src/styles/tokens.css` defines docs tokens:

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

- [ ] **Step 4: Verify scaffold**

Run: `npm install`
Expected: dependencies installed, no lockfile conflict.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.ts postcss.config.js index.html .env.example src
git commit -m "chore: scaffold frontend app

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: UI-1 design primitives

**Files:**
- Create: `src/components/ui/Button.tsx`, `Panel.tsx`, `StatusBadge.tsx`, `MetricCard.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx`, `Drawer.tsx`, `DataTable.tsx`, `Tabs.tsx`
- Create: `src/lib/display.ts`, `src/lib/status.ts`
- Test: `src/components/ui/__tests__/states.test.tsx`, `src/lib/__tests__/display.test.ts`

- [ ] **Step 1: Test display helper**

```ts
import { describe, expect, it } from 'vitest';
import { displayText } from '../display';

describe('displayText', () => {
  it('converts objects safely', () => {
    expect(displayText({ code: 'RACK', name: 'Rack' })).toBe('Rack');
  });
  it('uses fallback for nullish values', () => {
    expect(displayText(null)).toBe('—');
  });
});
```

- [ ] **Step 2: Implement `displayText`**

Rules: string/number/boolean as string; object prefer `name`, `label`, `title`, `code`, `id`; else `—`.

- [ ] **Step 3: Implement UI primitives**

Each primitive must expose accessible labels/focus states. `ErrorState` accepts `title`, `message`, `onRetry`. `LoadingState` accepts `label`. `EmptyState` accepts `title`, `message`, optional action.

- [ ] **Step 4: Test async state rendering**

Render Loading/Empty/Error, assert text + retry button accessible.

- [ ] **Step 5: Verify + commit**

Run: `npm run test -- src/components/ui src/lib`
Expected: PASS.

Commit: `feat: add command center design primitives` with required co-author.

---

### Task 3: Auth + API foundation

**Files:**
- Create: `src/lib/api/types.ts`, `src/lib/api/client.ts`, `src/lib/api/normalizers.ts`, `src/lib/api/__tests__/client.test.ts`, `normalizers.test.ts`
- Create: `src/features/auth/authStorage.ts`, `authStore.ts`, `LoginPage.tsx`, `ProtectedRoute.tsx`, `__tests__/auth.test.tsx`

- [ ] **Step 1: Test API refresh retry**

Mock `fetch`: first protected request returns 401, refresh returns tokens, retry returns JSON. Assert two protected calls, one refresh call, Authorization header included only with access token.

- [ ] **Step 2: Implement auth storage**

Use localStorage keys `twin.accessToken`, `twin.refreshToken`, `twin.user`. No token/password logging.

- [ ] **Step 3: Implement API client**

`apiRequest<T>(path, options)` uses `VITE_API_BASE_URL || http://localhost:3000/api/v1`; attaches `Authorization: Bearer <token>` for protected requests; on 401 and refresh token exists, POST `/auth/refresh`, save new tokens, retry once.

- [ ] **Step 4: Implement normalizers**

Normalize `category` object/string, `status`, ids, list containers (`items`, `data`, arrays). Scene manifest accepts ideal `assets[]` or `{ scene, meshes, textures }` and yields empty `assets` if missing.

- [ ] **Step 5: Implement login/protected route**

`LoginPage` posts `/auth/login`, accepts `identifier`, `password`, saves tokens/user, redirects `/twin`. Protected routes redirect `/login` if no access token.

- [ ] **Step 6: Verify + commit**

Run: `npm run test -- src/lib/api src/features/auth`
Expected: PASS.

Commit: `feat: add auth and api foundation` with required co-author.

---

### Task 4: Routing + command shell UI-2

**Files:**
- Create: `src/router.tsx`, `src/features/layout/AppShell.tsx`, `TopCommandBar.tsx`, `NavRail.tsx`, `RouteErrorBoundary.tsx`
- Create/Modify: `src/App.tsx`
- Create placeholders: `src/features/twin/TwinPage.tsx`, `src/features/alarms/AlarmsPage.tsx`, `src/features/telemetry/TelemetryPage.tsx`, `src/features/assets/AssetsPage.tsx`, `AssetDetailPage.tsx`, `src/features/scene/ScenePage.tsx`
- Test: `src/features/layout/__tests__/routes.test.tsx`

- [ ] **Step 1: Test protected route redirect**

Render memory router at `/twin` with empty storage; expect login form.

- [ ] **Step 2: Implement route map**

Routes: `/login`, `/twin`, `/alarms`, `/telemetry`, `/assets`, `/assets/:assetId`, `/scenes/:sceneId`. Add error boundary with operator-safe message + retry link.

- [ ] **Step 3: Implement shell**

Desktop layout: top bar, left nav rail, main content. Nav includes Twin, Alarms, Telemetry, Assets. Top bar includes app name, backend status label, incident count placeholder, logout.

- [ ] **Step 4: Verify + commit**

Run: `npm run test -- src/features/layout`
Expected: PASS.

Commit: `feat: add command center shell` with required co-author.

---

### Task 5: Core backend queries + viewer store

**Files:**
- Create: `src/features/twin/viewerStore.ts`, `queries.ts`, `FacilityTree.tsx`, `SceneSelector.tsx`, `AssetInspector.tsx`, `TwinPage.tsx`
- Create: `src/features/assets/AssetSearch.tsx`, `AssetsPage.tsx`, `AssetDetailPage.tsx`
- Test: `src/features/twin/__tests__/queries.test.ts`, `viewerStore.test.ts`

- [ ] **Step 1: Test store behavior**

Assert `selectAlarm(id, assetId)` sets `selectedAlarmId` and `selectedAssetId`; layer toggle adds/removes `thermal`, `airflow`, `power`, `xray`, `alarm`.

- [ ] **Step 2: Implement Zustand viewer store**

State: `selectedSceneId`, `selectedAssetId`, `selectedAlarmId`, `layers`, `drawer`. Actions: select scene/asset/alarm, toggle layer, open/close drawer.

- [ ] **Step 3: Implement TanStack queries**

Queries for `/facility/tree`, `/scenes`, `/scenes/{sceneId}/manifest`, `/assets?limit=50`, `/assets/{assetId}`. Use normalizers. Every component renders loading/empty/error/retry.

- [ ] **Step 4: Implement Twin layout**

Left: scene selector, facility tree, asset search, layer toggles. Center: 3D placeholder until Task 6. Right: inspector showing no selection or asset identity.

- [ ] **Step 5: Verify + commit**

Run: `npm run test -- src/features/twin`
Expected: PASS.

Commit: `feat: wire core backend data` with required co-author.

---

### Task 6: UI-3 procedural 3D scene

**Files:**
- Create: `src/features/scene/layout.ts`, `SceneCanvas.tsx`, `AssetMesh.tsx`, `AlarmBeacon.tsx`, `LayerOverlays.tsx`, `SceneLabels.tsx`
- Test: `src/features/scene/__tests__/layout.test.ts`

- [ ] **Step 1: Test fallback layout priority**

Given manifest assets with positions, output preserves positions. Given assets with `rackPosition`, group into rows. Given no location, place in `Unplaced` zone.

- [ ] **Step 2: Implement layout builder**

`buildSceneLayout({ manifest, assets, facilityTree })` returns nodes with `assetId`, `label`, `category`, `status`, `position`, `rotation`, `zoneLabel`, `rowLabel`. Priority: real positions → rackPosition-derived → synthesized hall/row grid → unplaced.

- [ ] **Step 3: Implement 3D objects**

Rack: tall dark cabinet + grid door + status strip. Server: short blade block. Sensor: small glowing marker. Cooling: larger floor unit. PDU: narrow module. Selected asset gets outline/ring. Labels show row/aisle always; asset labels on hover/selection.

- [ ] **Step 4: Implement layers + beacons**

Alarm beacons: critical red pulse, warning amber marker, acknowledged muted marker; respect `prefers-reduced-motion`. Thermal plane, airflow arrows, power lines, xray wireframe toggled by store.

- [ ] **Step 5: Wire Twin center**

Replace placeholder with `SceneCanvas`; click asset → `selectAsset(assetId)` → inspector opens. Scene loads manifest + assets; no geometry fallback message visible.

- [ ] **Step 6: Verify + commit**

Run: `npm run test -- src/features/scene`
Expected: PASS.

Commit: `feat: add procedural 3d command scene` with required co-author.

---

### Task 7: UI-4 Alarm Center

**Files:**
- Create: `src/features/alarms/queries.ts`, `AlarmsPage.tsx`, `AlarmList.tsx`, `AlarmDetail.tsx`, `AlarmFilters.tsx`, `RelatedAlarms.tsx`
- Test: `src/features/alarms/__tests__/alarms.test.tsx`

- [ ] **Step 1: Test alarm selection behavior**

Render alarm list with asset-linked alarm; click row; assert store has `selectedAlarmId` and `selectedAssetId`.

- [ ] **Step 2: Implement alarm queries**

Use `/alarms?limit=50`, `/alarms?assetId=<assetId>&limit=50`, `/alarms/{alarmId}`. Normalize severity/state/title/message/current/threshold/asset.

- [ ] **Step 3: Implement filters/list**

Severity tabs All/Critical/Warning/Info; state filter New/Acknowledged/Resolved; search title/asset/rule; sort critical first, newest first.

- [ ] **Step 4: Implement detail + related alarms**

Detail sections: header, affected asset card, current/threshold, rule info, location, timeline, SOP/camera placeholders. Related alarms in inspector filtered by selected asset.

- [ ] **Step 5: Wire nav count + 3D focus**

Nav badge shows alarm count. Selecting alarm from page or inspector focuses linked asset in store and opens alarm detail.

- [ ] **Step 6: Verify + commit**

Run: `npm run test -- src/features/alarms`
Expected: PASS.

Commit: `feat: add alarm center workflows` with required co-author.

---

### Task 8: UI-4 Telemetry Center

**Files:**
- Create: `src/features/telemetry/queries.ts`, `TelemetryPage.tsx`, `LatestMetricCards.tsx`, `MetricTrendChart.tsx`, `MetricRangeTabs.tsx`
- Test: `src/features/telemetry/__tests__/telemetry.test.tsx`

- [ ] **Step 1: Test empty/no selected asset state**

Render `/telemetry` with no selected asset; expect prompt to select asset. Render selected asset with empty metrics; expect no telemetry empty state.

- [ ] **Step 2: Implement latest metrics**

Fetch `/assets/{assetId}/metrics/latest`; show cards with name/value/unit/quality/timestamp. Map quality: 0 success, 1 warning, 2+ muted/critical.

- [ ] **Step 3: Implement trend chart**

Metric selector defaults first metric. Range tabs 1h/6h/24h compute ISO from/to. Fetch `/assets/{assetId}/metrics/timeseries?metric=<metricKey>&from=<iso>&to=<iso>&limit=1000`. Recharts line chart with unit axis/tooltip; empty/error/loading/retry.

- [ ] **Step 4: Add alarm markers/threshold placeholders**

If related alarms have timestamps in range, render reference markers. If alarm threshold exists for metric, render threshold reference line.

- [ ] **Step 5: Verify + commit**

Run: `npm run test -- src/features/telemetry`
Expected: PASS.

Commit: `feat: add telemetry center` with required co-author.

---

### Task 9: Asset routes + deep links

**Files:**
- Modify: `src/features/assets/*`, `src/features/twin/TwinPage.tsx`, `src/features/twin/viewerStore.ts`, `src/router.tsx`
- Test: `src/features/assets/__tests__/assets.test.tsx`, `src/features/twin/__tests__/deepLinks.test.tsx`

- [ ] **Step 1: Test query sync**

Open `/twin?sceneId=s1&assetId=a1&alarmId=al1&layer=thermal`; assert store initialized with those values and thermal layer enabled.

- [ ] **Step 2: Implement URL sync**

Twin reads query params on mount; store updates push query params without full reload.

- [ ] **Step 3: Implement assets list/detail**

`/assets` shows searchable table by asset tag/name/category/status. `/assets/:assetId` shows identity, selected metrics, related alarms, link to `/twin?assetId=<id>`.

- [ ] **Step 4: Verify + commit**

Run: `npm run test -- src/features/assets src/features/twin`
Expected: PASS.

Commit: `feat: add assets and deep links` with required co-author.

---

### Task 10: Docker + final verification

**Files:**
- Create: `Dockerfile`, `nginx.conf`, `.dockerignore`
- Modify: docs only if implementation decisions differ.

- [ ] **Step 1: Add Dockerfile**

Multi-stage: Node build → nginx serve `/usr/share/nginx/html`.

- [ ] **Step 2: Add nginx config**

SPA fallback `try_files $uri $uri/ /index.html;`; `/health` returns `ok` with `text/plain`.

- [ ] **Step 3: Run full verification**

Run and record exact output:

```bash
npm install
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

Expected: lint/typecheck/test/build pass; health outputs `ok`; `curl -I` returns HTTP 200.

- [ ] **Step 4: Manual smoke**

Open `http://localhost:8080`; login `admin/Admin@123456`; open `/twin`; verify facility/scenes/assets load; click asset in 3D; verify details + metrics + chart + alarms; open Alarm Center; click alarm; verify asset context; open Telemetry Center; logout.

- [ ] **Step 5: Commit**

Commit: `chore: add docker deployment` with required co-author.

---

## Self-Review

- Spec coverage: UI-1 design primitives Task 2; UI-2 shell Tasks 4-5; UI-3 procedural scene Task 6; UI-4 alarms/telemetry Tasks 7-8; asset/deep links Task 9; Docker/verification Task 10.
- Placeholder scan: no `TBD`; GLTF excluded per docs; SOP/camera explicitly placeholders because docs require placeholders.
- Type consistency: API/domain types centralized in Task 3; store names used consistently: `selectedSceneId`, `selectedAssetId`, `selectedAlarmId`, `layers`.
