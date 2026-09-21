import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatUsd, tierGroupErrors } from '@/lib/agency';

function PriceCell({ item }) {
  if (!item.pricing_visible) {
    return <span className="text-xs uppercase tracking-widest text-muted-foreground/70">Included</span>;
  }
  return (
    <span className="font-heading text-lg text-foreground">
      {formatUsd(item.unit_price_cents)}
    </span>
  );
}

/** Client-facing proposal selection step: choose tiers, add-ons, quantities. */
export default function ProposalSelections({ proposal, items, selections, onChange, totals, onContinue }) {
  const required = items.filter((i) => i.item_type === 'required');
  const optional = items.filter((i) => i.item_type === 'optional');
  const quantityItems = items.filter((i) => i.item_type === 'quantity_based');
  const tierGroups = new Map();
  items.filter((i) => i.item_type === 'tier' && i.tier_group).forEach((i) => {
    if (!tierGroups.has(i.tier_group)) tierGroups.set(i.tier_group, []);
    tierGroups.get(i.tier_group).push(i);
  });

  const errors = tierGroupErrors(items, selections);
  const setQuantity = (id, value) => onChange({ ...selections, [id]: { ...selections[id], quantity: value } });
  const toggle = (id, selected) => onChange({ ...selections, [id]: { ...selections[id], selected } });
  const chooseTier = (id) => {
    const next = { ...selections };
    items.filter((i) => i.item_type === 'tier' && i.tier_group).forEach((i) => {
      next[i.id] = { ...(next[i.id] || {}), selected: i.id === id };
    });
    onChange(next);
  };

  const row = (item, control) => (
    <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-card/40 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {item.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>}
      </div>
      {control}
      <div className="w-20 text-right">
        <PriceCell item={item} />
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {required.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.24em] text-warm">Included in your project</h2>
          <div className="mt-4 space-y-3">
            {required.map((item) => row(item, <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Core scope</span>))}
          </div>
        </section>
      )}

      {[...tierGroups.entries()].map(([group, groupItems]) => (
        <section key={group}>
          <h2 className="text-xs uppercase tracking-[0.24em] text-warm">{group} — choose one</h2>
          <div className="mt-4 space-y-3">
            {groupItems.map((item) => row(
              item,
              <button
                type="button"
                onClick={() => chooseTier(item.id)}
                aria-label={`Choose ${item.title}`}
                className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
                  selections[item.id]?.selected ? 'border-primary bg-primary' : 'border-border bg-transparent'
                }`}
              />,
            ))}
          </div>
        </section>
      ))}

      {optional.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.24em] text-warm">Optional add-ons</h2>
          <div className="mt-4 space-y-3">
            {optional.map((item) => row(
              item,
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[#d9622c]"
                checked={Boolean(selections[item.id]?.selected)}
                onChange={(e) => toggle(item.id, e.target.checked)}
                aria-label={`Add ${item.title}`}
              />,
            ))}
          </div>
        </section>
      )}

      {quantityItems.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.24em] text-warm">Choose your quantity</h2>
          <div className="mt-4 space-y-3">
            {quantityItems.map((item) => row(
              item,
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-md border border-border text-foreground"
                  onClick={() => setQuantity(item.id, Math.max(item.quantity_min ?? 0, Number(selections[item.id]?.quantity ?? item.default_quantity ?? 1) - 1))}
                  aria-label="Decrease quantity"
                >–</button>
                <span className="w-10 text-center text-sm text-foreground">{selections[item.id]?.quantity ?? item.default_quantity ?? 1}</span>
                <button
                  type="button"
                  className="h-8 w-8 rounded-md border border-border text-foreground"
                  onClick={() => setQuantity(item.id, Math.min(item.quantity_max ?? 99, Number(selections[item.id]?.quantity ?? item.default_quantity ?? 1) + 1))}
                  aria-label="Increase quantity"
                >+</button>
              </div>,
            ))}
          </div>
        </section>
      )}

      {errors.length > 0 && (
        <p className="text-sm text-destructive">{errors[0]}</p>
      )}

      <div className="sticky bottom-4 z-10 rounded-md border border-border bg-card/95 p-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Total investment</p>
            <p className="font-heading text-2xl text-foreground">{formatUsd(totals.totalCents)}</p>
          </div>
          <button
            type="button"
            disabled={errors.length > 0}
            onClick={onContinue}
            className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Review & Sign <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {proposal.expiration_date && (
        <p className="text-center text-xs text-muted-foreground/70">
          This proposal is valid through {new Date(proposal.expiration_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.
        </p>
      )}
    </div>
  );
}