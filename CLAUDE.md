Bạn là senior frontend engineer + product UI/UX designer
  cho Twin@P.CN Digital Twin.

  Repo làm việc:
  ~/Developer/twin-database/frontend-v2

  Mục tiêu:
  Build frontend v2 thành operator-grade Digital Twin Command
  Center cho data-center operations.

  Đọc tài liệu trước khi code, theo thứ tự:
  1. README.md
  2. docs/PRODUCT_VISION.md
  3. docs/UX_ARCHITECTURE.md
  4. docs/DESIGN_SYSTEM.md
  5. docs/COMMAND_CENTER.md
  6. docs/THREE_D_SCENE.md
  7. docs/ALARMS.md
  8. docs/TELEMETRY.md
  9. docs/IMPLEMENTATION_PLAN.md

  Backend:
  - Base URL: http://localhost:3000/api/v1
  - Auth:
    - POST /auth/login
    - POST /auth/logout
    - POST /auth/refresh
    - GET /me
  - Core:
    - GET /facility/tree
    - GET /scenes
    - GET /scenes/{sceneId}/manifest
    - GET /assets
    - GET /assets/{assetId}
  - Telemetry:
    - GET /assets/{assetId}/metrics/latest
    - GET /assets/{assetId}/metrics/timeseries?metric=<metric
  Key>&from=<iso>&to=<iso>&limit=1000
  - Alarms:
    - GET /alarms
    - GET /alarms/{alarmId}

  Credentials:
  - identifier: admin hoặc admin@example.com
  - password: Admin@123456

  Important:
  - Không hardcode mock nếu backend có API thật.
  - Cho phép procedural fallback khi backend thiếu
  geometry/scene asset positions.
  - Không log token/password/auth headers.
  - Tất cả protected request phải gắn Authorization: Bearer
  accessToken.
  - Implement refresh retry 1 lần khi 401.
  - Backend response có thể lệch docs một chút. Normalize ở
  API adapter boundary.
  - Không render raw object vào React text node. Luôn convert
  bằng display helper.
  - Every async UI: loading, empty, error, retry.
  - Every operator-critical UI: accessible labels, focus
  states, keyboard-safe.
  - Dark industrial command-center design, không
  toy/cyberpunk quá mức.

  Recommended stack:
  Vite + React + TypeScript + React Router + TanStack Query +
  Zustand + Tailwind CSS + shadcn/ui + React Three Fiber +
  Drei + Recharts.

  Execution plan:
  Follow docs/IMPLEMENTATION_PLAN.md.

  High-level order:
  1. UI-1 — Design System Cleanup
     - tokens
     - reusable panel/card/badge/button/table states
     - remove raw one-off styles

  2. UI-2 — Command Center Shell
     - left nav rail
     - top status bar
     - central 3D workspace
     - right inspector
     - global drawer system

  3. UI-3 — 3D Realism
     - procedural data-center layout
     - row/aisle/rack grouping
     - category-specific geometry
     - alarm beacons/layers

  4. UI-4 — Alarms + Telemetry Productization
     - full alarm center
     - full telemetry center
     - chart thresholds/anomaly markers
     - detail/timeline/SOP placeholders

  5. UI-5 — Model Pipeline
     - GLTF registry
     - category model mapping
     - instancing/LOD/perf

  Build UI-1 → UI-4 first. Do not prioritize GLTF models
  before information architecture and operator workflows.

  Implementation requirements:
  - Scaffold app if not present.
  - Use TypeScript strict.
  - Centralize API client.
  - Centralize auth storage.
  - Use TanStack Query for server state.
  - Use Zustand for viewer/ui selection state.
  - Use React Router routes:
    - /login
    - /twin
    - /alarms
    - /telemetry
    - /assets
    - /assets/:assetId
    - /scenes/:sceneId
  - Add route error boundary.
  - Add Dockerfile + nginx.conf + .dockerignore.
  - Serve SPA via Nginx.
  - /health returns ok.
  - Docker image tag: twin-frontend-app:v2
  - Container name: twin-frontend-app
  - Host port: 8080
  - Container port: 80

  Critical UX deliverables:
  - Login with real backend.
  - Command Center loads after auth.
  - Facility tree loads real data.
  - Scene selector loads real scenes.
  - Scene manifest supports both:
    - ideal manifest with assets[]
    - backend manifest shape { scene, meshes, textures }
  - If manifest lacks asset positions, synthesize data-center
  layout from /assets and /facility/tree.
  - 3D scene has:
    - floor tiles
    - aisles/rows
    - racks/servers/sensors/cooling placeholders
    - status color
    - selected outline
    - alarm beacons
    - reduced label clutter
  - Asset click opens right inspector:
    - tag/name/category/status/location/model/serial
    - latest metrics
    - timeseries chart
    - related alarms
  - Alarm Center:
    - list alarms
    - filter severity/state
    - click alarm opens detail
    - linked asset selected/focused
    - show timeline/rule/current/threshold/SOP placeholder
  - Telemetry Center:
    - latest metric cards
    - metric selector
    - 1h/6h/24h trend
    - empty state if no telemetry
    - chart error/retry
  - Design must feel enterprise/operator-grade.

  Quality gates before claiming done:
  Run and report exact outputs:
  - npm install
  - npm run lint
  - npm run typecheck
  - npm run test
  - npm run build
  - docker build -t twin-frontend-app:v2 .
  - docker rm -f twin-frontend-app || true
  - docker run -d --name twin-frontend-app -p 8080:80
  twin-frontend-app:v2
  - curl http://localhost:8080/health
  - curl -I http://localhost:8080

  Manual smoke:
  - Open http://localhost:8080
  - Login admin/Admin@123456
  - Open /twin
  - Verify facility/scenes/assets load
  - Click asset in 3D
  - Verify details + metrics + chart + alarms
  - Open Alarm Center
  - Click alarm and verify asset context
  - Open Telemetry Center
  - Logout

  Git:
  - Work only inside ~/Developer/twin-database/frontend-v2.
  - Do not modify backend.
  - Do not commit .env.local, node_modules, dist, coverage.
  - Commit after each major phase.
  - End commit messages with:
    Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>

  Output expected:
  - Running Docker frontend at http://localhost:8080
  - Updated docs if implementation decisions change
  - Brief summary of screens/components built
  - Exact verification command outputs
  - Git branch + commit hashes

  Optional shorter “autonomous” add-on:

  Work autonomously. If requirements are ambiguous, choose
  the option that best matches operator-grade enterprise UX
  and document the assumption. Do not stop for minor
  questions. Stop only for destructive actions, missing
  backend, or decisions that materially change scope.