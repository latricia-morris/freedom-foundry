import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PAYMENT_OPS_LABELS } from '@/lib/agency';
import { useToast } from '@/components/ui/use-toast';
import ListToolbar from '@/components/agency/ListToolbar';
import BulkActionBar from '@/components/agency/BulkActionBar';
import { useListControls } from '@/hooks/useListControls';

const PROJECT_STATUSES = ['pending_activation', 'onboarding', 'active', 'waiting_on_client', 'internal_review', 'client_review', 'delivery_hold', 'completed', 'archived', 'on_hold'];
const HEALTH = ['on_track', 'at_risk', 'delayed', 'waiting_on_client', 'on_hold'];
const CONTROLS_KEY = 'ff-agency-projects-controls';

const SORT_FIELDS = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'created_date', label: 'Created Date' },
  { value: 'status', label: 'Status' },
  { value: 'client_name', label: 'Client Name' },
];

export default function AdminAgencyProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [controls, patchControls] = useListControls(CONTROLS_KEY, {
    sortBy: 'due_date',
    sortDir: 'asc',
    clientFilter: '',
    activeOnly: false,
  });

  const load = () => {
    Promise.all([
      base44.entities.Project.filter({}, '-created_date', 300).catch(() => []),
      base44.entities.AgencyClient.filter({}, '-created_date', 300).catch(() => []),
    ]).then(([p, c]) => { setProjects(p || []); setClients(c || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const clientName = (id) => (clients.find((c) => c.id === id) || {}).company_name || '';

  const visible = useMemo(() => {
    let list = projects;
    if (controls.clientFilter) list = list.filter((p) => p.client_id === controls.clientFilter);
    if (controls.activeOnly) list = list.filter((p) => !['completed', 'archived'].includes(p.status));
    const dir = controls.sortDir === 'desc' ? -1 : 1;
    const field = (p) => {
      switch (controls.sortBy) {
        case 'created_date': return p.created_date || '';
        case 'status': return p.status || '';
        case 'client_name': return clientName(p.client_id).toLowerCase();
        default: return p.client_target_completion_date || '';
      }
    };
    return [...list].sort((a, b) => {
      const fa = field(a);
      const fb = field(b);
      if (!fa && !fb) return 0;
      if (!fa) return 1;
      if (!fb) return -1;
      return (fa < fb ? -1 : 1) * dir;
    });
  }, [projects, clients, controls]);

  const toggleRow = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const allSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visible.map((p) => p.id)));

  const applyBulk = async (key, value) => {
    const ids = [...selected];
    if (!ids.length) return;
    const fieldMap = {
      status: 'status',
      health: 'client_project_health',
      assigned_to: 'assigned_project_manager',
      due_date: 'client_target_completion_date',
    };
    try {
      await base44.entities.Project.bulkUpdate(ids.map((id) => ({ id, [fieldMap[key]]: value })));
      toast({ title: `Updated ${ids.length} item${ids.length === 1 ? '' : 's'}` });
      load();
    } catch (e) {
      toast({ title: 'Bulk update failed', description: e.message, variant: 'destructive' });
    }
  };

  const bulkControls = [
    { key: 'status', label: 'Status', type: 'select', options: PROJECT_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })) },
    { key: 'health', label: 'Health', type: 'select', options: HEALTH.map((h) => ({ value: h, label: h.replace(/_/g, ' ') })) },
    { key: 'assigned_to', label: 'Assigned To', type: 'text' },
    { key: 'due_date', label: 'Due Date', type: 'date' },
  ];

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
        <div>
          <ListToolbar
            sortOptions={SORT_FIELDS}
            value={controls}
            onChange={patchControls}
            clients={clients}
          />
          {selected.size > 0 && (
            <BulkActionBar
              count={selected.size}
              controls={bulkControls}
              onApply={applyBulk}
              onClear={() => setSelected(new Set())}
            />
          )}
          <div className="dashboard-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/60">
                  <th className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#d9622c]"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all projects"
                    />
                  </th>
                  {['Project', 'Client', 'Status', 'Payment state', 'Health', 'Activated'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-t border-border/30 ${selected.has(p.id) ? 'bg-primary/5' : 'hover:bg-accent/40'}`}
                  >
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#d9622c]"
                        checked={selected.has(p.id)}
                        onChange={() => toggleRow(p.id)}
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/admin/agency/projects/${p.id}`} className="text-sm text-foreground hover:text-primary">{p.name}</Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{clientName(p.client_id) || '—'}</td>
                    <td className="px-5 py-3"><span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{p.status.replace(/_/g, ' ')}</span></td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{PAYMENT_OPS_LABELS[p.payment_operational_status] || p.payment_operational_status}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{(p.client_project_health || 'on_track').replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground/70">{p.activated_at ? new Date(p.activated_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No projects match the current filters.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}