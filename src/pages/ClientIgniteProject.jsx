import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '@/components/guidelines/guidelines.css';
import { usePortalProject } from '@/components/guidelines/useIgniteClient';
import { fmtDate } from '@/components/ignite/igniteApi';

export default function ClientIgniteProject() {
  const { projectId } = useParams();
  const { data, isPending, isError } = usePortalProject(projectId);

  if (isPending) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (isError || !data?.project) return <p className="text-muted-foreground py-12 text-center">This project is not available.</p>;

  const { client, project, tasks } = data;
  const phases = [...new Set([...project.phases, ...tasks.map((t) => t.phase)])];
  return (
    <div className="glx rounded p-4 md:p-6 max-w-4xl" style={{ display: 'grid', gap: 16 }}>
      <Link to="/brand-portal/ignite" className="gl-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13 }}><ArrowLeft size={14} />{client.name}</Link>
      <header>
        <span className="gl-label">Project</span>
        <h1 style={{ margin: 0, fontSize: 28 }}>{project.name}</h1>
        {project.event_date && <p className="gl-muted" style={{ margin: '4px 0 0' }}>Event date {fmtDate(project.event_date)}</p>}
      </header>
      {project.strategy_text && <div className="gl-card"><span className="gl-label">Strategy anchor</span><p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{project.strategy_text}</p></div>}
      {phases.map((ph) => {
        const items = tasks.filter((t) => t.phase === ph);
        if (!items.length) return null;
        return (
          <section key={ph} className="gl-card" style={{ padding: 0 }}>
            <h2 style={{ margin: 0, padding: '12px 14px', fontSize: 16 }}>{ph}</h2>
            {items.map((t) => (
              <div key={t.id} className={`gl-task ${t.done ? 'done' : ''}`}>
                <span className="gl-ttitle" style={{ minWidth: 0 }}>{t.title}</span>
                <span className="gl-muted gl-tdue" style={{ fontSize: 13 }}>{t.due_date ? fmtDate(t.due_date) : ''}</span>
                <span className={`gl-pill ${t.status === 'Live' ? 'live' : ''}`}>{t.status}</span>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}