import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const CATEGORIES = ['Offers & Packaging', 'Sales', 'Marketing', 'Delivery', 'Systems', 'Team', 'Finance', 'Legal'];
const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function AdminAgencyBuild() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [busy, setBusy] = useState(false);

  const load = () => {
    base44.entities.AgencyBuildTask.list('order', 500)
      .then((list) => setTasks(list || []))
      .catch(() => setTasks([]));
  };
  useEffect(load, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await base44.entities.AgencyBuildTask.create({
        title: title.trim(),
        category,
        status: 'todo',
        priority: 'medium',
        order: (tasks?.length || 0) + 1,
      });
      setTitle('');
      load();
    } catch (err) {
      toast({ title: 'Could not add task', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (task, status) => {
    await base44.entities.AgencyBuildTask.update(task.id, { status }).catch(() => {});
    load();
  };

  const removeTask = async (task) => {
    if (!window.confirm(`Remove "${task.title}" from the checklist?`)) return;
    await base44.entities.AgencyBuildTask.delete(task.id).catch(() => {});
    load();
  };

  const list = tasks || [];
  const done = list.filter((t) => t.status === 'done').length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;

  return (
    <div className="max-w-4xl animate-fade-in pb-12">
      <h1 className="font-heading text-3xl font-light text-foreground mb-2">Agency Build</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Your internal checklist for building the agency — runs alongside client work, never mixed into it.
      </p>

      <div className="dashboard-card mb-6 p-6">
        <div className="mb-3 flex items-end justify-between">
          <span className="font-heading text-2xl text-foreground">{pct}%</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">{done} of {list.length} done</span>
        </div>
        <div className="well-track h-2 w-full">
          <div className="molten-bar h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <form onSubmit={addTask} className="dashboard-card mb-6 flex flex-wrap items-end gap-3 p-6">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">New task</span>
          <input
            className="admin-input py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing to build the agency?"
          />
        </label>
        <label>
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Category</span>
          <select className="admin-input py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add task
        </button>
      </form>

      <div className="dashboard-card p-0">
        {tasks === null ? (
          <div className="flex justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : list.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">Nothing here yet. Add the first thing you want to build.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {list.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <select
                  className="admin-input w-auto py-1.5 text-xs"
                  value={task.status}
                  onChange={(e) => setStatus(task, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  {task.category && (
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{task.category}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeTask(task)}
                  className="rounded-sm p-1.5 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${task.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}