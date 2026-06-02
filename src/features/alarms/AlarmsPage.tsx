import { useMemo, useState } from 'react';

import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Panel } from '../../components/ui/Panel';
import { AlarmDetail } from './AlarmDetail';
import { AlarmFilters } from './AlarmFilters';
import { AlarmList } from './AlarmList';
import type { AlarmFilters as AlarmFilterValues } from './queries';
import { useAlarmsQuery } from './queries';

export function AlarmsPage() {
  const [filters, setFilters] = useState<AlarmFilterValues>({});
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null);
  const { data: alarms = [], isLoading, isError, error, refetch } = useAlarmsQuery(filters);
  const selectedAlarm = useMemo(() => alarms.find((alarm) => alarm.id === selectedAlarmId) ?? alarms[0], [alarms, selectedAlarmId]);
  const effectiveSelectedAlarmId = selectedAlarm?.id ?? null;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <Panel title="Alarms" subtitle="Incident triage queue" className="space-y-4">
        <AlarmFilters filters={filters} onChange={setFilters} />
        {isLoading && <LoadingState label="Loading alarms" />}
        {isError && <ErrorState title="Alarms unavailable" message={error instanceof Error ? error.message : 'Unable to load alarms.'} onRetry={() => void refetch()} />}
        {!isLoading && !isError && <AlarmList alarms={alarms} selectedAlarmId={effectiveSelectedAlarmId} onSelect={setSelectedAlarmId} />}
      </Panel>
      <Panel title="Alarm command detail" subtitle="Triage, ownership, related context">
        <AlarmDetail alarmId={effectiveSelectedAlarmId} />
      </Panel>
    </div>
  );
}
