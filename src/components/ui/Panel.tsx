import type { ReactNode } from 'react';

export type PanelProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, subtitle, actions, children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-xl border border-border-subtle bg-bg-panel p-5 shadow-lg shadow-black/20 ${className}`}>
      {(title || subtitle || actions) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
