import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { INTAKE_FIELDS, LONG_INTAKE_FIELDS } from '@/lib/brandHealthIntake';

const INPUT_CLASS =
  'w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none';

function IntakeField({ field, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {field.label}
      </span>
      {field.options ? (
        <select className={INPUT_CLASS} value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : LONG_INTAKE_FIELDS.has(field.key) ? (
        <textarea rows={3} className={INPUT_CLASS} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={INPUT_CLASS} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/**
 * Locked client intake: the client completes this once per audit. After
 * submission the form never re-opens — the consultant owns everything from
 * the review onward.
 */
export default function IntakeForm({ audit, onSubmitted, onCancel }) {
  const definition = INTAKE_FIELDS[audit.component];
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!definition) return null;

  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));
  const missing = definition.required.filter((f) => !(values[f.key] || '').trim());

  const submit = async (e) => {
    e.preventDefault();
    if (missing.length) {
      setError('Please complete all required fields before submitting.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await base44.functions.invoke('submit-brand-health-intake', {
        audit_id: audit.id,
        intake_data: values,
      });
      onSubmitted();
    } catch (err) {
      setError(err.message || 'Your intake could not be submitted. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="dashboard-card mx-auto w-full max-w-2xl p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{definition.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This one-time intake tells your consultant exactly what to examine. Once submitted, it cannot be
        edited — your consultant will follow up if anything else is needed.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {definition.required.map((field) => (
          <IntakeField key={field.key} field={field} value={values[field.key]} onChange={(v) => set(field.key, v)} />
        ))}
      </div>

      {definition.baseline && definition.baseline.length > 0 && (
        <>
          <p className="mb-3 mt-8 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Baseline details — the Matrix needs these
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {definition.baseline.map((field) => (
              <IntakeField key={field.key} field={field} value={values[field.key]} onChange={(v) => set(field.key, v)} />
            ))}
          </div>
        </>
      )}

      <p className="mb-3 mt-8 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        Optional — helpful if available
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {definition.optional.map((field) => (
          <IntakeField key={field.key} field={field} value={values[field.key]} onChange={(v) => set(field.key, v)} />
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
        <button
          type="submit"
          disabled={busy}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-60"
        >
          {busy ? 'Submitting…' : 'Submit intake'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="link-warm">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}