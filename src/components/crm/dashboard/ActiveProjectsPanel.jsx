import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { hours } from '@/lib/crm';
import { Panel, Empty, label } from '@/components/crm/CrmUi';

/** Delivery snapshot: each active project with its client, health, client visibility and hours logged. */
export default function ActiveProjectsPanel({ projects }) {
  const ids = projects.slice(0, 6).map((p) => p.id);
  const { data } = useQuery({
    queryKey: ['crm', 'active-projects', ids.join(',')],
    enabled: ids.length > 0,
    queryFn: async () => {
      const clientIds = [...new Set(projects.slice(0, 6).map((p) => p.client_id).filter(Boolean))];
      const [clients, time] = await Promise.all([
        base44.entities.AgencyClient.filter({ id: { $in: clientIds } }, { limit: 50, fields: ['company_name'] }),
        base44.entities.TimeEntry.aggregate({ query: { project_id: { $in: ids } }, groupBy: 'project_id', sum: ['duration_minutes'] }),
      ]);
      return {
        clients: Object.fromEntries(clients.items.map((c) => [c.id, c.company_name])),
        minutes: Object.fromEntries(time.rows.map((r) => [r.project_id, r.sum_duration_minutes || 0])),
      };
    },
  });

  return (
    <Panel title="Active client projects" to="/admin/agency/projects">
      {projects.length === 0 ? <Empty>Projects appear here once a deposit is verified or you add one.</Empty> : (
        <div className="divide-y divide-border/40">
          {projects.slice(0, 6).map((p) => (
            <Link key={p.id} to={`/admin/agency/projects/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/40">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{data?.clients[p.client_id] || '—'} · {label(p.client_project_health || 'on_track')}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{hours(data?.minutes[p.id])}</span>
              {p.client_portal_enabled
                ? <Eye className="h-4 w-4 shrink-0 text-primary" aria-label="Visible to client" />
                : <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-label="Hidden from client" />}
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}