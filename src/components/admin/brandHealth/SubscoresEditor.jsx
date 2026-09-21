import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

/** Consultant-controlled component subscores, saved as a set. */
export default function SubscoresEditor({ subscores, onSave }) {
  const [rows, setRows] = useState([]);
  useEffect(() => setRows(subscores || []), [subscores]);

  const update = (i, patch) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i) => setRows(rows.filter((_, j) => j !== i));
  const add = () => setRows([...rows, { label: '', score: undefined }]);

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className="admin-input"
            placeholder="Component name (e.g. Search presence)"
            value={row.label || ''}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <input
            type="number"
            min="0"
            max="100"
            className="admin-input w-24"
            placeholder="0–100"
            value={row.score ?? ''}
            onChange={(e) => update(i, { score: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove subscore"
            className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          <Plus className="h-3.5 w-3.5" /> Add subscore
        </button>
        <button type="button" onClick={() => onSave(rows)} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
          <Save className="h-3.5 w-3.5" /> Save subscores
        </button>
      </div>
    </div>
  );
}