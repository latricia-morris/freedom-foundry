import React, { useEffect, useState } from 'react';
import { MATRIX_MEASURES, maiValue, matrixWeights } from '@/lib/matrix';

/**
 * The four consultant-reviewable measures plus the internal Market Alignment
 * Index. Every commit sends a complete snapshot of the scores/weights from
 * this editor's local state — never a patch spread from a stale audit prop —
 * so rapid successive commits cannot overwrite each other. The consultant
 * sets every score, weight, client-facing label, and visibility flag; the
 * combined index only computes once all four scores exist, and its formula
 * is never exposed to the client.
 */
export default function MatrixScoresEditor({ audit, onSave, busy }) {
  const [scores, setScores] = useState(() => ({ ...(audit.matrix_scores || {}) }));
  const [weights, setWeights] = useState(() => matrixWeights(audit));
  const [maiLabel, setMaiLabel] = useState(audit.mai_label || '');

  useEffect(() => {
    setScores({ ...(audit.matrix_scores || {}) });
    setWeights(matrixWeights(audit));
    setMaiLabel(audit.mai_label || '');
  }, [audit?.updated_date]);

  const row = (key) => scores[key] || {};
  const mai = maiValue({ matrix_scores: scores, matrix_weights: weights });
  const weightTotal = MATRIX_MEASURES.reduce((s, m) => s + (Number(weights[m.key]) || 0), 0);

  const saveScores = (next) => {
    setScores(next);
    onSave({ matrix_scores: next });
  };
  const saveWeights = (next) => {
    setWeights(next);
    onSave({ matrix_weights: next });
  };

  const commitScore = (key, value) => {
    const next = value === '' ? null : Math.max(0, Math.min(100, Number(value)));
    if ((next ?? null) === (typeof row(key).score === 'number' ? row(key).score : null)) return;
    saveScores({ ...scores, [key]: { ...row(key), score: next } });
  };

  const commitLabel = (key, value) => {
    if ((value || null) === (row(key).client_label || null)) return;
    saveScores({ ...scores, [key]: { ...row(key), client_label: value || null } });
  };

  const toggleVisible = (key, checked) => {
    saveScores({ ...scores, [key]: { ...row(key), client_visible: checked } });
  };

  const commitWeight = (key, value) => {
    const next = value === '' ? 0 : Math.max(0, Number(value));
    if (next === (Number(weights[key]) || 0)) return;
    saveWeights({ ...weights, [key]: next });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        {MATRIX_MEASURES.map((m) => (
          <div key={m.key} className="rounded-sm border border-border/60 bg-background/30 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{m.label}</p>
              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <input
                  type="checkbox"
                  checked={row(m.key).client_visible === true}
                  disabled={busy}
                  onChange={(e) => toggleVisible(m.key, e.target.checked)}
                />
                Show in client report
              </label>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">{m.purpose}</p>
            <div className="mt-3 grid grid-cols-[5rem_1fr_4.5rem] items-center gap-2">
              <input
                className="admin-input"
                type="number"
                min="0"
                max="100"
                placeholder="0–100"
                defaultValue={typeof row(m.key).score === 'number' ? row(m.key).score : ''}
                key={`${m.key}-${row(m.key).score}`}
                disabled={busy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); commitScore(m.key, e.target.value); e.target.blur(); }
                }}
                onBlur={(e) => commitScore(m.key, e.target.value)}
                aria-label={`${m.label} score`}
              />
              <input
                className="admin-input"
                placeholder="Client-facing label (optional)"
                defaultValue={row(m.key).client_label || ''}
                key={`${m.key}-label`}
                disabled={busy}
                onBlur={(e) => commitLabel(m.key, e.target.value)}
                aria-label={`${m.label} client-facing label`}
              />
              <input
                className="admin-input"
                type="number"
                min="0"
                placeholder="Wt %"
                title="Weight (percent)"
                defaultValue={weights[m.key] ?? ''}
                key={`${m.key}-weight`}
                disabled={busy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); commitWeight(m.key, e.target.value); e.target.blur(); }
                }}
                onBlur={(e) => commitWeight(m.key, e.target.value)}
                aria-label={`${m.label} weight percent`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {maiLabel || 'Market Alignment Index'}{' '}
              <span className="text-xs uppercase tracking-widest text-muted-foreground/70">Internal composite</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/80">
              Weighted from the four measures ({weightTotal}% total weight
              {weightTotal !== 100 ? ' — normalizes automatically' : ''}). The formula is never shown to the client.
            </p>
          </div>
          <p className="molten-text font-heading text-4xl font-light leading-none">
            {mai === null ? '—' : mai}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <input
              type="checkbox"
              checked={audit.mai_visible === true}
              disabled={busy}
              onChange={(e) => onSave({ mai_visible: e.target.checked })}
            />
            Show the index to the client
          </label>
          <input
            className="admin-input max-w-64"
            placeholder="Client-facing index label"
            defaultValue={maiLabel}
            key={`mai-label-${maiLabel === '' ? 'empty' : 'set'}`}
            disabled={busy}
            onBlur={(e) => {
              if ((e.target.value || null) !== (audit.mai_label || null)) {
                setMaiLabel(e.target.value);
                onSave({ mai_label: e.target.value || null });
              }
            }}
            aria-label="Client-facing index label"
          />
        </div>
      </div>
    </div>
  );
}