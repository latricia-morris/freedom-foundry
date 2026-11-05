import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { E, useRefresh } from '@/components/crm/useCrm';
import { PageHeader, PrimaryButton } from '@/components/crm/CrmUi';
import { CrmDialog } from '@/components/crm/CrmForm';
import EventForm from '@/components/crm/calendar/EventForm';

const key = (d) => d.toLocaleDateString('en-CA');

export default function CrmCalendar() {
  const refresh = useRefresh();
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [editing, setEditing] = useState(null);
  const start = new Date(month); start.setDate(1 - month.getDay());
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const end = days[41];

  const { data } = useQuery({
    queryKey: ['crm', 'calendar', key(month)],
    queryFn: async () => {
      const [ev, tasks] = await Promise.all([
        E.CalendarEvent.filter({ start_time: { $gte: start.toISOString(), $lte: new Date(end.getTime() + 864e5).toISOString() } }, { sort: 'start_time', limit: 300 }),
        E.ProjectTask.filter({ internal_ready_date: { $gte: key(start), $lte: key(end) }, status: { $nin: ['completed', 'released'] } }, { sort: 'internal_ready_date', limit: 300 }),
      ]);
      return { events: ev.items, tasks: tasks.items };
    },
  });
  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader title="Agency" accent="Calendar" subtitle="Meetings, calls and deadlines, alongside project tasks due that day.">
        <PrimaryButton onClick={() => setEditing({ start_time: new Date().toISOString() })}><Plus className="h-4 w-4" /> New event</PrimaryButton>
      </PageHeader>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded-sm border border-border p-1.5 text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /></button>
        <h2 className="min-w-44 text-center font-heading text-2xl font-light">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => shift(1)} aria-label="Next month" className="rounded-sm border border-border p-1.5 text-muted-foreground hover:text-foreground"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="dashboard-card grid grid-cols-7 overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="border-b border-border/50 p-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{d}</div>)}
        {days.map((d) => {
          const k = key(d);
          const ev = (data?.events || []).filter((e) => key(new Date(e.start_time)) === k);
          const tk = (data?.tasks || []).filter((t) => t.internal_ready_date === k);
          return (
            <div key={k} onDoubleClick={() => setEditing({ start_time: new Date(`${k}T10:00`).toISOString() })} className={`min-h-24 border-b border-r border-border/30 p-1.5 ${d.getMonth() !== month.getMonth() ? 'opacity-40' : ''}`}>
              <p className={`mb-1 text-xs ${k === key(new Date()) ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{d.getDate()}</p>
              {ev.map((e) => <button key={e.id} onClick={() => setEditing(e)} className="mb-1 block w-full truncate rounded-sm bg-primary/15 px-1.5 py-0.5 text-left text-[11px] text-foreground">{new Date(e.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} {e.title}</button>)}
              {tk.map((t) => <p key={t.id} className="mb-1 truncate border-l-2 border-primary/60 pl-1.5 text-[11px] text-muted-foreground">{t.title}</p>)}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Double-click a day to add an event. Bordered items are project tasks due.</p>
      <CrmDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing?.id ? 'Edit event' : 'New event'}>
        {editing && <EventForm event={editing} onDone={() => { setEditing(null); refresh('calendar'); }} />}
      </CrmDialog>
    </div>
  );
}