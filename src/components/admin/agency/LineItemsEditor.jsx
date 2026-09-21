import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { centsFromInput, inputFromCents } from '@/lib/agency';

const ITEM_TYPES = [
  { value: 'required', label: 'Required scope' },
  { value: 'optional', label: 'Optional add-on' },
  { value: 'tier', label: 'Tier choice' },
  { value: 'quantity_based', label: 'Quantity-based' },
];

const TYPE_LABELS = {
  required: 'Required',
  optional: 'Add-on',
  tier: 'Tier',
  quantity_based: 'Quantity',
};

const BLANK = {
  title: '', description: '', item_type: 'required', tier_group: '',
  price: '0.00', quantity_label: '', quantity_min: 1, quantity_max: '', default_quantity: 1,
  pricing_visible: true,
};

/** Full line-item CRUD for the proposal builder. Edits persist immediately. */
export default function LineItemsEditor({ proposalId, items, onReload }) {
  const [draft, setDraft] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setDraft(BLANK); }, [proposalId]);

  const sorted = [...(items || [])].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const add = async () => {
    if (!draft.title.trim()) { setError('Give the item a title.'); return; }
    setBusy(true);
    setError('');
    try {
      await base44.entities.ProposalLineItem.create({
        proposal_id: proposalId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        item_type: draft.item_type,
        tier_group: draft.item_type === 'tier' ? draft.tier_group.trim() : '',
        unit_price_cents: centsFromInput(draft.price),
        quantity_label: draft.item_type === 'quantity_based' ? draft.quantity_label.trim() : '',
        quantity_min: draft.item_type === 'quantity_based' ? Math.max(0, Number(draft.quantity_min) || 0) : 1,
        quantity_max: draft.item_type === 'quantity_based' ? (Number(draft.quantity_max) || null) : null,
        default_quantity: draft.item_type === 'quantity_based' ? Math.max(0, Number(draft.default_quantity) || 0) : 1,
        pricing_visible: draft.pricing_visible,
        display_order: sorted.length + 1,
      });
      setDraft(BLANK);
      onReload();
    } catch (e) {
      setError(e.message || 'Could not add the item.');
    } finally {
      setBusy(false);
    }
  };

  const patch = async (item, changes) => {
    await base44.entities.ProposalLineItem.update(item.id, changes).catch(() => {});
    onReload();
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove "${item.title}" from the proposal?`)) return;
    await base44.entities.ProposalLineItem.delete(item.id);
    onReload();
  };

  const move = async (item, dir) => {
    const index = sorted.findIndex((i) => i.id === item.id);
    const neighbor = dir === 'up' ? index - 1 : index + 1;
    if (neighbor < 0 || neighbor >= sorted.length) return;
    const next = [...sorted];
    const [moved] = next.splice(index, 1);
    next.splice(neighbor, 0, moved);
    await base44.entities.ProposalLineItem.bulkUpdate(next.map((i, n) => ({ id: i.id, display_order: n + 1 })));
    onReload();
  };

  const input = (label, key, props = {}) => (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        className="admin-input py-1.5 text-sm"
        value={draft[key] ?? ''}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        {...props}
      />
    </label>
  );

  return (
    <div className="dashboard-card space-y-5 p-6">
      <div>
        <h3 className="font-heading text-2xl text-foreground">Scope & pricing</h3>
        <p className="text-xs text-muted-foreground/70">
          USD only. Required items are always included; clients choose tiers, add-ons, and quantities.
        </p>
      </div>

      <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {input('Title', 'title', { placeholder: 'Brand identity system' })}
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Item type</span>
            <select className="admin-input py-1.5 text-sm" value={draft.item_type} onChange={(e) => setDraft({ ...draft, item_type: e.target.value })}>
              {ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          {input('Price (USD)', 'price', { placeholder: '1500.00' })}
          {draft.item_type === 'tier' && input('Tier group', 'tier_group', { placeholder: 'Package level' })}
          {draft.item_type === 'quantity_based' && input('Quantity label', 'quantity_label', { placeholder: 'How many landing pages?' })}
          {draft.item_type === 'quantity_based' && (
            <div className="grid grid-cols-3 gap-2">
              {input('Min', 'quantity_min', { type: 'number' })}
              {input('Max', 'quantity_max', { type: 'number', placeholder: '—' })}
              {input('Default', 'default_quantity', { type: 'number' })}
            </div>
          )}
          <label className="flex items-end gap-2 pb-1.5 text-xs text-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={draft.pricing_visible} onChange={(e) => setDraft({ ...draft, pricing_visible: e.target.checked })} />
            Show price to client
          </label>
        </div>
        <div className="mt-3">
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Description</span>
            <textarea className="admin-input min-h-[64px] py-1.5 text-sm" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </label>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <button type="button" onClick={add} disabled={busy} className="btn-forge mt-3 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No line items yet — add the scope above.</p>
      ) : (
        <div className="divide-y divide-border/50">
          {sorted.map((item) => (
            <div key={item.id} className="py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {TYPE_LABELS[item.item_type] || item.item_type}
                </span>
                <input
                  className="admin-input min-w-40 flex-1 py-1.5 text-sm"
                  defaultValue={item.title}
                  onBlur={(e) => { if (e.target.value !== item.title) patch(item, { title: e.target.value }); }}
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">$</span>
                  <input
                    className="admin-input w-24 py-1.5 text-sm"
                    defaultValue={inputFromCents(item.unit_price_cents)}
                    onBlur={(e) => patch(item, { unit_price_cents: centsFromInput(e.target.value) })}
                  />
                </div>
                {item.item_type === 'tier' && (
                  <span className="rounded-sm border border-primary/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">{item.tier_group}</span>
                )}
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(item, 'up')} className="rounded-sm p-1.5 text-muted-foreground hover:text-foreground" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => move(item, 'down')} className="rounded-sm p-1.5 text-muted-foreground hover:text-foreground" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => remove(item)} className="rounded-sm p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete item"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}