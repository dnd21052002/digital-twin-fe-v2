export type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 rounded-lg border border-hairline bg-surface-1 p-6 text-body-sm text-ink-muted">
      <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      <span>{label}</span>
    </div>
  );
}
