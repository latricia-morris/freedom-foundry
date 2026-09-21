import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { WORK_TYPES } from '@/lib/portfolioData';
import TemplateEditor from '@/components/admin/agency/TemplateEditor';
import TemplateApplyCard from '@/components/admin/agency/TemplateApplyCard';

export default function AdminAgencyTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [applyingId, setApplyingId] = useState(null);

  const load = useCallback(() => {
    Promise.all([
      base44.entities.ProjectTemplate.filter({}, 'name', 100).catch(() => []),
      base44.entities.Project.filter({}, '-created_date', 200).catch(() => []),
    ]).then(([t, p]) => { setTemplates(t || []); setProjects(p || []); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const taskCount = (t) => (t.phases || []).reduce((sum, p) => sum + (p.tasks || []).length, 0);

  const createTemplate = async () => {
    try {
      const created = await base44.entities.ProjectTemplate.create({
        name: 'Untitled template',
        service_type: WORK_TYPES[0],
        active: true,
        phases: [],
      });
      load();
      setApplyingId(null);
      setEditingId(created.id);
    } catch (e) {
      toast({ title: 'Could not create template', description: e.message, variant: 'destructive' });
    }
  };

  const editing = templates.find((t) => t.id === editingId) || null;
  const applying = templates.find((t) => t.id === applyingId) || null;

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-light text-foreground">Project <span className="molten-text italic">Templates</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Define the task roadmap for each work category, then load it into any project as a ready-made sequence.
          </p>
        </div>
        <button
          type="button"
          onClick={createTemplate}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest"
        >
          <Plus className="h-4 w-4" /> New template
        </button>
      </div>

      {editing && (
        <TemplateEditor
          template={editing}
          onClose={() => setEditingId(null)}
          onSaved={() => { setEditingId(null); load(); }}
        />
      )}

      {applying && (
        <TemplateApplyCard
          template={applying}
          projects={projects}
          onClose={() => setApplyingId(null)}
          onApplied={() => { setApplyingId(null); load(); }}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : templates.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No templates yet. Create one to define a repeatable project roadmap.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="dashboard-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl text-foreground">{t.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-primary/80">{t.service_type || 'Uncategorized'}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {t.is_default && (
                    <span className="rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">Default</span>
                  )}
                  {!t.active && (
                    <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Inactive</span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {(t.phases || []).length} phase{(t.phases || []).length === 1 ? '' : 's'} · {taskCount(t)} task{taskCount(t) === 1 ? '' : 's'} · {t.duration_days || '—'} day duration
              </p>
              {t.description && <p className="mt-2 text-xs text-muted-foreground/70">{t.description}</p>}
              <div className="mt-auto flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setApplyingId(null); setEditingId(t.id); }}
                  className="text-[10px] uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setApplyingId(t.id); }}
                  className="text-[10px] uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
                >
                  Apply to project
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}