import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const INPUT_CLASS =
  'w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none';

/**
 * Baseline-gap quiz: only the baseline items that are still unanswered, one
 * question at a time, mobile-first. Answers are merged into the audit's intake
 * data — this never re-opens or replaces the full intake, and it never touches
 * consultant findings, scores, or results.
 */
export default function BaselineQuiz({ audit, fields, onSubmitted, onCancel }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const field = fields[step];
  if (!field) return null;
  const isLast = step === fields.length - 1;
  const value = values[field.key] || '';

  const set = (v) => setValues((prev) => ({ ...prev, [field.key]: v }));

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await base44.functions.invoke('submit-brand-health-intake', {
        audit_id: audit.id,
        mode: 'baseline',
        intake_data: values,
      });
      onSubmitted();
    } catch (err) {
      setError(err.message || 'Your answers could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (!value.trim()) {
      setError('Please answer this question to continue.');
      return;
    }
    setError('');
    if (isLast) submit();
    else setStep((s) => s + 1);
  };

  return (
    <div className="dashboard-card mx-auto w-full max-w-xl p-6">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        Question {step + 1} of {fields.length}
      </p>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border/60">
        <div className="molten-bar h-full rounded-full transition-all" style={{ width: `${((step + 1) / fields.length) * 100}%` }} />
      </div>

      <label className="mt-6 block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {field.label}
        </span>
        <span className="mb-3 block font-heading text-xl leading-snug text-foreground">{field.question}</span>
        {field.options ? (
          <select className={INPUT_CLASS} value={value} onChange={(e) => set(e.target.value)}>
            <option value="">Select…</option>
            {field.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : field.long ? (
          <textarea rows={4} className={INPUT_CLASS} value={value} onChange={(e) => set(e.target.value)} />
        ) : (
          <input className={INPUT_CLASS} value={value} onChange={(e) => set(e.target.value)} />
        )}
      </label>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
        {step > 0 && (
          <button type="button" onClick={() => { setError(''); setStep((s) => s - 1); }} disabled={busy} className="link-warm">
            Back
          </button>
        )}
        <button
          type="button"
          onClick={next}
          disabled={busy}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-60"
        >
          {busy ? 'Saving…' : isLast ? 'Finish' : 'Continue'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}