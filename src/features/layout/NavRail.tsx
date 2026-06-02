import { NavLink } from 'react-router-dom';

const links = [
  { to: '/twin', label: 'Twin' },
  { to: '/alarms', label: 'Alarms' },
  { to: '/telemetry', label: 'Telemetry' },
  { to: '/assets', label: 'Assets' },
];

export function NavRail() {
  return (
    <nav aria-label="Primary command" className="w-60 shrink-0 bg-bg-panel px-3 py-5">
      <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Sectors</div>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] ${
                  isActive
                    ? 'border-[color:var(--primary)] bg-[color:var(--primary-muted)] text-text-primary'
                    : 'border-transparent text-text-secondary hover:border-border-strong hover:bg-white/5 hover:text-text-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
