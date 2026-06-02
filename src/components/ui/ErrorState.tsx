import { Button } from './Button';

export type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-xl border border-critical/40 bg-critical/10 p-6 text-center">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{message}</p>
      {onRetry && <Button className="mt-4" variant="danger" onClick={onRetry}>Retry</Button>}
    </div>
  );
}
