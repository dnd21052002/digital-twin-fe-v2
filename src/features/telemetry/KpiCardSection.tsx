import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Panel } from '../../components/ui/Panel';
import type { KpiData } from '../../lib/api/types';
import { useKpisLatestQuery } from './queries';

function kpiStatusColor(kpi: KpiData): { bg: string; text: string; border: string } {
  if (kpi.status === 'critical') return { bg: 'bg-critical/10', text: 'text-critical', border: 'border-critical/30' };
  if (kpi.status === 'warning') return { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' };
  if (kpi.status === 'good') return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' };
  const v = kpi.value;
  const t = kpi.target;
  if (t > 0 && v > t) return { bg: 'bg-critical/10', text: 'text-critical', border: 'border-critical/30' };
  if (t > 0 && v > t * 0.8) return { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' };
  return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' };
}

function KpiSparkline({ data }: { data: { timestamp: string; value: number }[] }) {
  if (!data || data.length < 2) return null;
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KpiCardSection() {
  const kpis = useKpisLatestQuery();

  const content = useMemo(() => {
    if (kpis.isLoading) return <LoadingState label="Loading KPI data" />;
    if (kpis.isError) return <ErrorState title="KPI data unavailable" message={kpis.error instanceof Error ? kpis.error.message : 'Unable to load KPI values.'} onRetry={() => void kpis.refetch()} />;
    const items = kpis.data ?? [];
    if (items.length === 0) return <EmptyState title="No KPI data" message="No KPI metrics have been configured yet." />;
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((kpi) => {
      const colors = kpiStatusColor(kpi);
      const vsTarget = kpi.target > 0 ? ((kpi.value - kpi.target) / kpi.target * 100).toFixed(1) : null;
      return (
        <article key={kpi.key} className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{kpi.name}</p>
            <span className={`text-xs font-semibold ${colors.text}`}>{kpi.status ?? '—'}</span>
          </div>
          <p className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${colors.text}`}>
            {kpi.value}<span className="ml-1 text-sm text-text-secondary">{kpi.unit}</span>
          </p>
          {vsTarget !== null && (
            <p className="mt-1 text-xs text-text-muted">
              Target: {kpi.target} {kpi.unit} ({vsTarget.startsWith('-') ? '' : '+'}{vsTarget}%)
            </p>
          )}
          {kpi.sparkline && kpi.sparkline.length >= 2 && <div className="mt-3"><KpiSparkline data={kpi.sparkline} /></div>}
        </article>
      );
    })}</div>;
  }, [kpis]);

  return <Panel title="KPI Overview" subtitle="PUE, WUE & efficiency metrics">
    {content}
  </Panel>;
}
