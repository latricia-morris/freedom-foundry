import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  DIRECTIONS,
  DIRECTION_LABELS,
  EFFORT_LEVELS,
  EFFORT_LABELS,
  EVIDENCE_LABELS,
  GOAL_TYPE_LABELS,
  RECOMMENDATION_BASIS_LABELS,
  TARGET_STATUS_LABELS,
} from '@/lib/matrix';

const EVIDENCE_OPTIONS = ['recorded', 'client_reported', 'estimated', 'not_tracked'];
const RESULT_EVIDENCE_OPTIONS = ['recorded', 'client_reported', 'estimated'];
const ATTRIBUTION_OPTIONS = ['originated', 'influenced', 'uncertain'];
const TARGET_STATUSES = ['admin_approved', 'client_agreed', 'historical_baseline', 'proposed'];
const OBJECTIVES = [
  { value: 'qualified_demand', label: 'Qualified demand' },
  { value: 'relationships', label: 'Relationships or partnerships' },
  { value: 'authority', label: 'Authority' },
  { value: 'revenue', label: 'Speaking revenue' },
  { value: 'other', label: 'Another objective (label it below)' },
];

const L = 'block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground';

/**
 * Consultant editor for the client-facing effort report fields on one
 * channel: effort categories and direction, results with evidence labels,
 * the goal and tracking plan, and the recommendation basis. Nothing here is
 * generated; every value is consultant-entered.
 */
export default function ChannelEffortEditor({ channel, onChange, busy }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    setDraft({
      effort: channel.effort || {},
      goal: channel.goal || {},
      results: (channel.results || []).map((r) => ({ ...r })),
      recommendation_basis: channel.recommendation_basis || '',
      measurement_objective: channel.measurement_objective || '',
      measurement_objective_label: channel.measurement_objective_label || '',
      qualified_conversation_definition: channel.qualified_conversation_definition || '',
      next_action: channel.next_action || '',
    });
  }, [channel?.id, channel?.updated_date]);

  if (!draft) return null;

  const setEffort = (patch) => setDraft((d) => ({ ...d, effort: { ...d.effort, ...patch } }));
  const setGoal = (patch) => setDraft((d) => ({ ...d, goal: { ...d.goal, ...patch } }));
  const setResult = (i, patch) =>
    setDraft((d) => ({ ...d, results: d.results.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const addResult = () =>
    setDraft((d) => ({ ...d, results: [...d.results, { label: '', value: '', unit: '', period: '', evidence: '', attribution: '' }] }));
  const removeResult = (i) => setDraft((d) => ({ ...d, results: d.results.filter((_, j) => j !== i) }));

  const save = () => {
    const cleanResults = draft.results.filter((r) => String(r.label || '').trim() && String(r.value ?? '').trim() !== '');
    const goal = { ...draft.goal };
    if (!String(goal.text || '').trim() && !String(goal.tracking_method || '').trim()) {
      goal.text = null;
    }
    onChange(channel.id, {
      effort: draft.effort,
      goal,
      results: cleanResults,
      recommendation_basis: draft.recommendation_basis || null,
      measurement_objective: draft.measurement_objective || null,
      measurement_objective_label: draft.measurement_objective_label || null,
      qualified_conversation_definition: draft.qualified_conversation_definition || null,
      next_action: draft.next_action || null,
    });
  };

  return (
    <details className="mt-4 rounded-sm border border-primary/25 bg-primary/5 px-4 py-3">
      <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-primary">
        Client report fields: effort, results, goal, and next action
      </summary>

      <div className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className={L}>
            Current effort
            <select className="admin-input" value={draft.effort.current || ''} disabled={busy}
              onChange={(e) => setEffort({ current: e.target.value || null })}>
              <option value="">Not set</option>
              {[...EFFORT_LEVELS, 'unknown'].map((k) => <option key={k} value={k}>{EFFORT_LABELS[k]}</option>)}
            </select>
          </label>
          <label className={L}>
            Recommended effort
            <select className="admin-input" value={draft.effort.recommended || ''} disabled={busy}
              onChange={(e) => setEffort({ recommended: e.target.value || null })}>
              <option value="">Not set</option>
              {EFFORT_LEVELS.map((k) => <option key={k} value={k}>{EFFORT_LABELS[k]}</option>)}
            </select>
          </label>
          <label className={L}>
            Direction (review manually)
            <select className="admin-input" value={draft.effort.direction || ''} disabled={busy}
              onChange={(e) => setEffort({ direction: e.target.value || null })}>
              <option value="">Not set</option>
              {DIRECTIONS.map((k) => <option key={k} value={k}>{DIRECTION_LABELS[k]}</option>)}
            </select>
          </label>
          <label className={L}>
            Effort evidence
            <select className="admin-input" value={draft.effort.evidence || ''} disabled={busy}
              onChange={(e) => setEffort({ evidence: e.target.value || null })}>
              <option value="">Not set</option>
              {EVIDENCE_OPTIONS.map((k) => <option key={k} value={k}>{EVIDENCE_LABELS[k]}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <label className={L}>
            Rationale (client-facing: why this channel)
            <textarea className="admin-input" rows={3} value={draft.effort.rationale || ''} disabled={busy}
              onChange={(e) => setEffort({ rationale: e.target.value })} />
          </label>
          <label className={L}>
            Recommended commitment (the practical change)
            <textarea className="admin-input" rows={3} value={draft.effort.commitment || ''} disabled={busy}
              onChange={(e) => setEffort({ commitment: e.target.value })} />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className={L}>
            Capacity dependency
            <input className="admin-input" value={draft.effort.capacity_note || ''} disabled={busy}
              onChange={(e) => setEffort({ capacity_note: e.target.value })} />
          </label>
          <label className={L}>
            Monthly hours (supporting fact, when known)
            <input className="admin-input" placeholder="e.g. approximately 6 hours/month" value={draft.effort.monthly_hours || ''} disabled={busy}
              onChange={(e) => setEffort({ monthly_hours: e.target.value })} />
          </label>
          <label className={L}>
            Monthly spend (supporting fact, when known)
            <input className="admin-input" placeholder="e.g. approximately $300/month" value={draft.effort.monthly_spend || ''} disabled={busy}
              onChange={(e) => setEffort({ monthly_spend: e.target.value })} />
          </label>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            Results (numerical results need a value, period, and evidence source)
          </p>
          <div className="space-y-2">
            {draft.results.map((r, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-6">
                <input className="admin-input" placeholder="Label" value={r.label || ''} disabled={busy} onChange={(e) => setResult(i, { label: e.target.value })} />
                <input className="admin-input" placeholder="Value" value={r.value || ''} disabled={busy} onChange={(e) => setResult(i, { value: e.target.value })} />
                <input className="admin-input" placeholder="Unit" value={r.unit || ''} disabled={busy} onChange={(e) => setResult(i, { unit: e.target.value })} />
                <input className="admin-input" placeholder="Period" value={r.period || ''} disabled={busy} onChange={(e) => setResult(i, { period: e.target.value })} />
                <select className="admin-input" value={r.evidence || ''} disabled={busy} onChange={(e) => setResult(i, { evidence: e.target.value })}>
                  <option value="">Source</option>
                  {RESULT_EVIDENCE_OPTIONS.map((k) => <option key={k} value={k}>{EVIDENCE_LABELS[k]}</option>)}
                </select>
                <select className="admin-input" value={r.attribution || ''} disabled={busy} onChange={(e) => setResult(i, { attribution: e.target.value })}>
                  <option value="">Attribution</option>
                  {ATTRIBUTION_OPTIONS.map((k) => <option key={k} value={k}>{k === 'originated' ? 'Originated' : k === 'influenced' ? 'Influenced' : 'Uncertain'}</option>)}
                </select>
                <button type="button" onClick={() => removeResult(i)} aria-label="Remove result"
                  className="justify-self-start rounded-sm px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-destructive">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addResult} disabled={busy}
              className="rounded-md border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              Add result
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className={L}>
            Recommendation basis
            <select className="admin-input" value={draft.recommendation_basis || ''} disabled={busy}
              onChange={(e) => setDraft((d) => ({ ...d, recommendation_basis: e.target.value }))}>
              <option value="">Not set</option>
              {Object.entries(RECOMMENDATION_BASIS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className={L}>
            Measurement objective
            <select className="admin-input" value={draft.measurement_objective || ''} disabled={busy}
              onChange={(e) => setDraft((d) => ({ ...d, measurement_objective: e.target.value }))}>
              <option value="">Not set</option>
              {OBJECTIVES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          {draft.measurement_objective === 'other' ? (
            <label className={L}>
              Objective label
              <input className="admin-input" value={draft.measurement_objective_label || ''} disabled={busy}
                onChange={(e) => setDraft((d) => ({ ...d, measurement_objective_label: e.target.value }))} />
            </label>
          ) : null}
        </div>

        <label className={L}>
          Qualified conversation, as used in this report (when the term is used)
          <input className="admin-input" value={draft.qualified_conversation_definition || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, qualified_conversation_definition: e.target.value }))} />
        </label>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className={L}>
            Goal type
            <select className="admin-input" value={draft.goal.type || ''} disabled={busy} onChange={(e) => setGoal({ type: e.target.value || null })}>
              <option value="">Not set</option>
              {Object.entries(GOAL_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className={L}>
            Target status
            <select className="admin-input" value={draft.goal.target_status || ''} disabled={busy} onChange={(e) => setGoal({ target_status: e.target.value || null })}>
              <option value="">Not set</option>
              {TARGET_STATUSES.map((k) => <option key={k} value={k}>{TARGET_STATUS_LABELS[k]}</option>)}
            </select>
          </label>
          <label className={L}>
            Timeframe (required for numerical targets)
            <input className="admin-input" value={draft.goal.timeframe || ''} disabled={busy} onChange={(e) => setGoal({ timeframe: e.target.value })} />
          </label>
          <label className={L}>
            Next review date
            <input className="admin-input" type="date" value={draft.goal.next_review_date || ''} disabled={busy} onChange={(e) => setGoal({ next_review_date: e.target.value || null })} />
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <label className={L}>
            Goal (execution or outcome, in one line)
            <input className="admin-input" value={draft.goal.text || ''} disabled={busy} onChange={(e) => setGoal({ text: e.target.value })} />
          </label>
          <label className={L}>
            Baseline (or the baseline-building goal)
            <input className="admin-input" value={draft.goal.baseline || ''} disabled={busy} onChange={(e) => setGoal({ baseline: e.target.value })} />
          </label>
          <label className={L}>
            Target (only when one is agreed or approved)
            <input className="admin-input" value={draft.goal.target || ''} disabled={busy} onChange={(e) => setGoal({ target: e.target.value })} />
          </label>
          <label className={L}>
            Tracking method
            <input className="admin-input" value={draft.goal.tracking_method || ''} disabled={busy} onChange={(e) => setGoal({ tracking_method: e.target.value })} />
          </label>
        </div>

        <label className={L}>
          Next action (one concrete step)
          <textarea className="admin-input" rows={2} value={draft.next_action || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, next_action: e.target.value }))} />
        </label>

        <button type="button" onClick={save} disabled={busy}
          className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
          <Save className="h-3.5 w-3.5" /> Save client report fields
        </button>
      </div>
    </details>
  );
}