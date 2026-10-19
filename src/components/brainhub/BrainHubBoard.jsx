import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Link2, Plus, Trash2, X } from 'lucide-react';

export default function BrainHubBoard({ tab, items, loading, onReload }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const isChecklist = tab === 'checklist';

  const save = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await base44.entities.BrainHubItem.create({
        tab,
        title: title.trim(),
        notes: notes.trim() || null,
        link_url: linkUrl.trim() || null,
        done: false,
      });
      setTitle('');
      setNotes('');
      setLinkUrl('');
      setOpen(false);
      onReload();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (item) => {
    await base44.entities.BrainHubItem.update(item.id, { done: !item.done });
    onReload();
  };

  const remove = async (item) => {
    await base44.entities.BrainHubItem.delete(item.id);
    onReload();
  };

  return (
    <div>
      <div className="mb-5">
        {open ? (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Add item</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cancel" className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full border border-border bg-input text-foreground text-sm rounded-sm px-3 py-2.5 outline-none focus:border-primary"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={3}
              className="w-full border border-border bg-input text-foreground text-sm rounded-sm px-3 py-2.5 outline-none focus:border-primary"
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Link (optional)"
              className="w-full border border-border bg-input text-foreground text-sm rounded-sm px-3 py-2.5 outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={save}
              disabled={busy || !title.trim()}
              className="btn-forge rounded-sm px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm border border-primary/40 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Add item
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        </div>
      ) : isChecklist ? (
        <div className="rounded-2xl overflow-hidden bg-card border border-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => toggle(item)}
                aria-label={item.done ? 'Mark as not done' : 'Mark as done'}
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border transition-colors ${
                  item.done ? 'btn-forge border-transparent' : 'border-border hover:border-primary'
                }`}
              >
                {item.done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.title}
                </p>
                {item.notes && <p className="mt-0.5 text-xs text-muted-foreground whitespace-pre-line">{item.notes}</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label="Delete item"
                className="p-1.5 text-destructive/80 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading text-lg text-foreground">{item.title}</p>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label="Delete item"
                  className="p-1 text-destructive/70 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              {item.notes && <p className="mt-2 flex-1 text-sm text-muted-foreground whitespace-pre-line">{item.notes}</p>}
              {item.link_url && (
                <a
                  href={item.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a482d] hover:opacity-80 transition-opacity"
                >
                  <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Open link
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}