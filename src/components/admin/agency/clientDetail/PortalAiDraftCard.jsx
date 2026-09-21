import React from 'react';
import { Check, FilePlus2, PencilLine, X } from 'lucide-react';
import { PORTAL_ENTITY_LABELS, findPortalRecord } from '@/lib/clientPortalData';

const showValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/** Preview of AI-proposed portal changes. Nothing is saved until the admin approves. */
export default function PortalAiDraftCard({ draft, snapshot, onApprove, onDiscard, applying }) {
  return (
    <div className="dashboard-card border-primary/30 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-2xl text-foreground">Proposed portal changes</h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Draft — nothing is saved yet</span>
      </div>
      <div className="space-y-4">
        {draft.map((change, index) => {
          const current = change.action === 'update' ? findPortalRecord(snapshot, change.entity, change.record_id) : null;
          const label = PORTAL_ENTITY_LABELS[change.entity] || change.entity;
          return (
            <div key={`${change.entity}-${change.record_id || 'new'}-${index}`} className="rounded-md border border-border/70 bg-background/40 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {change.action === 'create'
                  ? <FilePlus2 className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  : <PencilLine className="h-4 w-4 text-primary" strokeWidth={1.5} />}
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {change.action === 'create' ? 'New' : current?.title || 'Update'}
                </span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">{change.summary}</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/60">
                      {['Field', 'Current', 'Proposed'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(change.fields || {}).map(([field, value]) => (
                      <tr key={field} className="border-t border-border/30">
                        <td className="px-3 py-2 text-xs text-muted-foreground">{field}</td>
                        <td className="max-w-xs px-3 py-2 text-xs text-muted-foreground/70">
                          <span className="line-clamp-2">{current ? showValue(current[field]) : 'New record'}</span>
                        </td>
                        <td className="max-w-xs px-3 py-2 text-xs text-foreground">
                          <span className="line-clamp-2">{showValue(value)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onApprove}
          disabled={applying}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
        >
          <Check className="h-4 w-4" /> {applying ? 'Applying…' : `Approve ${draft.length} change${draft.length === 1 ? '' : 's'}`}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={applying}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <X className="h-4 w-4" /> Discard
        </button>
      </div>
    </div>
  );
}