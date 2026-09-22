import React from 'react';
import { METHODOLOGY_OPTIONS } from '@/lib/visibility';

/**
 * Controlled editor for the full audit sections stored on a visibility
 * report: title, methodology label, verbatim body, lookup table, and the
 * two client-gating flags. Used by the intake review step and the admin
 * report detail panel — one source of truth for the shape of the data.
 */
export default function SectionsEditor({ sections, onChange }) {
  const list = sections || [];

  const update = (i, patch) => onChange(list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...list, { title: '', methodology: 'none', body: '', client_visible: true, release_with_recommendations: false }]);

  const setCell = (i, r, c, value) => {
    const table = list[i].table || { header: [], rows: [] };
    const rows = (table.rows || []).map((row) => [...row]);
    while (rows.length <= r) rows.push(new Array(table.header?.length || 3).fill(''));
    rows[r][c] = value;
    update(i, { table: { ...table, rows } });
  };

  const addRow = (i) => {
    const table = list[i].table || { header: [], rows: [] };
    const cols = table.header?.length || 3;
    update(i, { table: { ...table, rows: [...(table.rows || []), new Array(cols).fill('')] } });
  };

  const setHeaderCell = (i, c, value) => {
    const table = list[i].table || { header: [], rows: [] };
    const header = [...(table.header || [])];
    while (header.length < c + 1) header.push('');
    header[c] = value;
    update(i, { table: { ...table, header } });
  };

  return (
    <div className="space-y-4">
      {list.map((s, i) => {
        const cols = s.table?.header?.length || 3;
        return (
          <div key={i} className="forged-well space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{String(i + 1).padStart(2, '0')}</span>
              <input
                className="admin-input flex-1 min-w-[12rem]"
                value={s.title || ''}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Section title"
              />
              <select className="admin-input w-auto" value={s.methodology || 'none'} onChange={(e) => update(i, { methodology: e.target.value })}>
                {METHODOLOGY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button type="button" onClick={() => remove(i)} className="px-1 text-sm text-muted-foreground transition-colors hover:text-destructive" aria-label="Remove section">×</button>
            </div>
            <textarea
              className="admin-input min-h-32"
              value={s.body || ''}
              onChange={(e) => update(i, { body: e.target.value })}
              placeholder="Verbatim section text from the source audit"
            />
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={s.client_visible !== false} onChange={(e) => update(i, { client_visible: e.target.checked })} />
                Client-visible
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!s.release_with_recommendations}
                  onChange={(e) => update(i, { release_with_recommendations: e.target.checked, client_visible: e.target.checked ? false : s.client_visible })}
                />
                Releases when recommendations are enabled
              </label>
            </div>
            {s.table ? (
              <div className="space-y-2 rounded-sm border border-border/60 p-3">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                  {(s.table.header || new Array(cols).fill('')).map((h, c) => (
                    <input key={c} className="admin-input text-xs" value={h || ''} onChange={(e) => setHeaderCell(i, c, e.target.value)} placeholder={`Column ${c + 1}`} />
                  ))}
                </div>
                {(s.table.rows || []).map((row, r) => (
                  <div key={r} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr)) auto` }}>
                    {(row || []).map((cell, c) => (
                      <input key={c} className="admin-input text-xs" value={cell || ''} onChange={(e) => setCell(i, r, c, e.target.value)} />
                    ))}
                    <button
                      type="button"
                      onClick={() => update(i, { table: { ...s.table, rows: (s.table.rows || []).filter((_, idx) => idx !== r) } })}
                      className="px-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Remove row"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => addRow(i)} className="text-[10px] uppercase tracking-widest text-primary hover:opacity-80">+ Add row</button>
                  <button type="button" onClick={() => update(i, { table: undefined })} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">Remove table</button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => update(i, { table: { header: ['Name', 'Detail', 'Source'], rows: [['', '', '']] } })}
                className="text-[10px] uppercase tracking-widest text-primary hover:opacity-80"
              >
                + Add table
              </button>
            )}
          </div>
        );
      })}
      <button type="button" onClick={add} className="text-[10px] uppercase tracking-widest text-primary hover:opacity-80">+ Add section</button>
    </div>
  );
}