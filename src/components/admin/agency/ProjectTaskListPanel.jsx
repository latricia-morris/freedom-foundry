import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import ListToolbar from '@/components/agency/ListToolbar';
import BulkActionBar from '@/components/agency/BulkActionBar';
import { useListControls } from '@/hooks/useListControls';
import { TASK_STATUS_LABELS } from '@/lib/agency';

const ACTIVE_TASK_STATUSES = ['not_started', 'scheduled', 'in_production', 'internal_review', 'client_review_in_progress', 'waiting_on_client', 'blocked', 'on_hold', 'revisions_requested'];
const TASK_SORT_FIELDS = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'created_date', label: 'Created Date' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
];

/** Shared project task list — the same list used by project management. */
export default function ProjectTaskListPanel({ projectId }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);

  const load = () => {
    base44.entities.ProjectTask.filter({ project_id: projectId }, 'sort_order', 300)
      .then(setTasks)
      .catch(() => setTasks([]));
  };
  useEffect(load, [projectId]);

  const [controls, patchControls] = useListControls(`ff-agency-tasks-controls-${projectId}`, {
    sortBy: 'due_date',
    sortDir: 'asc',
    activeOnly: false,
  });
  const [selectedTasks, setSelectedTasks] = useState(() => new Set());

  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (controls.activeOnly) list = list.filter((t) => ACTIVE_TASK_STATUSES.includes(t.status));
    const dir = controls.sortDir === 'desc' ? -1 : 1;
    const field = (t) => {
      switch (controls.sortBy) {
        case 'created_date': return t.created_date || '';
        case 'status': return t.status || '';
        case 'priority': return t.priority || 'medium';
        default: return t.client_due_date || '';
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
  }, [tasks, controls]);

  const toggleTask = (taskId) => setSelectedTasks((prev) => {
    const next = new Set(prev);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    return next;
  });

  const allTasksSelected = visibleTasks.length > 0 && visibleTasks.every((t) => selectedTasks.has(t.id));
  const toggleAllTasks = () => setSelectedTasks(allTasksSelected ? new Set() : new Set(visibleTasks.map((t) => t.id)));

  const applyTaskBulk = async (key, value) => {
    const ids = [...selectedTasks];
    if (!ids.length) return;
    const fieldMap = {
      status: 'status',
      priority: 'priority',
      assigned_to: 'internal_owner',
      due_date: 'client_due_date',
      phase: 'phase',
    };
    try {
      await base44.entities.ProjectTask.bulkUpdate(ids.map((taskId) => ({ id: taskId, [fieldMap[key]]: value })));
      toast({ title: `Updated ${ids.length} item${ids.length === 1 ? '' : 's'}` });
      load();
    } catch (e) {
      toast({ title: 'Bulk update failed', description: e.message, variant: 'destructive' });
    }
  };

  const taskBulkControls = [
    { key: 'status', label: 'Status', type: 'select', options: Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'priority', label: 'Priority', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] },
    { key: 'assigned_to', label: 'Assigned To', type: 'text' },
    { key: 'due_date', label: 'Due Date', type: 'date' },
    { key: 'phase', label: 'Phase', type: 'select', options: [...new Set(tasks.map((t) => t.phase || 'General'))].map((p) => ({ value: p, label: p })) },
  ];

  const updateTask = async (taskId, patch) => {
    await base44.entities.ProjectTask.update(taskId, patch).catch(() => {});
    load();
  };

  if (tasks.length === 0) return null;

  const phases = [...new Set(visibleTasks.map((t) => t.phase || 'General'))];

  return (
    <>
      <ListToolbar
        sortOptions={TASK_SORT_FIELDS}
        value={controls}
        onChange={patchControls}
        showClientFilter={false}
      />
      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[#d9622c]"
          checked={allTasksSelected}
          onChange={toggleAllTasks}
          aria-label="Select all tasks"
        />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Select all tasks</span>
        <span className="ml-auto text-xs text-muted-foreground/70">
          {visibleTasks.length} of {tasks.length} task{tasks.length === 1 ? '' : 's'}
        </span>
      </div>
      {selectedTasks.size > 0 && (
        <BulkActionBar
          count={selectedTasks.size}
          controls={taskBulkControls}
          onApply={applyTaskBulk}
          onClear={() => setSelectedTasks(new Set())}
        />
      )}
      {phases.map((phase) => (
        <div key={phase} className="dashboard-card mb-6 p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">{phase}</h3>
          <div className="space-y-2">
            {visibleTasks.filter((t) => (t.phase || 'General') === phase).map((task) => (
              <div key={task.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border/70 bg-background/40 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#d9622c]"
                  checked={selectedTasks.has(task.id)}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Select ${task.title}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground/70">
                    Internal ready: {task.internal_ready_date || '—'} · Client due: {task.client_due_date || '—'}
                  </p>
                </div>
                <select
                  className="admin-input w-auto py-1.5 text-xs"
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value })}
                >
                  {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}