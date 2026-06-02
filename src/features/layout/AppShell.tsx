import type { ReactNode } from 'react';

import { NavRail } from './NavRail';
import { TopCommandBar } from './TopCommandBar';

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent text-text-primary">
      <TopCommandBar />
      <div className="flex min-h-[calc(100vh-4.5rem)]">
        <NavRail />
        <main className="flex-1 overflow-auto border-l border-white/[0.06] p-6">
          <div className="mx-auto max-w-[1640px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
