import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PAYMENT_OPS_LABELS } from '@/lib/agency';

export default function AdminAgencyProjects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Project.filter({}, '-created_date', 300).catch(() => []),
      base44.entities.AgencyClient.filter({}, '-created_date', 300).catch(() => []),
    ]).then(([p, c]) => { setProjects(p || []); setClients(c || []); setLoading(false); });
  }, []);

  const clientName = (id) => (clients.find((c) => c.id === id) || {}).company_name || '—';

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <h1 className="mb-2 font-heading text-4xl font-light text-foreground">Client <span className="molten-text italic">Projects</span></h1>
      <p className="mb-8 text-sm text-muted-foreground">
        A project exists only after its deposit is verified. Activation is automatic and happens exactly once.
      </p>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : projects.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No projects yet. Accepted proposals with verified deposits appear here.</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60">
                {['Project', 'Client', 'Status', 'Payment state', 'Health', 'Activated'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-border/30 hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <Link to={`/admin/agency/projects/${p.id}`} className="text-sm text-foreground hover:text-primary">{p.name}</Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{clientName(p.client_id)}</td>
                  <td className="px-5 py-3"><span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{p.status.replace(/_/g, ' ')}</span></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{PAYMENT_OPS_LABELS[p.payment_operational_status] || p.payment_operational_status}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{(p.client_project_health || 'on_track').replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">{p.activated_at ? new Date(p.activated_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}