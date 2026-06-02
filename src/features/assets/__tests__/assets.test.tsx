import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssetDetailPage } from '../AssetDetailPage';
import { AssetsPage } from '../AssetsPage';
import type { AssetDetail, AssetSummary } from '../../../lib/api/types';

const assets: AssetSummary[] = [
  { id: 'a1', tag: 'PUMP-100', name: 'Chilled Water Pump', category: 'hvac', status: 'online' },
  { id: 'a2', tag: 'UPS-200', name: 'Battery Rack', category: 'power', status: 'warning' },
];

const asset: AssetDetail = {
  id: 'a1',
  tag: 'PUMP-100',
  name: 'Chilled Water Pump',
  category: 'hvac',
  status: 'online',
  location: 'Plant 1',
  model: 'PX-1',
  serial: 'SN-1',
};

vi.mock('../../twin/queries', () => ({
  useAssetsQuery: () => ({ data: assets, isLoading: false, isError: false, refetch: vi.fn() }),
  useAssetQuery: () => ({ data: asset, isLoading: false, isError: false, refetch: vi.fn() }),
}));

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      {ui}
    </QueryClientProvider>,
  );
}

describe('asset routes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters asset registry by status and exposes asset/twin links', () => {
    renderWithClient(
      <MemoryRouter initialEntries={['/assets']}>
        <AssetsPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /filter assets/i }), { target: { value: 'warning' } });

    expect(screen.queryByRole('row', { name: /PUMP-100/i })).not.toBeInTheDocument();
    const row = screen.getByRole('row', { name: /UPS-200/i });
    expect(row).toHaveTextContent('Battery Rack');
    expect(within(row).getByRole('link', { name: /UPS-200/i })).toHaveAttribute('href', '/assets/a2');
    expect(within(row).getByRole('link', { name: /open in twin/i })).toHaveAttribute('href', '/twin?assetId=a2');
  });

  it('renders asset identity and open in twin link on asset detail route', () => {
    renderWithClient(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:assetId" element={<AssetDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /Chilled Water Pump/i })).toBeInTheDocument();
    expect(screen.getByText('PUMP-100')).toBeInTheDocument();
    expect(screen.getByText('Plant 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open in twin/i })).toHaveAttribute('href', '/twin?assetId=a1');
  });
});
