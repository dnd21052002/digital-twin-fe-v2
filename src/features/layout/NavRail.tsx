import { NavLink } from 'react-router-dom';

import { useAlarmsQuery } from '../alarms/queries';

const links = [
  { to: '/twin', label: 'Twin', short: 'TW' },
  { to: '/alarms', label: 'Alarms', short: 'AL', badge: true },
  { to: '/telemetry', label: 'Telemetry', short: 'TM' },
  { to: '/assets', label: 'Assets', short: 'AS' },
];

function AlarmBadge() {
  const { data: alarms = [] } = useAlarmsQuery();
  if (alarms.length === 0) return null;
  return <span aria-label={`${alarms.length} open alarms`} className="rounded-full bg-critical px-2 py-0.5 text-caption font-medium text-on-primary">{alarms.length}</span>;
}

export function NavRail() {
  return (
    <nav aria-label="Primary command" className="w-56 shrink-0 bg-surface-1 px-3 py-4">
      <div className="mb-5 rounded-lg border border-hairline bg-surface-2 p-4">
        <p className="text-eyebrow text-primary">Ops Sectors</p>
        <p className="mt-1.5 text-body-sm font-medium text-ink">Live Facility Control</p>
        <p className="mt-1 text-caption text-ink-subtle leading-relaxed">Monitor assets, alarms, and telemetry from one command surface.</p>
      </div>
      <ul className="space-y-0.5">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `group flex min-h-9 items-center justify-between gap-3 rounded-md px-3 py-2 text-body-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-focus ${
                  isActive
                    ? 'bg-surface-2 text-ink'
                    : 'text-ink-subtle hover:bg-surface-2/60 hover:text-ink-muted'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-xs border border-hairline bg-surface-3 font-mono text-caption text-ink-subtle">{link.short}</span>
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
