import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Panel, Empty, label } from '@/components/crm/CrmUi';

const iso = (d) => d.toLocaleDateString('en-CA');

export default function UpcomingWork() {
  const { data = [] } = useQuery({
    queryKey: ['agency-upcoming'],
    queryFn: async () => {
      const now = new Date(); const end = new Date(); end.setDate(end.getDate() + 14);
      const res = await base44.entities.ProjectTask.filter(
        { internal_ready_date: { $gte: iso(now), $lte: iso(end) }, status: { $nin: ['completed', 'released', 'client_approved'] } },
        { sort: 'internal_ready_date', limit: 8 },
      );
      return res.items || [];
    },
  });

  return (
    <Panel title="Due in the next 14 days" to="/admin/crm/calendar" linkLabel="Calendar">
      {data.length === 0 ? <Empty>No tasks are due in the next two weeks.</Empty> : (
        <div className="divide-y divide-border/40">
          {data.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{t.title}</p>
                <p className="text-xs capitalize text-muted-foreground/70">{label(t.status)}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(`${t.internal_ready_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}