import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowUp, Copy, Eye, EyeOff, Pencil, Plus, Star, Trash2,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { displayYear, publishChecklist } from '@/lib/portfolioData';
import { useToast } from '@/components/ui/use-toast';

const STATUS_STYLE = {
  draft: 'border-border text-muted-foreground',
  published: 'border-primary/50 text-primary',
  archived: 'border-border text-muted-foreground/60',
};

export default function AdminPortfolioManager() {
  const [projects, setProjects] = useState(null);
  const { toast } = useToast();

  const load = () => {
    base44.entities.PortfolioProject.filter({}, 'order', 500)
      .then((rows) => setProjects(rows || []))
      .catch(() => setProjects([]));
  };

  useEffect(() => { load(); }, []);

  const act = async (promise, message) => {
    try {
      await promise;
      toast({ title: message });
      load();
    } catch (error) {
      toast({ title: 'Action failed', description: error.message, variant: 'destructive' });
    }
  };

  const move = (project, dir) => {
    const sorted = [...(projects || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = sorted.findIndex((p) => p.id === project.id);
    const neighbor = dir === 'up' ? index - 1 : index + 1;
    if (neighbor < 0 || neighbor >= sorted.length) return;
    const [moved] = sorted.splice(index, 1);
    sorted.splice(neighbor, 0, moved);
    act(
      base44.entities.PortfolioProject.bulkUpdate(sorted.map((p, i) => ({ id: p.id, order: i }))),
      'Order updated.',
    );
  };

  const publish = async (project) => {
    const assets = await base44.entities.PortfolioAsset.filter({ project_id: project.id }, 'sort_order', 500).catch(() => []);
    const checklist = publishChecklist(project, (assets || []).filter((a) => a.is_public && a.file_url));
    if (!checklist.every((item) => item.pass)) {
      toast({ title: 'Not ready to publish', description: 'Finish the publish checklist in the editor first.', variant: 'destructive' });
      return;
    }
    act(base44.entities.PortfolioProject.update(project.id, { status: 'published' }), 'Case study published.');
  };

  const duplicate = (project) => {
    const { id, created_date, updated_date, created_by_id, ...rest } = project;
    act(
      base44.entities.PortfolioProject.create({
        ...rest,
        title: `${project.title || 'Untitled'} (Copy)`,
        slug: '',
        status: 'draft',
        is_featured: false,
        visibility_reviewed: false,
      }),
      'Project duplicated as a draft.',
    );
  };

  const remove = (project) => {
    if (!window.confirm(`Delete “${project.title || 'Untitled'}” permanently?`)) return;
    act(base44.entities.PortfolioProject.delete(project.id), 'Project deleted.');
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-light text-foreground">
            Portfolio <span className="molten-text italic font-medium">Manager</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Curate the public case-study library — draft, review, publish, feature, and reorder the work.
          </p>
        </div>
        <Link to="/admin/portfolio/new" className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" /> New project
        </Link>
      </div>

      {projects === null ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="dashboard-card p-10 text-center">
          <h2 className="font-heading text-3xl text-foreground">No projects yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Create your first case study — add the story, upload the assets, and publish when it is ready.
          </p>
          <Link to="/admin/portfolio/new" className="btn-forge mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New project
          </Link>
        </div>
      ) : (
        <div className="dashboard-card divide-y divide-border/50 overflow-hidden">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex shrink-0 flex-col">
                <button type="button" onClick={() => move(project, 'up')} className="rounded-sm p-0.5 text-muted-foreground/60 hover:text-foreground" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(project, 'down')} className="rounded-sm p-0.5 text-muted-foreground/60 hover:text-foreground" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
              <button
                type="button"
                onClick={() => act(base44.entities.PortfolioProject.update(project.id, { is_featured: !project.is_featured }), project.is_featured ? 'Removed from featured.' : 'Marked as featured.')}
                className={`shrink-0 rounded-sm p-1.5 ${project.is_featured ? 'text-primary' : 'text-muted-foreground/40 hover:text-primary'}`}
                aria-label="Toggle featured"
              >
                <Star className={`h-4 w-4 ${project.is_featured ? 'fill-current' : ''}`} />
              </button>
              <div className="min-w-0 flex-1">
                <Link to={`/admin/portfolio/${project.id}`} className="block truncate text-sm font-medium text-foreground hover:text-primary">
                  {project.title || 'Untitled project'}
                </Link>
                <p className="truncate text-xs text-muted-foreground/70">
                  {[project.client_name, project.industry, displayYear(project)].filter(Boolean).join('  ·  ')}
                </p>
              </div>
              <span className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-widest ${STATUS_STYLE[project.status] || STATUS_STYLE.draft}`}>
                {project.status}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Link to={`/admin/portfolio/${project.id}`} className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                {project.status === 'published' ? (
                  <button type="button" onClick={() => act(base44.entities.PortfolioProject.update(project.id, { status: 'draft' }), 'Unpublished.')} className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Unpublish"><EyeOff className="h-4 w-4" /></button>
                ) : (
                  <button type="button" onClick={() => publish(project)} className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-primary" aria-label="Publish"><Eye className="h-4 w-4" /></button>
                )}
                <button type="button" onClick={() => act(base44.entities.PortfolioProject.update(project.id, { status: 'archived' }), 'Archived.')} className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Archive"><Trash2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => duplicate(project)} className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                <button type="button" onClick={() => remove(project)} className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}