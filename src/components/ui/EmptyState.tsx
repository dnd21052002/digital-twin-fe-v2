import type { ReactNode } from 'react';

export type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-hairline-strong bg-surface-1 p-8 text-center">
      <h2 className="text-card-title font-medium text-ink">{title}</h2>
      <p className="mt-2 text-body-sm text-ink-muted">{message}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
