import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { hours, shortDate } from '@/lib/crm';
import { E, useRecords, useRefresh } from '@/components/crm/useCrm';
import { PageHeader, Stat, Panel, Empty, Spinner, Pill } from '@/components/crm/CrmUi';
import TimeEntryForm from '@/components/crm/time/TimeEntryForm';

export default function CrmTime() {
  const refresh = useRefresh();
  const { data: entries = [], isLoading } = useRecords('time', 'TimeEntry', {}, '-date', 60);
  const { data: totals } = useQuery({
    queryKey: ['crm', 'time', 'totals'],
    queryFn: async () => {
      const r = await E.TimeEntry.aggregate({ groupBy: 'billable', sum: ['duration_minutes'] });
      const of = (b) => r.rows.filter((x) => !!x.billable === b).reduce((s, x) => s + (x.sum_duration_minutes || 0), 0);
      return { billable: of(true), internal: of(false) };
    },
  });
  const remove = async (id) => { await E.TimeEntry.delete(id); refresh('time'); };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <PageHeader title="Time" accent="Tracking" subtitle="Log hours against client projects so effort, budgets and reports stay honest." />
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Stat label="Billable" value={hours(totals?.billable)} accent="text-primary" />
        <Stat label="Internal" value={hours(totals?.internal)} />
        <Stat label="Total" value={hours((totals?.billable || 0) + (totals?.internal || 0))} />
      </div>
      <TimeEntryForm onSaved={() => refresh('time')} />
      <Panel title="Recent entries">
        {isLoading ? <Spinner /> : entries.length === 0 ? <Empty>No time logged yet.</Empty> : (
          <div className="divide-y divide-border/40">
            {entries.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">{shortDate(t.date)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{t.project_name || 'General'}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.description || '—'}</p>
                </div>
                <Pill>{t.activity_type}</Pill>
                {!t.billable && <Pill>internal</Pill>}
                <span className="w-14 shrink-0 text-right text-sm text-foreground">{hours(t.duration_minutes)}</span>
                <button onClick={() => remove(t.id)} aria-label="Delete entry" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}