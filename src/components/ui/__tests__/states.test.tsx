import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState, ErrorState, LoadingState } from '..';

describe('command center states', () => {
  it('renders an accessible loading status with label', () => {
    render(<LoadingState label="Syncing telemetry" />);

    expect(screen.getByRole('status')).toHaveTextContent('Syncing telemetry');
  });

  it('renders empty state title, message, and optional action', () => {
    render(
      <EmptyState
        title="No assets found"
        message="Adjust filters to show more assets."
        action={<button type="button">Clear filters</button>}
      />,
    );

    expect(screen.getByText('No assets found')).toBeVisible();
    expect(screen.getByText('Adjust filters to show more assets.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  });

  it('renders error state without stack trace and exposes retry button', async () => {
    const retry = vi.fn();

    render(
      <ErrorState
        title="Telemetry unavailable"
        message="Try again after the gateway reconnects."
        onRetry={retry}
      />,
    );

    expect(screen.getByText('Telemetry unavailable')).toBeVisible();
    expect(screen.getByText('Try again after the gateway reconnects.')).toBeVisible();
    expect(screen.queryByText(/stack|trace/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
