import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useViewerStore } from '../../twin/viewerStore';
import { TelemetryPage } from '../TelemetryPage';

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('TelemetryPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useViewerStore.setState({ selectedAssetId: null, selectedAlarmId: null, drawer: null });
  });

  it('prompts for an asset when none is selected', () => {
    renderWithQuery(<TelemetryPage />);

    expect(screen.getByRole('heading', { name: /select an asset/i })).toBeInTheDocument();
    expect(screen.getByText(/choose an asset/i)).toBeInTheDocument();
  });

  it('shows an empty telemetry state when selected asset has no latest metrics', async () => {
    useViewerStore.setState({ selectedAssetId: 'rack-7' });
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/kpis/latest')) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      if (url.includes('/capacity/summary')) return new Response(JSON.stringify({ power: { used: 0, total: 0, unit: 'kW' }, cooling: { used: 0, total: 0, unit: 'kW' }, space: { used: 0, total: 0, unit: 'm²' } }), { headers: { 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ assetId: 'rack-7', items: [] }), { headers: { 'Content-Type': 'application/json' } });
    }));

    renderWithQuery(<TelemetryPage />);

    expect(await screen.findByRole('heading', { name: /no telemetry metrics/i })).toBeInTheDocument();
    expect(screen.getAllByText(/rack-7/i).length).toBeGreaterThan(0);
  });

  it('renders latest metric values, units, quality labels, and timestamps', async () => {
    useViewerStore.setState({ selectedAssetId: 'rack-7' });
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/timeseries')) {
        return new Response(JSON.stringify({ assetId: 'rack-7', metricKey: 'temperature', unit: '°C', points: [] }), { headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/kpis/latest')) {
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/capacity/summary')) {
        return new Response(JSON.stringify({ power: { used: 120, total: 250, unit: 'kW' }, cooling: { used: 80, total: 200, unit: 'kW' }, space: { used: 30, total: 100, unit: 'm²' } }), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ assetId: 'rack-7', data: [
        { key: 'temperature', name: 'Temperature', value: 27.5, unit: '°C', quality: 0, timestamp: '2026-06-02T10:00:00Z' },
        { key: 'humidity', name: 'Humidity', value: 61, unit: '%', quality: 1, timestamp: '2026-06-02T10:01:00Z' },
        { key: 'fan', name: 'Fan Speed', value: 980, unit: 'RPM', quality: 3, timestamp: '2026-06-02T10:02:00Z' },
      ] }), { headers: { 'Content-Type': 'application/json' } });
    }));

    renderWithQuery(<TelemetryPage />);

    expect((await screen.findAllByText('Temperature'))[0]).toBeInTheDocument();
    expect(screen.getByText(/27.5/)).toBeInTheDocument();
    expect(screen.getAllByText('°C')[0]).toBeInTheDocument();
    expect(screen.getByText(/Quality: Good/i)).toBeInTheDocument();
    expect(screen.getByText(/Quality: Warning/i)).toBeInTheDocument();
    expect(screen.getByText(/Quality: Critical/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Jun 2, 2026/)[0]).toBeInTheDocument();
  });

  it('requests timeseries when metric and range selections change', async () => {
    useViewerStore.setState({ selectedAssetId: 'rack-7' });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/timeseries')) {
        return new Response(JSON.stringify({ assetId: 'rack-7', metricKey: new URL(url).searchParams.get('metric'), unit: 'kW', points: [{ timestamp: '2026-06-02T10:00:00Z', value: 4.2 }] }), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ assetId: 'rack-7', items: [
        { metricKey: 'power', name: 'Power', value: 4.2, unit: 'kW', quality: 0, timestamp: '2026-06-02T10:00:00Z' },
        { metricKey: 'voltage', name: 'Voltage', value: 230, unit: 'V', quality: 0, timestamp: '2026-06-02T10:00:00Z' },
      ] }), { headers: { 'Content-Type': 'application/json' } });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithQuery(<TelemetryPage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/assets/rack-7/metrics/timeseries?'), expect.any(Object)));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('metric=power'), expect.any(Object));

    fireEvent.change(await screen.findByLabelText(/metric/i), { target: { value: 'voltage' } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('metric=voltage'), expect.any(Object)));

    fireEvent.click(screen.getByRole('button', { name: /show 6 hour telemetry trend/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('limit=1000'), expect.any(Object)));
    const timeseriesUrls = fetchMock.mock.calls.map(([input]) => String(input)).filter((url) => url.includes('/timeseries'));
    expect(timeseriesUrls.some((url) => url.includes('from=') && url.includes('to='))).toBe(true);
  });
});
