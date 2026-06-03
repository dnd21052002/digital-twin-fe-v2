import { Box, Radio, Activity, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAlarmsQuery } from '../alarms/queries';

const links = [
  { to: '/twin', label: 'Twin', icon: Box },
  { to: '/alarms', label: 'Alarms', icon: Radio, badge: true },
  { to: '/telemetry', label: 'Telemetry', icon: Activity },
  { to: '/assets', label: 'Assets', icon: Database },
];

function AlarmBadge() {
  const { data: alarms = [] } = useAlarmsQuery();
  if (alarms.length === 0) return null;
  return <span aria-label={`${alarms.length} open alarms`} className="rounded-pill bg-critical px-1.5 py-0.5 text-[10px] font-medium leading-none text-on-primary">{alarms.length}</span>;
}

export function NavRail() {
  return (
    <nav aria-label="Primary command" className="w-52 shrink-0 bg-surface-1 px-3 py-4">
      <div className="mb-5 rounded-lg border border-hairline bg-surface-2 p-4">
        <p className="text-eyebrow text-primary">Ops Sectors</p>
        <p className="mt-1.5 text-body-sm font-medium text-ink">Live Facility Control</p>
        <p className="mt-1 text-caption text-ink-subtle leading-relaxed">Monitor assets, alarms, and telemetry from one command surface.</p>
      </div>
      <ul className="space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `group flex min-h-9 items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-body-sm font-medium outline-none transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-focus ${
                  isActive
                    ? 'bg-surface-2 text-ink'
                    : 'text-ink-subtle hover:bg-surface-2/60 hover:text-ink-muted'
                }`
              }
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} strokeWidth={1.5} className="shrink-0 text-ink-tertiary" />
                <span>{link.label}</span>
              </span>
              {link.badge && <AlarmBadge />}
            </NavLink>
          </li>
        );
        })}
      </ul>
    </nav>
  );
}
