import React from 'react';
import { FileText, Check } from 'lucide-react';
import { Panel, Empty } from '@/components/crm/CrmUi';

/** Intake list. Reviewers (onOpen/onReview) can open files and mark them reviewed. */
export default function UploadHistory({ uploads, onOpen, onReview, title = 'Sent for review' }) {
  return (
    <Panel title={title}>
      {uploads.length === 0 ? <Empty>Files you send will be listed here.</Empty> : (
        <ul className="divide-y divide-border/40">
          {uploads.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{u.file_name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.uploaded_by_name || u.uploaded_by_email} · {new Date(u.created_date).toLocaleDateString()}</p>
                {u.note && <p className="mt-1 text-xs italic text-muted-foreground">“{u.note}”</p>}
              </div>
              <span className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-widest ${u.status === 'reviewed' ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground'}`}>
                {u.status === 'reviewed' ? 'Reviewed' : 'In review'}
              </span>
              {onOpen && <button type="button" onClick={() => onOpen(u.id)} className="text-xs uppercase tracking-widest link-warm">Open</button>}
              {onReview && u.status !== 'reviewed' && (
                <button type="button" onClick={() => onReview(u.id)} className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  <Check className="h-3.5 w-3.5" /> Mark reviewed
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}