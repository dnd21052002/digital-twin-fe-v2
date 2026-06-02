import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('provides react query client for data routes', async () => {
    window.localStorage.setItem('twin.accessToken', 'token');
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ items: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })));

    render(<App />);

    expect(await screen.findByText(/twin controls/i)).toBeInTheDocument();
  });

  it('renders login by default when unauthenticated', () => {
    window.localStorage.clear();

    render(<App />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });
});
