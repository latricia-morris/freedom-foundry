import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import ListToolbar from '@/components/agency/ListToolbar';
import BulkActionBar from '@/components/agency/BulkActionBar';
import ProjectsTable from '@/components/admin/agency/projects/ProjectsTable';
import AiProjectAssistant from '@/components/admin/agency/projects/AiProjectAssistant';
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

const EMPTY_DRAFT = {
  name: '',
  client_id: '',
  status: 'pending_activation',
  client_project_health: 'on_track',
  client_target_completion_date: '',
  assigned_project_manager: '',
};

export default function AdminAgencyProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [aiDraft, setAiDraft] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
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

  const commitDraft = async () => {
    if (!draft.name.trim()) {
      toast({ title: 'Project name required', variant: 'destructive' });
      return;
    }
    if (!draft.client_id) {
      toast({ title: 'Choose a client', description: 'Pick the client this project belongs to, then press Enter.', variant: 'destructive' });
      return;
    }
    setSavingDraft(true);
    try {
      await base44.entities.Project.create({
        client_id: draft.client_id,
        name: draft.name.trim(),
        status: draft.status,
        client_project_health: draft.client_project_health,
        client_target_completion_date: draft.client_target_completion_date || null,
        assigned_project_manager: draft.assigned_project_manager.trim() || null,
      });
      toast({ title: 'Project added', description: draft.name.trim() });
      setDraft(EMPTY_DRAFT);
      setAiDraft(false);
      load();
    } catch (e) {
      toast({ title: 'Could not add project', description: e.message, variant: 'destructive' });
    } finally {
      setSavingDraft(false);
    }
  };

  const cellCommit = async (project, field, value) => {
    const clean = field === 'name' ? String(value ?? '').trim() : (value || null);
    if (field === 'name' && !clean) return;
    try {
      await base44.entities.Project.update(project.id, { [field]: clean });
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, [field]: clean } : p)));
    } catch (e) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
      load();
    }
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-4xl font-light text-foreground">Client <span className="molten-text italic">Projects</span></h1>
        <AiProjectAssistant
          clients={clients}
          onDraft={(d) => { setDraft({ ...EMPTY_DRAFT, ...d }); setAiDraft(true); }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
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
          <ProjectsTable
            projects={visible}
            clients={clients}
            draft={draft}
            aiDraft={aiDraft}
            busy={savingDraft}
            onDraftChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
            onCommitDraft={commitDraft}
            onCellCommit={cellCommit}
            selectedIds={selected}
            onToggleRow={toggleRow}
            allSelected={allSelected}
            onToggleAll={toggleAll}
          />
        </div>
      )}
    </div>
  );
}