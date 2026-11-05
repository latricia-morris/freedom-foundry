import React from 'react';
import { FileText } from 'lucide-react';
import { Panel, Empty } from '@/components/crm/CrmUi';

export default function UploadHistory({ uploads }) {
  return (
    <Panel title="Sent for review">
      {uploads.length === 0 ? <Empty>Files you send will be listed here.</Empty> : (
        <ul className="divide-y divide-border/40">
          {uploads.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-5 py-3">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{u.file_name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.uploaded_by_name || u.uploaded_by_email} · {new Date(u.created_date).toLocaleDateString()}</p>
              </div>
              <span className="shrink-0 rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">In review</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}