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
    <section className={`rounded-2xl border border-white/[0.08] bg-bg-panel-soft p-5 shadow-2xl shadow-black/30 ring-1 ring-white/[0.03] backdrop-blur ${className}`}>
      {(title || subtitle || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            {title && <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-primary">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
