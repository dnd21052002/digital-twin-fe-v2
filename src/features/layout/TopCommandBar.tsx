import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../auth/authStore';
import { getUser } from '../auth/authStorage';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function operatorName() {
  const user = useAuthStore.getState().user ?? getUser();
  if (!user) return 'Unknown operator';
  return user.name || user.email || 'Authenticated operator';
}

export function TopCommandBar() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex h-[4.5rem] items-center justify-between border-b border-white/[0.06] bg-bg-panel-soft px-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-[color:var(--border-accent)] bg-primary-muted font-mono text-sm font-bold text-primary shadow-lg shadow-sky-950/30">DT</div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-text-primary">Twin@P.CN Command Center</p>
          <p className="mt-1 text-xs text-text-secondary">API {apiBase}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-text-secondary">Incidents 0</span>
        <span className="hidden rounded-full border border-white/[0.08] bg-bg-elevated px-3 py-1.5 text-xs text-text-secondary md:inline-flex">{operatorName()}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-white/[0.10] px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
