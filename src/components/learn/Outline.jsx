import React from 'react';
import { Link } from 'react-router-dom';
import { Check, FileText, Headphones, Lock, PenLine, Play } from 'lucide-react';

/** Modules and their lessons. Lessons link through only when the learner has access. */
export default function Outline({ offeringId, groups, hasAccess, currentId, onNavigate }) {
  let n = 0;
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.id || 'top'}>
          {g.title && (
            <header className="mb-3">
              <h3 className="font-heading text-2xl text-foreground">
                {g.title}{g.status === 'draft' && <span className="ml-2 align-middle text-[10px] uppercase tracking-widest text-muted-foreground">Draft</span>}
              </h3>
              {g.description && <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>}
            </header>
          )}
          <ol className="divide-y divide-border border border-border bg-card">
            {g.lessons.map((l) => {
              n += 1;
              const Icon = l.completed ? Check : !hasAccess ? Lock : l.has_video ? Play : l.has_audio ? Headphones : FileText;
              const row = (
                <>
                  <span className="w-7 text-xs tabular-nums text-muted-foreground">{String(n).padStart(2, '0')}</span>
                  <span className={`min-w-0 flex-1 truncate text-sm ${l.id === currentId ? 'text-warm font-semibold' : 'text-foreground'}`}>{l.title}</span>
                  {l.status === 'draft' && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Draft</span>}
                  {l.has_worksheet && <PenLine className="h-3.5 w-3.5 text-muted-foreground" aria-label="Has a worksheet" />}
                  <Icon className={`h-4 w-4 ${l.completed ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                </>
              );
              return (
                <li key={l.id}>
                  {hasAccess
                    ? <Link to={`/learn/${offeringId}/${l.id}`} onClick={onNavigate} aria-current={l.id === currentId ? 'page' : undefined} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/40">{row}</Link>
                    : <div className="flex items-center gap-3 px-4 py-3.5">{row}</div>}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}