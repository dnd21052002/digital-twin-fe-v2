import { Outlet, type RouteObject } from 'react-router-dom';

import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { AlarmsPage } from './features/alarms/AlarmsPage';
import { AssetsPage } from './features/assets/AssetsPage';
import { AssetDetailPage } from './features/assets/AssetDetailPage';
import { AppShell } from './features/layout/AppShell';
import { DefaultRoute } from './features/layout/DefaultRoute';
import { RouteErrorBoundary } from './features/layout/RouteErrorBoundary';
import { ScenePage } from './features/scene/ScenePage';
import { TelemetryPage } from './features/telemetry/TelemetryPage';
import { TwinPage } from './features/twin/TwinPage';
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  { path: '/', element: <DefaultRoute />, errorElement: <RouteErrorBoundary /> },
  {
    element: (
      <ProtectedRoute>
        <AppShell>
          <Outlet />
        </AppShell>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/twin', element: <TwinPage /> },
      { path: '/alarms', element: <AlarmsPage /> },
      { path: '/telemetry', element: <TelemetryPage /> },
      { path: '/assets', element: <AssetsPage /> },
      { path: '/assets/:assetId', element: <AssetDetailPage /> },
      { path: '/scenes/:sceneId', element: <ScenePage /> },
    ],
  },
  { path: '*', element: <DefaultRoute />, errorElement: <RouteErrorBoundary /> },
];
