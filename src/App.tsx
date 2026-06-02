import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

function TwinShell() {
  return (
    <main className="min-h-screen bg-base text-[color:var(--text-primary)]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--primary)]">
          Twin@P.CN
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Digital Twin Command Center
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[color:var(--text-secondary)]">
          Operator-grade frontend scaffold ready for UI-1 through UI-4 implementation.
        </p>
      </section>
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TwinShell />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/twin"
          element={
            <ProtectedRoute>
              <TwinShell />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/twin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
