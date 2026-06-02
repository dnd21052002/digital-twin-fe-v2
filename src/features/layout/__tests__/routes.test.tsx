import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../../../router';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../../auth/authStorage';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe('command center routes', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ items: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('redirects protected twin workspace to login when no token exists', async () => {
    renderAt('/twin');

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/identifier/i)).toBeInTheDocument();
  });

  it('renders shell navigation and top command bar for authenticated twin workspace', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, 'test-token');
    window.localStorage.setItem(USER_KEY, JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.test' }));

    renderAt('/twin');

    expect(await screen.findByRole('banner')).toHaveTextContent('Twin@P.CN Command Center');
    expect(screen.getByRole('navigation', { name: /primary command/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent(/3D Digital Twin Workspace/i);
    expect(screen.getByText(/API http:\/\/localhost:3000\/api\/v1/i)).toBeInTheDocument();
    expect(screen.getByText(/Ada Lovelace/i)).toBeInTheDocument();
  });

  it('exposes command center nav links', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, 'test-token');

    renderAt('/twin');

    expect(await screen.findByRole('link', { name: /twin/i })).toHaveAttribute('href', '/twin');
    expect(screen.getByRole('link', { name: /alarms/i })).toHaveAttribute('href', '/alarms');
    expect(screen.getByRole('link', { name: /telemetry/i })).toHaveAttribute('href', '/telemetry');
    expect(screen.getByRole('link', { name: /assets/i })).toHaveAttribute('href', '/assets');
  });

  it('logs out, clears auth tokens, and returns to login', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, 'test-token');
    window.localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token');
    window.localStorage.setItem(USER_KEY, JSON.stringify({ email: 'operator@example.test' }));

    renderAt('/twin');
    fireEvent.click(await screen.findByRole('button', { name: /logout/i }));

    await waitFor(() => expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument());
    expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(window.localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(window.localStorage.getItem(USER_KEY)).toBeNull();
  });
});
