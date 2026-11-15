import React, { useState } from 'react';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { Field, GHOST, StatusSelect } from '@/components/admin/learn/fields';
import ResourcesEditor from '@/components/admin/learn/ResourcesEditor';

/** One module (or book part): title, status and its shared resources. */
export default function ModuleForm({ module, saving, onSave, onDelete }) {
  const [d, setD] = useState(module);
  const set = (patch) => setD((prev) => ({ ...prev, ...patch }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <Field label="Title"><input className="admin-input" value={d.title || ''} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Status"><StatusSelect value={d.status} onChange={(status) => set({ status })} /></Field>
      </div>
      <Field label="Description"><textarea className="admin-input min-h-20" value={d.description || ''} onChange={(e) => set({ description: e.target.value })} /></Field>
      <ResourcesEditor label="Resources (shown on every lesson in this module)" items={d.resources} onChange={(resources) => set({ resources })} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <button type="button" disabled={saving || !d.title?.trim()} onClick={() => onSave({ title: d.title.trim(), description: d.description || '', status: d.status, resources: d.resources || [] })}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
        <button type="button" onClick={onDelete} className={GHOST}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
      </div>
    </div>
  );
}