import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProjectTaskListPanel from '@/components/admin/agency/ProjectTaskListPanel';

const HEALTH_STYLES = {
  on_track: 'border-emerald-500/40 text-emerald-400',
  at_risk: 'border-amber-500/40 text-amber-400',
  delayed: 'border-destructive/40 text-destructive',
  waiting_on_client: 'border-primary/40 text-primary',
  on_hold: 'border-border text-muted-foreground',
};

export default function ClientProjectsTab({ client }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.Project.filter({ client_id: client.id }, '-created_date', 100)
      .then((rows) => { if (active) { setProjects(rows || []); setLoading(false); } })
      .catch(() => { if (active) { setProjects([]); setLoading(false); } });
    return () => { active = false; };
  }, [client.id]);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  if (projects.length === 0) {
    return (
      <div className="dashboard-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No projects for this client yet. A project is created the moment a verified deposit lands on an accepted proposal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const isOpen = openId === project.id;
        return (
          <div key={project.id} className="dashboard-card p-0">
            <div className="flex flex-wrap items-center gap-3 p-5">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : project.id)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{project.name}</span>
                  <span className="block text-xs text-muted-foreground/70">
                    {project.status.replace(/_/g, ' ')} · Started {project.client_start_date || '—'}
                  </span>
                </span>
              </button>
              <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${HEALTH_STYLES[project.client_project_health] || 'border-border text-muted-foreground'}`}>
                {project.client_project_health.replace(/_/g, ' ')}
              </span>
              <Link
                to={`/admin/agency/projects/${project.id}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open
              </Link>
            </div>
            {isOpen && (
              <div className="border-t border-border/50 p-5">
                <ProjectTaskListPanel projectId={project.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}