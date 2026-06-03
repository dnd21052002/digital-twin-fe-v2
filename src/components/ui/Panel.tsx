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
    <section className={`rounded-lg border border-hairline bg-surface-1 p-5 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-hairline pb-4">
          <div>
            {title && <h2 className="text-eyebrow font-medium uppercase tracking-wider text-ink">{title}</h2>}
            {subtitle && <p className="mt-1 text-caption text-ink-subtle">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
