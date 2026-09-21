import React, { useMemo, useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + (Number(days) || 0));
  return d.toISOString().slice(0, 10);
}

/**
 * Load a template's task roadmap for a CLIENT: either into an existing
 * project of that client, or by creating a brand-new project for them.
 * Dates are computed from the start date using each task's day offset.
 */
export default function TemplateApplyCard({ template, clients, projects, onClose, onApplied }) {
  const { toast } = useToast();
  const [clientId, setClientId] = useState('');
  const [destination, setDestination] = useState('new');
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [applying, setApplying] = useState(false);

  const taskCount = useMemo(
    () => (template.phases || []).reduce((sum, p) => sum + (p.tasks || []).length, 0),
    [template],
  );

  const clientProjects = useMemo(
    () => (projects || []).filter((p) => p.client_id === clientId),
    [projects, clientId],
  );

  const chooseClient = (id) => {
    setClientId(id);
    setDestination('new');
    setProjectName(template.name);
  };

  const apply = async () => {
    if (!clientId) {
      toast({ title: 'Choose a client first', variant: 'destructive' });
      return;
    }
    const isNew = destination === 'new';
    if (isNew && !projectName.trim()) {
      toast({ title: 'Name the new project', variant: 'destructive' });
      return;
    }
    if (!isNew && !destination) {
      toast({ title: 'Choose a project first', variant: 'destructive' });
      return;
    }

    setApplying(true);
    try {
      let projectId = destination;
      if (isNew) {
        const created = await base44.entities.Project.create({
          client_id: clientId,
          name: projectName.trim(),
          project_template_id: template.id,
        });
        projectId = created.id;
      } else {
        await base44.entities.Project.update(projectId, { project_template_id: template.id });
      }

      let sort = 0;
      const rows = [];
      (template.phases || []).forEach((phase) => {
        (phase.tasks || []).forEach((task) => {
          rows.push({
            project_id: projectId,
            phase: phase.name,
            title: task.title,
            description: task.description || '',
            client_visible: Boolean(task.client_visible),
            status: 'not_started',
            client_due_date: task.due_offset_days != null ? addDays(startDate, task.due_offset_days) : null,
            sort_order: sort++,
          });
        });
      });

      await base44.entities.ProjectTask.bulkCreate(rows);
      toast({
        title: isNew
          ? `Created “${projectName.trim()}” with ${rows.length} task${rows.length === 1 ? '' : 's'}`
          : `Loaded ${rows.length} task${rows.length === 1 ? '' : 's'} into the project`,
      });
      onApplied();
    } catch (e) {
      toast({ title: 'Template load failed', description: e.message, variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="dashboard-card mb-8 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-light text-foreground">Apply “{template.name}”</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground transition-colors hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Loads {taskCount} task{taskCount === 1 ? '' : 's'} across {(template.phases || []).length} phase
        {(template.phases || []).length === 1 ? '' : 's'} for the selected client — into an existing
        project or a new one. Task due dates are computed from the start date using each task’s day offset.
      </p>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Client</span>
          <select className="admin-input" value={clientId} onChange={(e) => chooseClient(e.target.value)}>
            <option value="">Choose a client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Destination</span>
          <select className="admin-input" value={destination} onChange={(e) => setDestination(e.target.value)} disabled={!clientId}>
            <option value="new">Create a new project</option>
            {clientProjects.map((p) => <option key={p.id} value={p.id}>Existing: {p.name}</option>)}
          </select>
        </label>
        {destination === 'new' && (
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">New project name</span>
            <input
              className="admin-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Brand Revival — Website Rebuild"
            />
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Start date</span>
          <input type="date" className="admin-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
      </div>
      <button
        type="button"
        onClick={apply}
        disabled={applying || taskCount === 0}
        className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-60"
      >
        <CalendarClock className="h-4 w-4" /> {applying ? 'Loading…' : 'Load roadmap'}
      </button>
    </div>
  );
}