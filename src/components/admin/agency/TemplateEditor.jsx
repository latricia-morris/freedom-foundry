import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Save, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { WORK_TYPES } from '@/lib/portfolioData';

const blankTask = () => ({ title: '', description: '', client_visible: false, deliverable: false, due_offset_days: null });
const blankPhase = () => ({ name: '', tasks: [blankTask()] });

function normalize(template) {
  return {
    name: template.name || '',
    service_type: template.service_type || WORK_TYPES[0],
    description: template.description || '',
    duration_days: template.duration_days ?? 45,
    is_default: Boolean(template.is_default),
    active: template.active !== false,
    phases: (template.phases || []).map((p) => ({
      name: p.name || '',
      tasks: (p.tasks || []).map((t) => ({
        title: t.title || '',
        description: t.description || '',
        client_visible: Boolean(t.client_visible),
        deliverable: Boolean(t.deliverable),
        due_offset_days: t.due_offset_days ?? null,
      })),
    })),
  };
}

export default function TemplateEditor({ template, onClose, onSaved }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(() => normalize(template));
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(normalize(template)); }, [template.id]);

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const setPhase = (index, updater) =>
    setDraft((d) => ({ ...d, phases: d.phases.map((p, i) => (i === index ? updater(p) : p)) }));
  const setTask = (phaseIndex, taskIndex, patch) =>
    setPhase(phaseIndex, (p) => ({ ...p, tasks: p.tasks.map((t, i) => (i === taskIndex ? { ...t, ...patch } : t)) }));
  const movePhase = (index, dir) => setDraft((d) => {
    const target = index + dir;
    if (target < 0 || target >= d.phases.length) return d;
    const phases = [...d.phases];
    [phases[index], phases[target]] = [phases[target], phases[index]];
    return { ...d, phases };
  });

  const save = async () => {
    if (!draft.name.trim()) {
      toast({ title: 'Template name is required', variant: 'destructive' });
      return;
    }
    const phases = draft.phases
      .filter((p) => p.name.trim())
      .map((p) => ({ name: p.name.trim(), tasks: p.tasks.filter((t) => t.title.trim()) }));
    setSaving(true);
    try {
      await base44.entities.ProjectTemplate.update(template.id, {
        name: draft.name.trim(),
        service_type: draft.service_type,
        description: draft.description,
        duration_days: Number(draft.duration_days) || 45,
        is_default: draft.is_default,
        active: draft.active,
        phases,
      });
      if (draft.is_default) {
        const others = await base44.entities.ProjectTemplate.filter({ service_type: draft.service_type }, 'name', 100);
        const clear = (others || []).filter((t) => t.id !== template.id && t.is_default).map((t) => ({ id: t.id, is_default: false }));
        if (clear.length) await base44.entities.ProjectTemplate.bulkUpdate(clear);
      }
      toast({ title: 'Template saved' });
      onSaved();
    } catch (e) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-card mb-8 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-light text-foreground">Edit template</h2>
        <button type="button" onClick={onClose} aria-label="Close editor" className="text-muted-foreground transition-colors hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Template name</span>
          <input className="admin-input" value={draft.name} onChange={(e) => setField('name', e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Work category</span>
          <select className="admin-input" value={draft.service_type} onChange={(e) => setField('service_type', e.target.value)}>
            {WORK_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Duration (days)</span>
          <input type="number" min="1" className="admin-input" value={draft.duration_days} onChange={(e) => setField('duration_days', e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Description</span>
          <input className="admin-input" value={draft.description} onChange={(e) => setField('description', e.target.value)} />
        </label>
        <div className="flex items-center gap-6 md:col-span-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={draft.is_default} onChange={(e) => setField('is_default', e.target.checked)} />
            Default for category
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={draft.active} onChange={(e) => setField('active', e.target.checked)} />
            Active
          </label>
        </div>
      </div>

      <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Phases &amp; task sequence</p>
      <div className="space-y-4">
        {draft.phases.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="rounded-md border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <input
                className="admin-input"
                value={phase.name}
                placeholder="Phase name"
                onChange={(e) => setPhase(phaseIndex, (p) => ({ ...p, name: e.target.value }))}
              />
              <button
                type="button"
                aria-label="Move phase up"
                disabled={phaseIndex === 0}
                onClick={() => movePhase(phaseIndex, -1)}
                className="rounded-sm border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Move phase down"
                disabled={phaseIndex === draft.phases.length - 1}
                onClick={() => movePhase(phaseIndex, 1)}
                className="rounded-sm border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Delete phase"
                onClick={() => setDraft((d) => ({ ...d, phases: d.phases.filter((_, i) => i !== phaseIndex) }))}
                className="rounded-sm border border-border p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {phase.tasks.map((task, taskIndex) => (
                <div key={taskIndex} className="flex flex-wrap items-center gap-2">
                  <input
                    className="admin-input min-w-0 flex-1"
                    value={task.title}
                    placeholder="Task title"
                    onChange={(e) => setTask(phaseIndex, taskIndex, { title: e.target.value })}
                  />
                  <input
                    type="number"
                    className="admin-input w-24"
                    value={task.due_offset_days ?? ''}
                    placeholder="Day"
                    aria-label="Due offset in days"
                    onChange={(e) => setTask(phaseIndex, taskIndex, { due_offset_days: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#d9622c]"
                      checked={task.client_visible}
                      onChange={(e) => setTask(phaseIndex, taskIndex, { client_visible: e.target.checked })}
                    />
                    Client
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#d9622c]"
                      checked={task.deliverable}
                      onChange={(e) => setTask(phaseIndex, taskIndex, { deliverable: e.target.checked })}
                    />
                    Deliverable
                  </label>
                  <button
                    type="button"
                    aria-label="Delete task"
                    onClick={() => setPhase(phaseIndex, (p) => ({ ...p, tasks: p.tasks.filter((_, i) => i !== taskIndex) }))}
                    className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPhase(phaseIndex, (p) => ({ ...p, tasks: [...p.tasks, blankTask()] }))}
              className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary"
            >
              <Plus className="h-3.5 w-3.5" /> Add task
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setDraft((d) => ({ ...d, phases: [...d.phases, blankPhase()] }))}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" /> Add phase
      </button>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save template'}
        </button>
        <button type="button" onClick={onClose} className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}