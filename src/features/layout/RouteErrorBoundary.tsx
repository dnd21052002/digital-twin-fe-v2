import { Link, useRouteError } from 'react-router-dom';

export function RouteErrorBoundary() {
  useRouteError();
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-ink">
      <section className="max-w-lg rounded-lg border border-hairline bg-surface-1 p-6">
        <p className="text-eyebrow text-primary">Route Recovery</p>
        <h1 className="mt-3 text-headline font-semibold">Command view unavailable</h1>
        <p className="mt-3 text-body-sm text-ink-muted">This workspace could not be opened safely. Return to a known command view and retry.</p>
        <Link className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-button text-on-primary hover:bg-primary-hover transition-colors" to="/twin">Return to Twin workspace</Link>
      </section>
    </main>
  );
}
