import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearAuth, getAccessToken, getRefreshToken, getUser, setTokens, setUser } from '../authStorage';
import { LoginPage } from '../LoginPage';
import { ProtectedRoute } from '../ProtectedRoute';

describe('auth feature', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('requires identifier and password before submitting login', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/identifier is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stores login response and redirects to /twin', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            accessToken: 'access',
            refreshToken: 'refresh',
            user: { id: 'u1', name: 'Operator' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/twin" element={<h1>Twin home</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/identifier/i), { target: { value: 'operator@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByRole('heading', { name: /twin home/i })).toBeInTheDocument());
    expect(getAccessToken()).toBe('access');
    expect(getUser()).toMatchObject({ id: 'u1', name: 'Operator' });
  });

  it('redirects protected routes to login when access token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/twin']}>
        <Routes>
          <Route path="/login" element={<h1>Login route</h1>} />
          <Route path="/twin" element={<ProtectedRoute><h1>Private twin</h1></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /login route/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /private twin/i })).not.toBeInTheDocument();
  });

  it('renders protected content when an access token exists', () => {
    setTokens({ accessToken: 'access' });

    render(
      <MemoryRouter initialEntries={['/twin']}>
        <Routes>
          <Route path="/login" element={<h1>Login route</h1>} />
          <Route path="/twin" element={<ProtectedRoute><h1>Private twin</h1></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /private twin/i })).toBeInTheDocument();
  });

  it('does not throw when browser storage is unavailable', () => {
    const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', { configurable: true, value: undefined });

    expect(() => setTokens({ accessToken: 'access', refreshToken: 'refresh' })).not.toThrow();
    expect(() => setUser({ id: 'u1', name: 'Operator' })).not.toThrow();
    expect(() => clearAuth()).not.toThrow();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getUser()).toBeNull();

    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', originalLocalStorage);
    }
  });
});
