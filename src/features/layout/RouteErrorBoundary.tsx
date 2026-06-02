import { Link, useRouteError } from 'react-router-dom';

export function RouteErrorBoundary() {
  useRouteError();
  return (
    <main className="flex min-h-screen items-center justify-center bg-base p-6 text-text-primary">
      <section className="max-w-lg rounded-xl border border-border-subtle bg-bg-panel p-6 shadow-lg shadow-black/20">
        <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--primary)]">Route recovery</p>
        <h1 className="mt-3 text-2xl font-semibold">Command view unavailable</h1>
        <p className="mt-3 text-sm text-text-secondary">This workspace could not be opened safely. Return to a known command view and retry.</p>
        <Link className="mt-5 inline-flex rounded-lg bg-[color:var(--primary)] px-4 py-2 font-semibold text-black" to="/twin">Return to Twin workspace</Link>
      </section>
    </main>
  );
}
