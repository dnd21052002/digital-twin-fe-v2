import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NavRail } from '../layout/NavRail';
import { AlarmsPage } from './AlarmsPage';
import { normalizeAlarmDetail, normalizeAlarmSummary } from './queries';
import { RelatedAlarms } from './RelatedAlarms';

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('alarm normalizers', () => {
  it('normalizes mixed backend alarm payloads safely', () => {
    expect(normalizeAlarmSummary({ alarm_id: 42, message: 'Rack temp high', level: 'critical', asset_id: 'rack-7', created_at: '2026-06-02T00:00:00Z' })).toEqual(
      expect.objectContaining({ id: '42', title: 'Rack temp high', severity: 'critical', assetId: 'rack-7', raisedAt: '2026-06-02T00:00:00Z' }),
    );

    expect(normalizeAlarmDetail({ id: 'a-1', description: 'Investigate CRAC loop', related: [{ id: 'a-2', title: 'Humidity drift' }] })).toEqual(
      expect.objectContaining({ id: 'a-1', description: 'Investigate CRAC loop', relatedAlarms: [expect.objectContaining({ id: 'a-2' })] }),
    );
  });
});

describe('AlarmsPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('selects first alarm then updates detail when another alarm is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/alarms/a-2')) return new Response(JSON.stringify({ id: 'a-2', title: 'UPS bypass', severity: 'warning', status: 'acknowledged', assetId: 'ups-1', description: 'Technician acknowledged.' }), { headers: { 'Content-Type': 'application/json' } });
      if (url.includes('/alarms/a-1')) return new Response(JSON.stringify({ id: 'a-1', title: 'Rack overheating', severity: 'critical', status: 'open', assetId: 'rack-7', description: 'Temperature above threshold.' }), { headers: { 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ items: [
        { id: 'a-1', title: 'Rack overheating', severity: 'critical', status: 'open', assetId: 'rack-7' },
        { id: 'a-2', title: 'UPS bypass', severity: 'warning', status: 'acknowledged', assetId: 'ups-1' },
      ] }), { headers: { 'Content-Type': 'application/json' } });
    }));

    renderWithQuery(<AlarmsPage />);

    expect(await screen.findByRole('heading', { name: /rack overheating/i })).toBeInTheDocument();
    expect(screen.getByText(/temperature above threshold/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ups bypass/i }));

    expect(await screen.findByRole('heading', { name: /ups bypass/i })).toBeInTheDocument();
    expect(screen.getByText(/technician acknowledged/i)).toBeInTheDocument();
  });
});

describe('RelatedAlarms', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('filters alarms by selected asset', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ items: [
      { id: 'a-1', title: 'Rack overheating', assetId: 'rack-7', severity: 'critical' },
      { id: 'a-2', title: 'UPS bypass', assetId: 'ups-1', severity: 'warning' },
    ] }), { headers: { 'Content-Type': 'application/json' } })));

    renderWithQuery(<RelatedAlarms assetId="rack-7" />);

    const region = await screen.findByRole('region', { name: /related alarms/i });
    expect(within(region).getByText(/rack overheating/i)).toBeInTheDocument();
    expect(within(region).queryByText(/ups bypass/i)).not.toBeInTheDocument();
  });
});

describe('NavRail', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows an alarm count badge when alarms are open', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ items: [{ id: 'a-1', title: 'Rack overheating' }, { id: 'a-2', title: 'UPS bypass' }] }), { headers: { 'Content-Type': 'application/json' } })));

    renderWithQuery(<MemoryRouter><NavRail /></MemoryRouter>);

    await waitFor(() => expect(screen.getByLabelText(/2 open alarms/i)).toBeInTheDocument());
  });
});
