import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { JOURNEY_STAGES, LEVERAGE_CATEGORIES, LEVERAGE_PRIORITIES } from '@/lib/matrix';

const scaleOptions = [1, 2, 3, 4, 5];

/**
 * Internal consultant-only strategy workspace for leverage opportunities —
 * the ideas beyond generic channel recommendations. Nothing is auto-published:
 * the consultant writes the client_summary and switches client_visible on only
 * for the opportunities they approve.
 */
export default function LeveragePanel({ audit, busy }) {
  const [items, setItems] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('demand_capture');
  const writesRef = useRef(Promise.resolve());
  const { toast } = useToast();

  const load = () => {
    base44.entities.LeverageOpportunity.filter({ audit_id: audit.id }, '-created_date', 200)
      .then((rows) => setItems(rows || []))
      .catch(() => setItems([]));
  };
  useEffect(load, [audit.id]);

  // Writes serialize so rapid successive edits can never race each other.
  const commit = (id, patch) => {
    setItems((prev) => (prev || []).map((o) => (o.id === id ? { ...o, ...patch } : o)));
    writesRef.current = writesRef.current.then(async () => {
      try {
        await base44.entities.LeverageOpportunity.update(id, patch);
      } catch (err) {
        toast({ title: 'Could not save opportunity', description: err.message, variant: 'destructive' });
        load();
      }
    });
  };

  const add = async () => {
    if (!title.trim()) {
      toast({ title: 'Give the opportunity a title first', variant: 'destructive' });
      return;
    }
    try {
      const created = await base44.entities.LeverageOpportunity.create({
        audit_id: audit.id,
        agency_client_id: audit.agency_client_id,
        title: title.trim(),
        category,
        priority: 'explore',
      });
      setTitle('');
      setItems((prev) => [created, ...(prev || [])]);
    } catch (err) {
      toast({ title: 'Could not add opportunity', description: err.message, variant: 'destructive' });
    }
  };

  const remove = async (id) => {
    try {
      await base44.entities.LeverageOpportunity.delete(id);
      load();
    } catch (err) {
      toast({ title: 'Could not delete opportunity', description: err.message, variant: 'destructive' });
    }
  };

  const commitText = (item, key) => (e) => {
    const value = e.target.value;
    if ((value || null) === (item[key] || null)) return;
    commit(item.id, { [key]: value || null });
  };

  if (!items) {
    return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-56 flex-1 space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Opportunity title
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Turn completed projects into local proof" />
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Category
          <select className="admin-input max-w-48" value={category} onChange={(e) => setCategory(e.target.value)}>
            {LEVERAGE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
        <button type="button" onClick={add} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-widest">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {!items.length && (
        <p className="text-sm text-muted-foreground/70">No leverage opportunities captured yet for this audit.</p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.id} className="rounded-sm border border-border/60 bg-background/30 px-4 py-3" open={items.length === 1}>
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm text-foreground">
              <span className="font-medium">{item.title}</span>
              <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {(LEVERAGE_CATEGORIES.find((c) => c.key === item.category) || {}).label || item.category}
              </span>
              <span className="rounded-sm border border-primary/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                {(LEVERAGE_PRIORITIES.find((p) => p.key === item.priority) || {}).label || item.priority}
              </span>
              {item.client_visible && (
                <span className="rounded-sm border border-emerald-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400">Client-facing</span>
              )}
            </summary>

            <div className="mt-3 space-y-3">
              <OpportunityFields item={item} commit={commit} busy={busy} commitText={commitText} />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <input type="checkbox" checked={item.client_visible === true} disabled={busy} onChange={(e) => commit(item.id, { client_visible: e.target.checked })} />
                  Publish opportunity to client
                </label>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function OpportunityFields({ item, commit, busy, commitText }) {
  const [draft, setDraft] = useState(item);
  useEffect(() => setDraft(item), [item?.id, item?.updated_date]);

  const toggleStage = (stage) => {
    const stages = item.related_journey_stages || [];
    const next = stages.includes(stage) ? stages.filter((s) => s !== stage) : [...stages, stage];
    commit(item.id, { related_journey_stages: next });
  };

  return (
    <div className="space-y-3">
      <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        Description
        <textarea className="admin-input" rows={2} value={draft.description || ''} disabled={busy}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} onBlur={commitText(item, 'description')} />
      </label>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Estimated impact (1–5)
          <select className="admin-input" value={item.estimated_impact ?? ''} disabled={busy} onChange={(e) => commit(item.id, { estimated_impact: e.target.value === '' ? null : Number(e.target.value) })}>
            <option value="">—</option>
            {scaleOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Effort / complexity (1–5)
          <select className="admin-input" value={item.effort ?? ''} disabled={busy} onChange={(e) => commit(item.id, { effort: e.target.value === '' ? null : Number(e.target.value) })}>
            <option value="">—</option>
            {scaleOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Time to impact (1–5)
          <select className="admin-input" value={item.time_to_impact ?? ''} disabled={busy} onChange={(e) => commit(item.id, { time_to_impact: e.target.value === '' ? null : Number(e.target.value) })}>
            <option value="">—</option>
            {scaleOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Priority
          <select className="admin-input" value={item.priority || 'explore'} disabled={busy} onChange={(e) => commit(item.id, { priority: e.target.value })}>
            {LEVERAGE_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Related action-plan item
          <input className="admin-input" value={draft.related_action_item || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, related_action_item: e.target.value }))} onBlur={commitText(item, 'related_action_item')} />
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Related implementation service
          <input className="admin-input" value={draft.related_service || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, related_service: e.target.value }))} onBlur={commitText(item, 'related_service')} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Required resources
          <textarea className="admin-input" rows={2} value={draft.required_resources || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, required_resources: e.target.value }))} onBlur={commitText(item, 'required_resources')} />
        </label>
        <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Prerequisites
          <textarea className="admin-input" rows={2} value={draft.prerequisites || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, prerequisites: e.target.value }))} onBlur={commitText(item, 'prerequisites')} />
        </label>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Related journey stages</p>
        <div className="flex flex-wrap gap-2">
          {JOURNEY_STAGES.map((s) => (
            <button
              key={s.key}
              type="button"
              disabled={busy}
              onClick={() => toggleStage(s.key)}
              className={`rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                (item.related_journey_stages || []).includes(s.key)
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Internal notes
          <textarea className="admin-input" rows={2} value={draft.internal_notes || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, internal_notes: e.target.value }))} onBlur={commitText(item, 'internal_notes')} />
        </label>
        <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Client-facing recommendation (shown when published)
          <textarea className="admin-input" rows={2} value={draft.client_summary || ''} disabled={busy}
            onChange={(e) => setDraft((d) => ({ ...d, client_summary: e.target.value }))} onBlur={commitText(item, 'client_summary')} />
        </label>
      </div>
    </div>
  );
}