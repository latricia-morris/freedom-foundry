import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { ACTION_PRIORITIES } from '@/lib/brandHealth';

const ITEM_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

/** Consultant-authored client action-plan items, saved as a set. */
export default function ActionPlanEditor({ items, onSave }) {
  const [rows, setRows] = useState([]);
  useEffect(() => setRows(items || []), [items]);

  const update = (i, patch) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i) => setRows(rows.filter((_, j) => j !== i));
  const add = () => setRows([...rows, { title: '', detail: '', priority: 'medium', status: 'open' }]);

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="space-y-2 rounded-sm border border-border/60 bg-background/40 p-3">
          <div className="flex items-center gap-2">
            <input className="admin-input" placeholder="Action item title" value={row.title || ''} onChange={(e) => update(i, { title: e.target.value })} />
            <select className="admin-input w-36" value={row.priority || 'medium'} onChange={(e) => update(i, { priority: e.target.value })}>
              {ACTION_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <select className="admin-input w-36" value={row.status || 'open'} onChange={(e) => update(i, { status: e.target.value })}>
              {ITEM_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button type="button" onClick={() => remove(i)} aria-label="Remove action item" className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea className="admin-input" rows={2} placeholder="What the client should do and why" value={row.detail || ''} onChange={(e) => update(i, { detail: e.target.value })} />
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          <Plus className="h-3.5 w-3.5" /> Add action item
        </button>
        <button type="button" onClick={() => onSave(rows)} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
          <Save className="h-3.5 w-3.5" /> Save action plan
        </button>
      </div>
    </div>
  );
}