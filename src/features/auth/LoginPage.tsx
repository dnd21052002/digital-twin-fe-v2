import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
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
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
        <p className="text-eyebrow text-primary">Twin@P.CN</p>
        <h1 className="mt-3 text-headline font-semibold tracking-tight">Sign in</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-body-sm font-medium text-ink-muted" htmlFor="identifier">Identifier</label>
            <input
              id="identifier"
              name="identifier"
              autoComplete="username"
              className="mt-1.5 w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-body-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              aria-invalid={Boolean(errors.identifier)}
              aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            />
            {errors.identifier ? <p id="identifier-error" className="mt-1.5 text-caption text-critical">{errors.identifier}</p> : null}
          </div>
          <div>
            <label className="block text-body-sm font-medium text-ink-muted" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-body-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password ? <p id="password-error" className="mt-1.5 text-caption text-critical">{errors.password}</p> : null}
          </div>
          {message ? <p role="alert" className="text-body-sm text-critical">{message}</p> : null}
          <Button className="w-full" size="lg" disabled={loading} type="submit">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </section>
    </main>
  );
}
