import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { BASELINE_FIELDS, matrixFlags } from '@/lib/matrix';

const INPUT_CLASS = 'admin-input';
const MATRIX_KEYS = ['channel_fit', 'journey_coverage', 'channel_integration', 'execution_readiness', 'customer_growth_readiness'];

/**
 * Consultant-side Marketing Matrix readiness. Loads or edits interview
 * findings, records the baseline details, and recalculates the Matrix state.
 * Every action writes the computed readiness flags so the client lands on the
 * right screen — results as soon as findings plus baseline allow, never behind
 * a false intake gate. Internal only: this never renders in client UI.
 */
export default function MatrixReadinessPanel({ audit, onSave, busy }) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(audit.consultant_findings_summary || '');
  const [baseline, setBaseline] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    setSummary(audit.consultant_findings_summary || '');
    setBaseline(Object.fromEntries(BASELINE_FIELDS.map((f) => [f.key, audit[f.key] || ''])));
  }, [audit?.id, audit?.updated_date]);

  const candidate = (extra = {}) => ({
    ...audit,
    ...baseline,
    consultant_findings_summary: summary || null,
    ...extra,
  });

  const flagsFor = (record) => {
    const f = matrixFlags(record);
    return {
      data_source: f.data_source,
      findings_loaded: f.findings_loaded,
      client_intake_complete: f.client_intake_complete,
      minimum_baseline_met: f.minimum_baseline_met,
      missing_baseline_fields: f.missing_baseline_fields,
      matrix_state: f.matrix_state,
      matrix_ready: f.matrix_ready,
      client_can_edit: false,
    };
  };

  const stamp = async () => {
    let email = audit.last_updated_by || null;
    try {
      const me = await base44.auth.me();
      email = me?.email || email;
    } catch {
      /* keep the previous stamp */
    }
    return { last_updated_by: email, last_updated_at: new Date().toISOString() };
  };

  const saveFindings = async ({ markBaseline = false } = {}) => {
    const record = candidate({ findings_loaded: true });
    const flags = flagsFor(record);
    const patch = {
      ...Object.fromEntries(BASELINE_FIELDS.map((f) => [f.key, baseline[f.key] || null])),
      consultant_findings_summary: summary || null,
      consultant_findings_payload: {
        summary: summary || '',
        baseline: Object.fromEntries(BASELINE_FIELDS.map((f) => [f.key, baseline[f.key] || ''])),
        loaded_at: new Date().toISOString(),
      },
      findings_loaded: true,
      ...flags,
      ...(await stamp()),
    };
    await onSave(patch);
    setEditing(false);
    const missing = flags.missing_baseline_fields.length;
    if (flags.minimum_baseline_met) {
      toast({ title: markBaseline ? 'Baseline complete' : 'Interview findings loaded', description: 'Matrix ready.' });
    } else {
      toast({
        title: 'Interview findings loaded',
        description: `${missing} baseline item${missing === 1 ? '' : 's'} still needed to finalize scoring.`,
      });
    }
  };

  const recalculate = async () => {
    const record = candidate({ findings_loaded: audit.findings_loaded === true || !!audit.consultant_findings_summary });
    const flags = flagsFor(record);
    const now = new Date().toISOString();
    await onSave({
      ...flags,
      results_generated_at: flags.matrix_ready ? now : audit.results_generated_at || null,
      matrix_results_payload: {
        scores: audit.matrix_scores || {},
        weights: audit.matrix_weights || {},
        journey: audit.journey_coverage || [],
        generated_at: now,
      },
      ...(await stamp()),
    });
    toast({ title: 'Matrix recalculated', description: flags.matrix_ready ? 'Results available.' : 'Baseline items still missing.' });
  };

  const publishResults = async () => {
    const record = candidate({ findings_loaded: audit.findings_loaded === true || !!audit.consultant_findings_summary });
    const flags = flagsFor(record);
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    await onSave({
      ...flags,
      status: 'published_to_client',
      published_at: audit.published_at || today,
      reviewed_date: audit.reviewed_date || today,
      results_generated_at: now,
      ...(await stamp()),
    });
    toast({ title: 'Results published to client' });
  };

  const preview = matrixFlags(candidate());
  const loaded = audit.findings_loaded === true || !!audit.consultant_findings_summary;
  const statusLine = loaded
    ? preview.minimum_baseline_met
      ? 'Interview findings loaded. Matrix ready.'
      : 'Interview findings loaded. Add remaining baseline items to finalize scoring.'
    : 'No interview findings loaded yet. Load findings to score the Matrix.';

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-primary/25 bg-primary/5 p-4">
        <p className="text-sm text-foreground">{statusLine}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          State: <span className="uppercase tracking-widest text-foreground">{preview.matrix_state.replace(/_/g, ' ')}</span>
          {' · '}Source: {preview.data_source.replace(/_/g, ' ')}
          {' · '}Client intake {preview.client_intake_complete ? 'complete' : 'not complete'}
          {' · '}Client editing: {preview.client_can_edit ? 'allowed' : 'locked'}
        </p>
        {!preview.minimum_baseline_met && (
          <p className="mt-2 text-xs text-muted-foreground">
            Missing baseline:{' '}
            <span className="text-foreground">
              {BASELINE_FIELDS.filter((f) => preview.missing_baseline_fields.includes(f.key)).map((f) => f.label).join(', ')}
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          disabled={busy}
          className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50 ${editing ? 'border border-border text-muted-foreground hover:text-foreground' : 'btn-forge border-transparent'}`}
        >
          {loaded ? (editing ? 'Close findings' : 'Edit findings') : 'Load interview findings'}
        </button>
        <button
          type="button"
          onClick={() => saveFindings({ markBaseline: true })}
          disabled={busy}
          className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          Mark baseline complete
        </button>
        <button
          type="button"
          onClick={recalculate}
          disabled={busy}
          className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          Recalculate Matrix
        </button>
        <button
          type="button"
          onClick={publishResults}
          disabled={busy}
          className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          Publish results
        </button>
      </div>

      {editing && (
        <div className="space-y-4 border-t border-border/40 pt-4">
          <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Interview findings summary (internal)
            <textarea
              className={INPUT_CLASS}
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What the interview established about the business, buyer, and channel reality"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {BASELINE_FIELDS.map((f) => (
              <label key={f.key} className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                {f.label}
                <textarea
                  className={INPUT_CLASS}
                  rows={f.long ? 3 : 2}
                  value={baseline[f.key] || ''}
                  onChange={(e) => setBaseline((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.question}
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Loading findings makes the Matrix results available as soon as the baseline minimum is met, and can
            combine with a client intake. {MATRIX_KEYS.length} measures are scored in the panel below.
          </p>
        </div>
      )}
    </div>
  );
}