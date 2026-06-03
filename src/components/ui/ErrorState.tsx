import { Button } from './Button';

export type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-lg border border-critical/30 bg-critical/5 p-6 text-center">
      <h2 className="text-card-title font-medium text-ink">{title}</h2>
      <p className="mt-2 text-body-sm text-ink-muted">{message}</p>
      {onRetry && <Button className="mt-4" variant="danger" onClick={onRetry}>Retry</Button>}
    </div>
  );
}
