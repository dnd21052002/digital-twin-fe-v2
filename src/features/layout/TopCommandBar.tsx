import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
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
    <header className="flex h-14 items-center justify-between border-b border-hairline bg-canvas px-5">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 border border-hairline font-mono text-caption font-semibold text-primary">DT</div>
        <div>
          <p className="text-body-sm font-medium text-ink">Twin@P.CN Command Center</p>
          <p className="text-caption text-ink-tertiary">{apiBase}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-md border border-hairline bg-surface-1 px-2.5 py-1 text-caption text-ink-subtle md:inline-flex">{operatorName()}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}
