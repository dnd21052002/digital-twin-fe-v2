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
    <header className="flex h-16 items-center justify-between border-b border-border-subtle bg-bg-panel px-5 shadow-lg shadow-black/20">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Twin@P.CN Command Center</p>
        <p className="text-xs text-text-secondary">API {apiBase}</p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full border border-border-subtle bg-white/5 px-3 py-1 text-text-secondary">Incidents 0</span>
        <span className="text-text-secondary">{operatorName()}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-border-strong px-3 py-2 font-semibold text-text-primary hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
