import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { shortDate } from '@/lib/crm';
import { Pill, label } from '@/components/crm/CrmUi';

const DONE = ['completed', 'client_approved', 'released'];

export default function ClientProjectCard({ project, tasks, deliverables }) {
  const done = tasks.filter((t) => DONE.includes(t.status)).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  return (
    <div className="dashboard-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-2xl font-light text-foreground">{project.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Started {shortDate(project.start_date)} · Target {shortDate(project.target_date)}</p>
        </div>
        <div className="flex gap-2"><Pill>{label(project.status)}</Pill>{project.health && <Pill>{label(project.health)}</Pill>}</div>
      </div>
      {tasks.length > 0 && (
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{done} of {tasks.length} milestones</span></div>
          <div className="well-track h-2 overflow-hidden"><div className="molten-bar h-full" style={{ width: `${pct}%` }} /></div>
          <ul className="mt-4 space-y-2">
            {tasks.slice(0, 8).map((t) => (
              <li key={t.id} className="flex items-center gap-2.5 text-sm">
                {DONE.includes(t.status) ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className="flex-1 text-foreground">{t.title}</span>
                <span className="text-xs text-muted-foreground">{t.due_date ? shortDate(t.due_date) : label(t.status)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {deliverables.length > 0 && (
        <div className="mt-5 border-t border-border/50 pt-4">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Deliverables</p>
          {deliverables.map((d) => (
            <div key={d.id} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-foreground">{d.title} <span className="text-xs text-muted-foreground">v{d.version}</span></span>
              <span className="text-xs capitalize text-muted-foreground">{label(d.status)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}