import React, { useState } from 'react';
import { CheckCircle2, Copy, Eye, EyeOff, ListTodo, Pencil, Pin, PinOff, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { NOTE_COMPONENT_OPTIONS, NOTE_PRIORITIES, fmtDate } from '@/lib/brandHealth';

const EMPTY_NOTE = {
  id: null,
  title: '',
  body: '',
  component: 'digital_brand_health',
  visibility: 'internal_only',
  priority: 'observation',
  note_status: 'open',
  pinned: false,
  attachments: [],
};

const PRIORITY_STYLE = {
  critical: 'border-red-500/40 text-red-400',
  high: 'border-primary/40 text-primary',
  medium: 'border-border text-muted-foreground',
  opportunity: 'border-border text-muted-foreground',
  observation: 'border-border text-muted-foreground/70',
};

const ATTACHMENT_KINDS = ['screenshot', 'file', 'url', 'evidence_link'];

const actionBtn = 'rounded-sm p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground';

/** Internal-only by default. Client-facing notes become Consultant Findings once the audit is published. */
export default function NotesPanel({ audit, notes, reload, onConvertToAction }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(null);
  const sorted = [...(notes || [])].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const today = new Date().toISOString().slice(0, 10);

  const act = async (fn, message) => {
    try {
      await fn();
      toast({ title: message });
      reload();
    } catch (err) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    }
  };

  const saveNote = () =>
    act(async () => {
      if (!draft.body.trim()) throw new Error('Note body is required.');
      const payload = {
        audit_id: audit.id,
        agency_client_id: audit.agency_client_id,
        title: draft.title.trim() || null,
        body: draft.body,
        component: draft.component,
        visibility: draft.visibility,
        priority: draft.priority,
        note_status: draft.note_status,
        pinned: !!draft.pinned,
        attachments: (draft.attachments || []).filter((a) => a.url),
      };
      if (draft.visibility === 'client_facing' && !draft.published_at) payload.published_at = today;
      if (draft.id) await base44.entities.ConsultantNote.update(draft.id, payload);
      else await base44.entities.ConsultantNote.create(payload);
      setDraft(null);
    }, 'Note saved');

  const toggleVisibility = (n) =>
    act(() => base44.entities.ConsultantNote.update(n.id, {
      visibility: n.visibility === 'client_facing' ? 'internal_only' : 'client_facing',
      ...(n.visibility !== 'client_facing' && !n.published_at ? { published_at: today } : {}),
    }), n.visibility === 'client_facing' ? 'Note is now internal only' : 'Note is now client-facing');

  const makeFollowUpTask = (n) =>
    act(() => base44.entities.AgencyBuildTask.create({
      title: n.title || 'Brand health follow-up',
      notes: n.body,
      category: 'Operations',
      status: 'todo',
    }), 'Follow-up task added to Agency Build');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sorted.length} note{sorted.length === 1 ? '' : 's'} · internal by default</p>
        <button type="button" onClick={() => setDraft({ ...EMPTY_NOTE })} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
          <Plus className="h-3.5 w-3.5" /> New note
        </button>
      </div>

      {draft && (
        <div className="space-y-3 rounded-sm border border-border/60 bg-background/40 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="admin-input" placeholder="Title (optional)" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <select className="admin-input" value={draft.component} onChange={(e) => setDraft({ ...draft, component: e.target.value })}>
              {NOTE_COMPONENT_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select className="admin-input" value={draft.visibility} onChange={(e) => setDraft({ ...draft, visibility: e.target.value })}>
              <option value="internal_only">Internal Only</option>
              <option value="client_facing">Client-Facing</option>
            </select>
            <select className="admin-input" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
              {NOTE_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <select className="admin-input" value={draft.note_status} onChange={(e) => setDraft({ ...draft, note_status: e.target.value })}>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={!!draft.pinned} onChange={(e) => setDraft({ ...draft, pinned: e.target.checked })} />
              Pin this note
            </label>
          </div>
          <textarea className="admin-input" rows={4} placeholder="Note body" value={draft.body || ''} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Attachments</p>
            {(draft.attachments || []).map((a, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select className="admin-input w-36" value={a.kind || 'url'} onChange={(e) => setDraft({ ...draft, attachments: draft.attachments.map((x, j) => (j === i ? { ...x, kind: e.target.value } : x)) })}>
                  {ATTACHMENT_KINDS.map((k) => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
                </select>
                <input className="admin-input max-w-44" placeholder="Title" value={a.title || ''} onChange={(e) => setDraft({ ...draft, attachments: draft.attachments.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                <input className="admin-input min-w-44 flex-1" placeholder="URL" value={a.url || ''} onChange={(e) => setDraft({ ...draft, attachments: draft.attachments.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
                <button type="button" onClick={() => setDraft({ ...draft, attachments: draft.attachments.filter((_, j) => j !== i) })} aria-label="Remove attachment" className={actionBtn}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setDraft({ ...draft, attachments: [...(draft.attachments || []), { kind: 'url', title: '', url: '' }] })} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              <Plus className="h-3.5 w-3.5" /> Add attachment
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className="rounded-md border border-border px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">Cancel</button>
            <button type="button" onClick={saveNote} className="btn-forge rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">Save note</button>
          </div>
        </div>
      )}

      {sorted.map((note) => (
        <div key={note.id} className={`rounded-sm border p-4 ${note.pinned ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-background/40'}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{note.title || 'Untitled note'}</p>
            <div className="flex items-center gap-1.5">
              {note.pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
              <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${note.visibility === 'client_facing' ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground/70'}`}>
                {note.visibility === 'client_facing' ? 'Client-Facing' : 'Internal'}
              </span>
              <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${PRIORITY_STYLE[note.priority] || PRIORITY_STYLE.medium}`}>
                {note.priority}
              </span>
              <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${note.note_status === 'resolved' ? 'border-emerald-500/40 text-emerald-400' : 'border-border text-muted-foreground'}`}>
                {note.note_status}
              </span>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{note.body}</p>
          {(note.attachments || []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3">
              {note.attachments.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noreferrer" className="link-warm">{a.title || a.url}</a>
              ))}
            </div>
          )}
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {note.created_by || 'Consultant'} · created {fmtDate(note.created_date)} · last edited {fmtDate(note.updated_date)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-border/40 pt-2">
            <button type="button" onClick={() => setDraft({ ...note, attachments: [...(note.attachments || [])] })} title="Edit note" className={actionBtn}><Pencil className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => act(() => base44.entities.ConsultantNote.create({
              audit_id: note.audit_id,
              agency_client_id: note.agency_client_id,
              title: `${note.title || 'Note'} (copy)`,
              body: note.body,
              component: note.component,
              visibility: note.visibility,
              priority: note.priority,
              note_status: note.note_status,
              pinned: false,
              attachments: note.attachments || [],
            }), 'Note duplicated')} title="Duplicate note" className={actionBtn}><Copy className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => act(() => base44.entities.ConsultantNote.update(note.id, { pinned: !note.pinned }), note.pinned ? 'Note unpinned' : 'Note pinned')} title={note.pinned ? 'Unpin note' : 'Pin note'} className={actionBtn}>
              {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => act(() => base44.entities.ConsultantNote.update(note.id, { note_status: note.note_status === 'open' ? 'resolved' : 'open' }), note.note_status === 'open' ? 'Note resolved' : 'Note reopened')} title={note.note_status === 'open' ? 'Mark resolved' : 'Reopen'} className={actionBtn}>
              {note.note_status === 'open' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => toggleVisibility(note)} title={note.visibility === 'client_facing' ? 'Make internal only' : 'Make client-facing finding'} className={actionBtn}>
              {note.visibility === 'client_facing' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => act(async () => { await onConvertToAction(note); }, 'Added to the action plan')} title="Convert to action-plan item" className={actionBtn}><ListTodo className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => makeFollowUpTask(note)} title="Convert to follow-up task (Agency Build)" className={actionBtn}><ListTodo className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => act(() => base44.entities.ConsultantNote.delete(note.id), 'Note deleted')} title="Delete note" className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ))}

      {!sorted.length && !draft && (
        <p className="text-sm text-muted-foreground/70">No consultant notes yet. Add the first one above.</p>
      )}
    </div>
  );
}