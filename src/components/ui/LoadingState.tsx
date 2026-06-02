export type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-6 text-sm text-text-secondary">
      <span aria-hidden="true" className="h-3 w-3 animate-pulse rounded-full bg-primary" />
      <span>{label}</span>
    </div>
  );
}
