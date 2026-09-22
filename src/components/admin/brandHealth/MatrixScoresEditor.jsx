import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MATRIX_MEASURES, MATRIX_SCORECARDS, maiValue, matrixStatusLabel, matrixWeights } from '@/lib/matrix';

const STATUS_BADGE = {
  Strong: 'border-emerald-500/40 text-emerald-400',
  Active: 'border-primary/50 text-primary',
  Partial: 'border-amber-500/50 text-amber-500',
  Build: 'border-copper/50 text-copper',
  Critical: 'border-destructive/50 text-destructive',
};

const EMPTY_ROW = {
  score: null,
  client_label: null,
  client_visible: false,
  summary: '',
  measures: '',
  evidence: [],
  interpretation: '',
  implication: '',
  constraint: '',
  priorities: [],
  success_evidence: [],
  internal_notes: '',
  last_reviewed: null,
};

/**
 * The five Marketing Matrix diagnostic scorecards. The summary grid stays
 * clean (name, score, status, one-sentence interpretation); View Details
 * expands the full diagnostic: what is measured, evidence, interpretation,
 * business implication, primary constraint, improvement priorities, success
 * evidence, internal notes, last reviewed date, and the client-facing toggle
 * (off by default). Scores are manually entered whole numbers 0–100; nothing
 * is calculated or inferred. Every commit sends a complete snapshot of
 * matrix_scores from this editor's local state, so rapid successive commits
 * cannot overwrite each other. The MAI composite stays internal-only below.
 */
export default function MatrixScoresEditor({ audit, onSave, busy }) {
  const [scores, setScores] = useState(() => ({ ...(audit.matrix_scores || {}) }));
  const [weights, setWeights] = useState(() => matrixWeights(audit));
  const [maiLabel, setMaiLabel] = useState(audit.mai_label || '');
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    setScores({ ...(audit.matrix_scores || {}) });
    setWeights(matrixWeights(audit));
    setMaiLabel(audit.mai_label || '');
  }, [audit?.updated_date]);

  const row = (key) => ({ ...EMPTY_ROW, ...((scores[key] || {}) ) });
  const mai = maiValue({ matrix_scores: scores, matrix_weights: weights });
  const weightTotal = MATRIX_MEASURES.reduce((s, m) => s + (Number(weights[m.key]) || 0), 0);
  const inMai = (key) => MATRIX_MEASURES.some((m) => m.key === key);

  const commitRow = (key, patch) => {
    const next = { ...scores, [key]: { ...row(key), ...patch } };
    setScores(next);
    onSave({ matrix_scores: next });
  };

  const commitScore = (key, value) => {
    const parsed = value === '' ? null : Math.round(Number(value));
    const next = parsed === null || !Number.isFinite(parsed) ? null : Math.max(0, Math.min(100, parsed));
    if ((next ?? null) === (typeof row(key).score === 'number' ? row(key).score : null)) return;
    commitRow(key, { score: next });
  };

  const commitText = (key, field, value) => {
    if ((value || '') !== (row(key)[field] || '')) commitRow(key, { [field]: value || '' });
  };

  const commitLines = (key, field, value) => {
    const arr = String(value || '').split('\n').map((l) => l.trim()).filter(Boolean);
    const prev = row(key)[field] || [];
    if (arr.length === prev.length && arr.every((v, i) => v === prev[i])) return;
    commitRow(key, { [field]: arr });
  };

  const commitWeight = (key, value) => {
    const next = value === '' ? 0 : Math.max(0, Number(value));
    if (next === (Number(weights[key]) || 0)) return;
    const w = { ...weights, [key]: next };
    setWeights(w);
    onSave({ matrix_weights: w });
  };

  const open = MATRIX_SCORECARDS.find((m) => m.key === openKey);
  const openRow = open ? row(open.key) : null;

  return (
    <div className="space-y-5">
      {/* Summary grid — five equal diagnostic cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {MATRIX_SCORECARDS.map((m) => {
          const r = row(m.key);
          const status = matrixStatusLabel(r.score);
          return (
            <div key={m.key} className="flex flex-col rounded-sm border border-border/60 bg-background/30 p-4">
              <p className="text-sm font-medium text-foreground">{m.label}</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="molten-text font-heading text-4xl font-light leading-none">
                  {typeof r.score === 'number' ? r.score : '—'}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">out of 100</span>
              </div>
              {status && (
                <span className={`mt-2 w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_BADGE[status]}`}>
                  {status}
                </span>
              )}
              <p className="mt-2.5 flex-1 text-xs leading-relaxed text-muted-foreground/85">
                {r.summary || 'Interpretation will appear once the scorecard is filled in.'}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpenKey(openKey === m.key ? null : m.key)}
                className="mt-3 self-start text-[10px] font-semibold uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
              >
                {openKey === m.key ? 'Hide details' : 'View details'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Expanded diagnostic detail */}
      {open && openRow && (
        <div className="rounded-sm border border-primary/25 bg-background/20 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <h4 className="font-heading text-xl font-light text-foreground">{open.label}</h4>
              {matrixStatusLabel(openRow.score) && (
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_BADGE[matrixStatusLabel(openRow.score)]}`}>
                  {matrixStatusLabel(openRow.score)}
                </span>
              )}
            </div>
            <button type="button" onClick={() => setOpenKey(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close details">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-[200px_1fr]">
            <div className="space-y-4">
              <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Score (0–100, whole numbers)
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0–100"
                  defaultValue={typeof openRow.score === 'number' ? openRow.score : ''}
                  key={`${open.key}-score-${openRow.score}`}
                  disabled={busy}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitScore(open.key, e.target.value); e.target.blur(); } }}
                  onBlur={(e) => commitScore(open.key, e.target.value)}
                  aria-label={`${open.label} score`}
                />
              </label>
              <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Last reviewed
                <input
                  className="admin-input"
                  type="date"
                  defaultValue={openRow.last_reviewed || ''}
                  key={`${open.key}-reviewed-${openRow.last_reviewed}`}
                  disabled={busy}
                  onChange={(e) => commitRow(open.key, { last_reviewed: e.target.value || null })}
                  aria-label={`${open.label} last reviewed`}
                />
              </label>
              <label className="flex items-start gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={openRow.client_visible === true}
                  disabled={busy}
                  onChange={(e) => commitRow(open.key, { client_visible: e.target.checked })}
                />
                Client-facing (off by default)
              </label>
              {inMai(open.key) && (
                <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  MAI weight %
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    placeholder="Wt %"
                    defaultValue={weights[open.key] ?? ''}
                    key={`${open.key}-weight`}
                    disabled={busy}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitWeight(open.key, e.target.value); e.target.blur(); } }}
                    onBlur={(e) => commitWeight(open.key, e.target.value)}
                    aria-label={`${open.label} weight percent`}
                  />
                </label>
              )}
              {inMai(open.key) && (
                <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Client-facing label
                  <input
                    className="admin-input"
                    placeholder="Optional"
                    defaultValue={openRow.client_label || ''}
                    key={`${open.key}-label`}
                    disabled={busy}
                    onBlur={(e) => commitRow(open.key, { client_label: e.target.value || null })}
                    aria-label={`${open.label} client-facing label`}
                  />
                </label>
              )}
            </div>

            <div className="space-y-4">
              {[
                { field: 'measures', label: 'What this measures', rows: 2 },
                { field: 'evidence', label: 'Evidence used (one per line)', rows: 4 },
                { field: 'interpretation', label: 'Current interpretation', rows: 3 },
                { field: 'implication', label: 'Business implication', rows: 2 },
                { field: 'constraint', label: 'Primary constraint', rows: 2 },
                { field: 'priorities', label: 'Improvement priorities (one per line)', rows: 4 },
                { field: 'success_evidence', label: 'Success evidence (one per line)', rows: 4 },
                { field: 'internal_notes', label: 'Internal consultant notes', rows: 3 },
              ].map(({ field, label, rows }) => (
                <label key={field} className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                  <textarea
                    className="admin-input"
                    rows={rows}
                    placeholder={field === 'measures' ? open.purpose : ''}
                    defaultValue={Array.isArray(openRow[field]) ? openRow[field].join('\n') : openRow[field] || ''}
                    key={`${open.key}-${field}`}
                    disabled={busy}
                    onBlur={(e) => (Array.isArray(EMPTY_ROW[field]) ? commitLines(open.key, field, e.target.value) : commitText(open.key, field, e.target.value))}
                    aria-label={`${open.label} ${label}`}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Internal Market Alignment Index — never shown to the client */}
      <div className="rounded-sm border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {maiLabel || 'Market Alignment Index'}{' '}
              <span className="text-xs uppercase tracking-widest text-muted-foreground/70">Internal composite</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/80">
              Weighted from the four scored measures ({weightTotal}% total weight
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