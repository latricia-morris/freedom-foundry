import React from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';

/** Editable list of short text entries: add, rewrite, reorder, remove. */
export default function EditableList({ items, onChange, placeholder, addLabel = 'Add entry' }) {
  const list = items || [];

  const update = (i, value) => onChange(list.map((t, idx) => (idx === i ? value : t)));
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {list.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 w-5 flex-shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {String(i + 1).padStart(2, '0')}
          </span>
          <textarea
            className="admin-input min-h-16 flex-1"
            value={item}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
          />
          <div className="mt-1 flex flex-col gap-0.5">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25" aria-label="Move up">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25" aria-label="Move down">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <button type="button" onClick={() => remove(i)} className="mt-1.5 text-muted-foreground transition-colors hover:text-destructive" aria-label="Remove entry">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, ''])}
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}