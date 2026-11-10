import React, { useState } from 'react';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

/** Add tasks to a project: type one and press Enter, or describe the work and let AI draft the list. */
export default function TaskQuickAdd({ projectId, nextOrder = 0, onAdded }) {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState('');

  const run = async (mode, work) => {
    if (!text.trim() || busy) return;
    setBusy(mode);
    try {
      const count = await work(text.trim());
      setText('');
      toast({ title: count === 1 ? 'Task added' : `${count} tasks added` });
      onAdded();
    } catch (e) {
      toast({ title: 'Could not add task', description: e.message, variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  const addOne = () => run('one', async (title) => {
    await base44.entities.ProjectTask.create({ project_id: projectId, title, sort_order: nextOrder });
    return 1;
  });

  const addWithAi = () => run('ai', async (brief) => {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You plan work for a branding agency project. Break this request into clear, short task titles (1 to 12 tasks), each with a phase name: "${brief}". If it already reads as a single task, return just that one.`,
      response_json_schema: {
        type: 'object',
        properties: { tasks: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, phase: { type: 'string' } }, required: ['title'] } } },
        required: ['tasks'],
      },
    });
    const rows = ((res?.data ?? res).tasks || []).filter((t) => t.title?.trim());
    if (!rows.length) throw new Error('AI returned no tasks. Try describing the work in more detail.');
    await base44.entities.ProjectTask.bulkCreate(rows.map((t, i) => ({ project_id: projectId, title: t.title.trim(), phase: t.phase?.trim() || undefined, sort_order: nextOrder + i })));
    return rows.length;
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); addOne(); }} className="dashboard-card mb-6 flex flex-wrap items-center gap-2 p-4">
      <input className="admin-input min-w-0 flex-1" placeholder="Add a task, or describe the work for AI…" value={text} disabled={!!busy} onChange={(e) => setText(e.target.value)} aria-label="New task" />
      <button type="submit" disabled={!!busy || !text.trim()} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
        {busy === 'one' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add task
      </button>
      <button type="button" onClick={addWithAi} disabled={!!busy || !text.trim()} className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50">
        {busy === 'ai' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} AI add tasks
      </button>
    </form>
  );
}