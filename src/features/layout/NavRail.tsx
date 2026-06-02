import { NavLink } from 'react-router-dom';

import { useAlarmsQuery } from '../alarms/queries';

const links = [
  { to: '/twin', label: 'Twin', short: 'TW' },
  { to: '/alarms', label: 'Alarms', short: 'AL', badge: true },
  { to: '/telemetry', label: 'Telemetry', short: 'TM' },
  { to: '/assets', label: 'Assets', short: 'AS' },
];

function AlarmBadge() {
  const { data: alarms = [] } = useAlarmsQuery({ status: 'open' });
  if (alarms.length === 0) return null;
  return <span aria-label={`${alarms.length} open alarms`} className="rounded-full bg-critical px-2 py-0.5 text-xs font-bold text-white">{alarms.length}</span>;
}

export function NavRail() {
  return (
    <nav aria-label="Primary command" className="w-64 shrink-0 bg-bg-panel-soft px-4 py-5 backdrop-blur">
      <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary">Ops sectors</p>
        <p className="mt-2 text-sm font-semibold text-text-primary">Live facility control</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">Monitor assets, alarms, and telemetry from one command surface.</p>
      </div>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `group flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] ${
                  isActive
                    ? 'border-[color:var(--border-accent)] bg-primary-muted text-text-primary shadow-lg shadow-sky-950/30'
                    : 'border-transparent text-text-secondary hover:border-white/[0.10] hover:bg-white/[0.04] hover:text-text-primary'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] bg-bg-elevated font-mono text-[0.68rem] text-primary">{link.short}</span>
                <span>{link.label}</span>
              </span>
              {link.badge && <AlarmBadge />}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
