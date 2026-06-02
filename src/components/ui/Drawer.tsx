import { useEffect, type ReactNode } from 'react';

import { Button } from './Button';

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className="h-full w-full max-w-xl overflow-y-auto border-l border-border-strong bg-bg-panel p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-5 flex items-center justify-between gap-4">
          <h2 id="drawer-title" className="text-lg font-semibold text-text-primary">{title}</h2>
          <Button variant="ghost" size="sm" iconOnly aria-label="Close drawer" onClick={onClose}>×</Button>
        </header>
        {children}
      </aside>
    </div>
  );
}
