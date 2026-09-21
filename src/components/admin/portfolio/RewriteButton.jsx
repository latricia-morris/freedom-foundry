import React, { useState } from 'react';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STRENGTHS = [
  { value: 'light', label: 'Light polish' },
  { value: 'moderate', label: 'Moderate rewrite' },
  { value: 'strong', label: 'Strong rewrite' },
];

/** Per-field rewrite with a selectable strength, grounded in project facts. */
export default function RewriteButton({ field, form, onChange }) {
  const [strength, setStrength] = useState('light');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    const text = (form[field] || '').trim();
    if (!text) return;
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('portfolio-draft', {
        action: 'rewrite',
        payload: {
          text,
          strength,
          context: [form.title, form.client_name, form.industry, (form.work_types || []).join(', ')]
            .filter(Boolean)
            .join('. '),
        },
      });
      const rewritten = (response?.data?.text || '').trim();
      if (rewritten && rewritten !== text) {
        onChange({ [field]: rewritten });
      } else {
        setError('No rewrite was returned.');
      }
    } catch (e) {
      setError(e.message || 'The rewrite failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={strength}
        onChange={(e) => setStrength(e.target.value)}
        aria-label="Rewrite strength"
        className="admin-input w-auto py-1 text-[11px]"
      >
        {STRENGTHS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
      <button
        type="button"
        onClick={run}
        disabled={busy || !(form[field] || '').trim()}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-40"
      >
        {busy ? <LoaderCircle className="h-3 w-3 animate-spin text-primary" /> : <Sparkles className="h-3 w-3 text-primary" />}
        Rewrite
      </button>
      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </div>
  );
}