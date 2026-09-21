import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const linkBase = 'flex items-center gap-2 border-l-2 px-3 py-2 text-sm transition-colors duration-200';
const linkActive = 'border-primary font-medium text-foreground bg-primary/5';
const linkIdle = 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground';

export default function AdminProjectNav() {
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    base44.entities.AgencyClient.list('-created_date', 200)
      .then((list) => {
        setClients(list || []);
        return base44.entities.Project.list('-created_date', 200);
      })
      .then((list) => setProjects(list || []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const activeProjectId = location.pathname.match(/^\/admin\/agency\/projects\/([^/]+)/)?.[1] || null;
  const agencyBuildActive = location.pathname.startsWith('/admin/agency/agency-build');
  const clientIds = new Set(clients.map((c) => c.id));
  const unassigned = projects.filter((p) => !clientIds.has(p.client_id));

  return (
    <div className="flex flex-col">
      <Link
        to="/admin/agency"
        className="btn-forge mb-4 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-[10px] font-semibold uppercase tracking-widest ember-glow"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Agency OS
      </Link>

      <p className="mb-1 px-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Client Projects</p>
      {!loaded ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : clients.length === 0 && unassigned.length === 0 ? (
        <p className="px-3 py-2 text-xs text-muted-foreground">No clients or projects yet.</p>
      ) : (
        clients.map((client) => {
          const clientProjects = projects.filter((p) => p.client_id === client.id);
          return (
            <div key={client.id} className="mb-3">
              <p className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                <Building2 className="h-3 w-3" /> {client.company_name}
              </p>
              {clientProjects.length === 0 ? (
                <p className="pb-1 pl-6 text-[11px] text-muted-foreground/50">No active projects</p>
              ) : (
                clientProjects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/admin/agency/projects/${p.id}`}
                    className={`block truncate pl-6 ${linkBase} ${p.id === activeProjectId ? linkActive : linkIdle}`}
                  >
                    {p.name}
                  </Link>
                ))
              )}
            </div>
          );
        })
      )}

      {unassigned.length > 0 && (
        <div className="mb-3">
          <p className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Unassigned</p>
          {unassigned.map((p) => (
            <Link
              key={p.id}
              to={`/admin/agency/projects/${p.id}`}
              className={`block truncate pl-6 ${linkBase} ${p.id === activeProjectId ? linkActive : linkIdle}`}
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-2 border-t border-border pt-3">
        <p className="mb-1 px-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">My Agency</p>
        <Link
          to="/admin/agency/agency-build"
          className={`block truncate ${linkBase} ${agencyBuildActive ? linkActive : linkIdle}`}
        >
          Agency Build
        </Link>
      </div>
    </div>
  );
}