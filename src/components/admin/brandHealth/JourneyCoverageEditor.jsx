import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { JOURNEY_STAGES, JOURNEY_STATUS_LABELS, journeyWeights, seededJourneyRows } from '@/lib/matrix';

/**
 * Customer Journey Coverage editor: the five fixed stages with consultant-set
 * coverage, status, notes, weights, and per-stage client visibility. The
 * consultant confirms every status and writes every client-facing line —
 * nothing is auto-generated.
 */
export default function JourneyCoverageEditor({ audit, onSave, busy }) {
  const [rows, setRows] = useState(() => seededJourneyRows(audit));
  const [weights, setWeights] = useState(() => journeyWeights(audit));

  useEffect(() => {
    setRows(seededJourneyRows(audit));
    setWeights(journeyWeights(audit));
  }, [audit?.id, audit?.updated_date]);

  const updateRow = (i, patch) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const weightedCoverage = () => {
    let acc = 0;
    let total = 0;
    rows.forEach((r, i) => {
      const w = Number(weights[JOURNEY_STAGES[i].key]) || 0;
      if (typeof r.coverage === 'number') acc += r.coverage * w;
      total += w;
    });
    return total > 0 ? Math.round(acc / total) : null;
  };

  const dirty = JSON.stringify(rows) !== JSON.stringify(seededJourneyRows(audit))
    || JSON.stringify(weights) !== JSON.stringify(journeyWeights(audit));

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted-foreground/80">
        Weighted from stage coverage: <span className="text-foreground">{weightedCoverage() ?? '—'}</span>
        {' '}— confirm or set the Journey Coverage Score in the measures editor above.
      </p>

      <div className="space-y-3">
        {rows.map((row, i) => {
          const stage = JOURNEY_STAGES[i];
          return (
            <div key={stage.key} className="rounded-sm border border-border/60 bg-background/30 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{stage.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">{stage.examples}</p>
                </div>
                <div className="flex items-end gap-2">
                  <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    Coverage %
                    <input
                      className="admin-input w-24"
                      type="number"
                      min="0"
                      max="100"
                      value={row.coverage ?? ''}
                      disabled={busy}
                      onChange={(e) => updateRow(i, { coverage: e.target.value === '' ? null : Math.max(0, Math.min(100, Number(e.target.value))) })}
                    />
                  </label>
                  <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    Status
                    <select className="admin-input" value={row.status} disabled={busy} onChange={(e) => updateRow(i, { status: e.target.value })}>
                      {Object.entries(JOURNEY_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    Weight %
                    <input
                      className="admin-input w-20"
                      type="number"
                      min="0"
                      value={weights[stage.key] ?? ''}
                      disabled={busy}
                      onChange={(e) => setWeights((w) => ({ ...w, [stage.key]: e.target.value === '' ? 0 : Number(e.target.value) }))}
                    />
                  </label>
                  <label className="flex items-center gap-1.5 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <input type="checkbox" checked={row.client_visible} disabled={busy} onChange={(e) => updateRow(i, { client_visible: e.target.checked })} />
                    Client sees stage
                  </label>
                </div>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Internal notes
                  <textarea className="admin-input" rows={2} value={row.internal_notes} disabled={busy} onChange={(e) => updateRow(i, { internal_notes: e.target.value })} />
                </label>
                <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Client-facing notes (approved copy only)
                  <textarea className="admin-input" rows={2} value={row.client_notes} disabled={busy} onChange={(e) => updateRow(i, { client_notes: e.target.value })} />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={busy || !dirty}
        onClick={() => onSave({ journey_coverage: rows, journey_weights: weights })}
        className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-40"
      >
        <Save className="h-3.5 w-3.5" /> Save journey coverage
      </button>
    </div>
  );
}