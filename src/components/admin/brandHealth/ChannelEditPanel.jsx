import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  CHANNEL_CATEGORIES,
  CONSULTANT_PRIORITIES,
  JOURNEY_STAGES,
  MATURITY_LABELS,
  METRIC_FIELDS,
  QUADRANTS,
  STRATEGIC_ROLES,
  opportunityScore,
  quadrantOf,
} from '@/lib/matrix';

const ratingOptions = (min, max, labels) =>
  Array.from({ length: max - min + 1 }, (_, i) => {
    const v = min + i;
    return <option key={v} value={v}>{labels ? labels[v - min] : v}</option>;
  });

function RatingSelect({ label, value, min, max, labels, onChange, disabled }) {
  return (
    <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
      {label}
      <select className="admin-input" value={value ?? ''} disabled={disabled} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
        <option value="">—</option>
        {ratingOptions(min, max, labels)}
      </select>
    </label>
  );
}

/**
 * Consultant-only editor for one channel record: ratings, role, priority,
 * journey connection, metrics, evidence, notes, and what (if anything) the
 * client sees. Every change commits straight to the record.
 */
export default function ChannelEditPanel({ channel, audit, onChange, onDelete, busy }) {
  const [draft, setDraft] = useState(channel);
  const [draftMetrics, setDraftMetrics] = useState({});

  useEffect(() => {
    setDraft(channel);
    setDraftMetrics({});
  }, [channel?.id, channel?.updated_date]);

  if (!channel) return null;

  const commit = (patch) => onChange(channel.id, patch);
  const commitText = (key) => (e) => {
    const value = e.target.value;
    if ((value || null) === (channel[key] || null)) return;
    commit({ [key]: value || null });
  };
  const commitMetric = (key) => (e) => {
    const value = e.target.value;
    const metrics = { ...(channel.metrics || {}), [key]: value || undefined };
    if (value === '') delete metrics[key];
    commit({ metrics });
  };

  const opportunity = opportunityScore(channel, audit);
  const quadrant = QUADRANTS.find((q) => q.key === quadrantOf(channel));

  return (
    <div className="rounded-sm border border-border/60 bg-background/30 p-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-56 flex-1 space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Channel name
          <input
            className="admin-input"
            value={draft.channel_name || ''}
            disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, channel_name: e.target.value }))}
            onBlur={commitText('channel_name')}
          />
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Category
          <select className="admin-input" value={channel.category || ''} disabled={busy} onChange={(e) => commit({ category: e.target.value || null })}>
            <option value="">—</option>
            {CHANNEL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <span className="rounded-sm border border-primary/40 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary">
          Opportunity {opportunity}
        </span>
        <span className="rounded-sm border border-border px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          {quadrant?.label}
        </span>
        <button
          type="button"
          onClick={() => onDelete(channel.id)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

      <label className="mt-4 block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        Description
        <textarea
          className="admin-input"
          rows={2}
          value={draft.description || ''}
          disabled={busy}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          onBlur={commitText('description')}
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <RatingSelect label="Strategic fit (1–5)" value={channel.strategic_fit} min={1} max={5} disabled={busy} onChange={(v) => commit({ strategic_fit: v })} />
        <RatingSelect label="Current maturity (0–5)" value={channel.maturity} min={0} max={5} labels={MATURITY_LABELS} disabled={busy} onChange={(v) => commit({ maturity: v })} />
        <RatingSelect label="Buyer impact (1–5)" value={channel.buyer_impact} min={1} max={5} disabled={busy} onChange={(v) => commit({ buyer_impact: v })} />
        <RatingSelect label="Time to impact (1–5)" value={channel.time_to_impact} min={1} max={5} disabled={busy} onChange={(v) => commit({ time_to_impact: v })} />
        <RatingSelect label="Investment required (1–5)" value={channel.investment_required} min={1} max={5} disabled={busy} onChange={(v) => commit({ investment_required: v })} />
        <RatingSelect label="Execution confidence (1–5)" value={channel.execution_confidence} min={1} max={5} disabled={busy} onChange={(v) => commit({ execution_confidence: v })} />
        <RatingSelect label="Measurement readiness (0–5)" value={channel.measurement_readiness} min={0} max={5} disabled={busy} onChange={(v) => commit({ measurement_readiness: v })} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Strategic role
          <select className="admin-input" value={channel.strategic_role || ''} disabled={busy} onChange={(e) => commit({ strategic_role: e.target.value || null })}>
            <option value="">—</option>
            {STRATEGIC_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Consultant priority
          <select className="admin-input" value={channel.consultant_priority || ''} disabled={busy} onChange={(e) => commit({ consultant_priority: e.target.value || null })}>
            <option value="">—</option>
            {CONSULTANT_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Journey stage connection
          <select className="admin-input" value={channel.journey_stage || ''} disabled={busy} onChange={(e) => commit({ journey_stage: e.target.value || null })}>
            <option value="">—</option>
            {JOURNEY_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <details className="mt-4 rounded-sm border border-border/50 px-4 py-3">
        <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-muted-foreground">Performance metrics (where available)</summary>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {METRIC_FIELDS.map((m) => (
            <label key={m.key} className="space-y-1 text-[9px] uppercase tracking-wider text-muted-foreground">
              {m.label}
              <input
                className="admin-input !py-1.5 text-xs"
                value={draftMetrics[m.key] ?? ((channel.metrics || {})[m.key] ?? '')}
                disabled={busy}
                onChange={(e) => setDraftMetrics((d) => ({ ...d, [m.key]: e.target.value }))}
                onBlur={commitMetric(m.key)}
              />
            </label>
          ))}
        </div>
      </details>

      <details className="mt-3 rounded-sm border border-border/50 px-4 py-3">
        <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-muted-foreground">Evidence — screenshots, links, files</summary>
        <div className="mt-3 space-y-2">
          {(channel.evidence || []).map((ev, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="admin-input"
                placeholder="Title"
                value={ev.title || ''}
                disabled={busy}
                onChange={(e) => commit({ evidence: (channel.evidence || []).map((r, j) => (j === i ? { ...r, title: e.target.value } : r)) })}
              />
              <input
                className="admin-input"
                placeholder="URL"
                value={ev.url || ''}
                disabled={busy}
                onChange={(e) => commit({ evidence: (channel.evidence || []).map((r, j) => (j === i ? { ...r, url: e.target.value } : r)) })}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => commit({ evidence: (channel.evidence || []).filter((_, j) => j !== i) })}
                className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Remove evidence"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => commit({ evidence: [...(channel.evidence || []), { title: '', url: '' }] })}
            className="rounded-md border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Add evidence
          </button>
        </div>
      </details>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Internal consultant notes
          <textarea
            className="admin-input"
            rows={3}
            value={draft.internal_notes || ''}
            disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, internal_notes: e.target.value }))}
            onBlur={commitText('internal_notes')}
          />
        </label>
        <div>
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <input type="checkbox" checked={channel.client_visible === true} disabled={busy} onChange={(e) => commit({ client_visible: e.target.checked })} />
            Client-facing — show this channel in the published map
          </label>
          <label className="mt-2 block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Client-facing notes (approved copy only)
            <textarea
              className="admin-input"
              rows={3}
              value={draft.client_notes || ''}
              disabled={busy}
              onChange={(e) => setDraft((d) => ({ ...d, client_notes: e.target.value }))}
              onBlur={commitText('client_notes')}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Related action-plan item
          <input className="admin-input" value={draft.related_action_item || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, related_action_item: e.target.value }))} onBlur={commitText('related_action_item')} />
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Related implementation package / service
          <input className="admin-input" value={draft.related_service || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, related_service: e.target.value }))} onBlur={commitText('related_service')} />
        </label>
      </div>
    </div>
  );
}