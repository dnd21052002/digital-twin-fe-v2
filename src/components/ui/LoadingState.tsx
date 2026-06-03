export type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 rounded-lg border border-hairline bg-surface-1 p-5">
      <div className="flex items-center gap-3">
        <div className="skeleton h-3 w-3 rounded-full" />
        <span className="text-body-sm text-ink-muted">{label}</span>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
