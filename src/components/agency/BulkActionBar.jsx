import React from 'react';

/**
 * Floating bulk-edit toolbar. Visible while rows are checked; picking a value
 * applies it immediately to every checked row.
 */
export default function BulkActionBar({ count, controls, onApply, onClear }) {
  return (
    <div className="sticky top-24 z-20 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-primary/30 bg-card px-4 py-3 ember-glow-strong">
      <span className="rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
        {count} selected
      </span>
      {controls.map((control) =>
        control.type === 'select' ? (
          <label key={control.key} className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{control.label}</span>
            <select
              className="admin-input w-auto py-1 text-xs"
              value=""
              onChange={(e) => { if (e.target.value) onApply(control.key, e.target.value); }}
            >
              <option value="">Set…</option>
              {control.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        ) : control.type === 'date' ? (
          <label key={control.key} className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{control.label}</span>
            <input
              type="date"
              className="admin-input w-auto py-1 text-xs"
              onChange={(e) => { if (e.target.value) { onApply(control.key, e.target.value); e.target.value = ''; } }}
            />
          </label>
        ) : (
          <label key={control.key} className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{control.label}</span>
            <input
              type="text"
              className="admin-input w-28 py-1 text-xs"
              placeholder="Set…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onApply(control.key, e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
          </label>
        )
      )}
      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        Clear selection
      </button>
    </div>
  );
}