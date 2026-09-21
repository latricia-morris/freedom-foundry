import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

const KINDS = [
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'file', label: 'File' },
  { value: 'url', label: 'URL' },
  { value: 'evidence_link', label: 'Evidence link' },
];

/** Evidence and reference material; internal-only items never reach the client. */
export default function EvidenceList({ items, onSave }) {
  const [rows, setRows] = useState([]);
  useEffect(() => setRows(items || []), [items]);

  const update = (i, patch) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select className="admin-input w-36" value={row.kind || 'url'} onChange={(e) => update(i, { kind: e.target.value })}>
            {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
          <input className="admin-input max-w-48" placeholder="Title" value={row.title || ''} onChange={(e) => update(i, { title: e.target.value })} />
          <input className="admin-input min-w-48 flex-1" placeholder="URL" value={row.url || ''} onChange={(e) => update(i, { url: e.target.value })} />
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={!!row.internal_only} onChange={(e) => update(i, { internal_only: e.target.checked })} />
            Internal only
          </label>
          <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Remove evidence" className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => setRows([...rows, { kind: 'url', title: '', url: '', internal_only: true }])} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          <Plus className="h-3.5 w-3.5" /> Add evidence
        </button>
        <button type="button" onClick={() => onSave(rows.filter((r) => r.url))} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
          <Save className="h-3.5 w-3.5" /> Save evidence
        </button>
      </div>
    </div>
  );
}