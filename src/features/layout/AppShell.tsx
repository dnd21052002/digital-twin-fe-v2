import type { ReactNode } from 'react';

import { NavRail } from './NavRail';
import { TopCommandBar } from './TopCommandBar';

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-base text-text-primary">
      <TopCommandBar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <NavRail />
        <main className="flex-1 overflow-auto border-l border-border-subtle bg-bg-page p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
