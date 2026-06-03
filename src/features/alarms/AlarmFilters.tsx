import { Button } from '../../components/ui/Button';
import type { AlarmFilters as AlarmFilterValues } from './queries';

type AlarmFiltersProps = {
  filters: AlarmFilterValues;
  onChange: (filters: AlarmFilterValues) => void;
};

const severities = ['', 'critical', 'warning', 'info'];
const statuses = ['', 'new', 'acked', 'resolved'];

function nextFilters(filters: AlarmFilterValues, key: 'severity' | 'status', value: string): AlarmFilterValues {
  const next: AlarmFilterValues = { ...filters };
  if (value) next[key] = value;
  else delete next[key];
  return next;
}

function clearFilters(filters: AlarmFilterValues): AlarmFilterValues {
  const next: AlarmFilterValues = {};
  if (filters.assetId) next.assetId = filters.assetId;
  return next;
}

export function AlarmFilters({ filters, onChange }: AlarmFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm text-text-secondary">
        Severity
        <select className="mt-1 w-full rounded-md border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary" value={filters.severity ?? ''} onChange={(event) => onChange(nextFilters(filters, 'severity', event.target.value))}>
          {severities.map((value) => <option key={value || 'all'} value={value}>{value || 'All severities'}</option>)}
        </select>
      </label>
      <label className="text-sm text-text-secondary">
        Status
        <select className="mt-1 w-full rounded-md border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary" value={filters.status ?? ''} onChange={(event) => onChange(nextFilters(filters, 'status', event.target.value))}>
          {statuses.map((value) => <option key={value || 'all'} value={value}>{value || 'All statuses'}</option>)}
        </select>
      </label>
      <div className="flex items-end">
        <Button size="sm" variant="ghost" onClick={() => onChange(clearFilters(filters))}>Clear filters</Button>
      </div>
    </div>
  );
}
