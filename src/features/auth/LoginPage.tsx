import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiRequest } from '../../lib/api/client';
import { normalizeLoginResponse } from '../../lib/api/normalizers';
import { useAuthStore } from './authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string | undefined; password?: string | undefined }>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = {
      identifier: identifier.trim() ? undefined : 'Identifier is required',
      password: password ? undefined : 'Password is required',
    };
    setErrors(nextErrors);
    setMessage('');
    if (nextErrors.identifier || nextErrors.password) return;

    setLoading(true);
    try {
      const response = await apiRequest<unknown>('/auth/login', {
        method: 'POST',
        auth: false,
        body: { identifier, password },
      });
      const login = normalizeLoginResponse(response);
      if (!login.tokens.accessToken) throw new Error('Login response did not include an access token');
      setSession(login.tokens, login.user);
      navigate('/twin', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-base text-[color:var(--text-primary)]">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--primary)]">Twin@P.CN</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Sign in</h1>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium" htmlFor="identifier">Identifier</label>
            <input
              id="identifier"
              name="identifier"
              autoComplete="username"
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              aria-invalid={Boolean(errors.identifier)}
              aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            />
            {errors.identifier ? <p id="identifier-error" className="mt-2 text-sm text-red-400">{errors.identifier}</p> : null}
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password ? <p id="password-error" className="mt-2 text-sm text-red-400">{errors.password}</p> : null}
          </div>
          {message ? <p role="alert" className="text-sm text-red-400">{message}</p> : null}
          <button className="w-full rounded-lg bg-[color:var(--primary)] px-4 py-2 font-semibold text-black disabled:opacity-60" disabled={loading} type="submit">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
