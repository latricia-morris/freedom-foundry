import React from 'react';
import { Link2, Trash2 } from 'lucide-react';
import { GHOST, LABEL, UploadButton } from '@/components/admin/learn/fields';

/** Files and links attached to a course, module or lesson. */
export default function ResourcesEditor({ label = 'Resources', items, onChange }) {
  const list = items || [];
  const set = (i, patch) => onChange(list.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div>
      <span className={LABEL}>{label}</span>
      <div className="space-y-2">
        {list.map((r, i) => (
          <div key={i} className="grid items-center gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
            <input aria-label="Resource title" className="admin-input" placeholder="Title" value={r.title || ''} onChange={(e) => set(i, { title: e.target.value })} />
            {r.file_uri
              ? <span className="admin-input truncate">{r.file_name || 'Uploaded file'}</span>
              : <input aria-label="Resource link" className="admin-input" placeholder="https://" value={r.url || ''} onChange={(e) => set(i, { url: e.target.value })} />}
            <button type="button" aria-label="Remove resource" onClick={() => onChange(list.filter((_, j) => j !== i))} className="p-2 text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={GHOST} onClick={() => onChange([...list, { title: '', url: '' }])}><Link2 className="h-3.5 w-3.5" /> Add link</button>
        <UploadButton label="Upload file" onUploaded={(f) => onChange([...list, { title: f.file_name, file_uri: f.file_uri, file_name: f.file_name }])} />
      </div>
    </div>
  );
}