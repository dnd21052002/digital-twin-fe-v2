import type { ReactNode } from 'react';

import { NavRail } from './NavRail';
import { TopCommandBar } from './TopCommandBar';

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopCommandBar />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <NavRail />
        <main className="flex-1 overflow-auto border-l border-hairline p-6">
          <div className="mx-auto max-w-[1640px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
