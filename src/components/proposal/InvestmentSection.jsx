import React from 'react';
import { fmtMoney } from '@/lib/proposalFormat';

const LINE = 'flex items-baseline justify-between gap-4 border-b border-border/50 py-3';

/**
 * Investment: fixed scope, tiered packages, add-ons, credits, payment
 * schedule, and optional future work. Display-only math mirrors the
 * authoritative server-side calculation performed at signing.
 */
export default function InvestmentSection({ proposal, selections, setSelections }) {
  const inv = proposal.investment || {};
  const items = inv.items || [];
  const tierGroups = [...new Set(items.filter((i) => i.kind === 'tier').map((i) => i.tier_group))];
  const required = items.filter((i) => i.kind === 'required');
  const quantityItems = items.filter((i) => i.kind === 'quantity_based');
  const addonItems = items.filter((i) => i.kind === 'addon');
  const credits = inv.credits || [];
  const schedule = inv.schedule || [];
  const isMonthly = inv.mode === 'monthly';
  const isTiered = inv.mode === 'tiered' || tierGroups.length > 0;

  const priceOf = (item, qty) => (item.unit_price_cents || 0) * (qty || 1);
  const chosenTier = tierGroups
    .flatMap((g) => items.filter((i) => i.kind === 'tier' && i.tier_group === g))
    .find((i) => selections[i.id]?.selected);
  const scopeCents =
    required.reduce((s, i) => s + priceOf(i, 1), 0) +
    quantityItems.reduce((s, i) => s + priceOf(i, selections[i.id]?.quantity ?? i.quantity_default ?? 0), 0) +
    (chosenTier ? priceOf(chosenTier, 1) : 0);
  const addonCents = addonItems.reduce((s, i) => s + (selections[i.id]?.selected ? priceOf(i, selections[i.id]?.quantity || 1) : 0), 0);
  const creditCents = credits.reduce((s, c) => s + (c.amount_cents || 0), 0);
  const total = Math.max(0, scopeCents + addonCents - creditCents);
  const deposit = schedule.length ? Math.round((total * (schedule[0].percent || 0)) / 100) : total;
  const remaining = total - deposit;

  const toggleAddon = (item) => {
    setSelections((s) => ({ ...s, [item.id]: { ...(s[item.id] || {}), selected: !s[item.id]?.selected } }));
  };
  const setQuantity = (item, value) => {
    setSelections((s) => ({ ...s, [item.id]: { ...(s[item.id] || {}), quantity: Number(value) || 0, selected: true } }));
  };
  const pickTier = (item) => {
    setSelections((s) => {
      const next = { ...s };
      items.filter((i) => i.kind === 'tier' && i.tier_group === item.tier_group).forEach((i) => {
        next[i.id] = { ...(next[i.id] || {}), selected: i.id === item.id };
      });
      return next;
    });
  };

  const Row = ({ label, value, strong }) => (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={strong ? 'font-heading text-2xl text-foreground' : 'text-sm font-medium text-foreground'}>{value}</span>
    </div>
  );

  const ItemLine = ({ item, qty = 1, children }) => (
    <div className={LINE}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{item.label}</p>
        {item.description ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">{children}<span className="text-sm font-medium text-foreground">{fmtMoney(priceOf(item, qty), proposal.currency)}</span></div>
    </div>
  );

  return (
    <section id="investment" className="scroll-mt-24 space-y-8">
      <div>
        <p className="text-warm text-[11px] font-semibold uppercase tracking-[0.16em]">Investment</p>
        <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">Your investment.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {isTiered
            ? 'Select one package and any available additions. Your scope, total, and payment schedule will update before you review the agreement.'
            : 'Below is the investment for the agreed work, along with your payment schedule and any optional additions.'}
        </p>
      </div>

      <div className="space-y-1">
        {required.map((item) => <ItemLine key={item.id} item={item} />)}
        {quantityItems.map((item) => (
          <ItemLine key={item.id} item={item} qty={selections[item.id]?.quantity ?? item.quantity_default ?? 0}>
            {item.quantity_max > 1 ? (
              <select
                aria-label={`${item.label} quantity`}
                className="admin-input !w-20 !py-1.5 text-xs"
                value={selections[item.id]?.quantity ?? item.quantity_default ?? 0}
                onChange={(e) => setQuantity(item, e.target.value)}
              >
                {Array.from({ length: (item.quantity_max || 1) - (item.quantity_min ?? 0) + 1 }, (_, i) => (item.quantity_min ?? 0) + i).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            ) : null}
          </ItemLine>
        ))}
        {tierGroups.map((group) => (
          <div key={group} className="space-y-1 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{group}</p>
            {items.filter((i) => i.kind === 'tier' && i.tier_group === group).map((item) => (
              <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-sm border border-border/60 p-3 transition-colors hover:border-primary/40">
                <input
                  type="radio"
                  name={`tier-${group}`}
                  className="mt-1"
                  checked={selections[item.id]?.selected === true}
                  onChange={() => pickTier(item)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{fmtMoney(item.unit_price_cents || 0, proposal.currency)}</span>
                  </span>
                  {item.description ? <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{item.description}</span> : null}
                </span>
              </label>
            ))}
          </div>
        ))}
        {addonItems.length ? (
          <div className="space-y-1 pt-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Optional additions</p>
            {addonItems.map((item) => (
              <ItemLine key={item.id} item={item} qty={selections[item.id]?.quantity || 1}>
                <input
                  type="checkbox"
                  aria-label={`Include ${item.label}`}
                  checked={selections[item.id]?.selected === true}
                  onChange={() => toggleAddon(item)}
                />
              </ItemLine>
            ))}
          </div>
        ) : null}
        {credits.map((c) => (
          <div key={c.label} className={LINE}>
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="text-sm font-medium text-foreground">-{fmtMoney(c.amount_cents || 0, proposal.currency)}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-card p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Summary</p>
        {isMonthly ? (
          <div className="mt-3">
            <Row label="Monthly payment" value={fmtMoney(inv.monthly?.amount_cents || 0, proposal.currency)} strong />
            <Row label="Number of months" value={String(inv.monthly?.months || '')} />
            <Row label="Total commitment" value={fmtMoney((inv.monthly?.amount_cents || 0) * (inv.monthly?.months || 0), proposal.currency)} />
            <Row label="Billing start condition" value={inv.monthly?.billing_start || ''} />
          </div>
        ) : (
          <div className="mt-3">
            <Row label="Selected scope" value={fmtMoney(scopeCents, proposal.currency)} />
            {addonCents > 0 ? <Row label="Optional additions" value={fmtMoney(addonCents, proposal.currency)} /> : null}
            {creditCents > 0 ? <Row label="Package credit" value={`-${fmtMoney(creditCents, proposal.currency)}`} /> : null}
            <Row label="Project total" value={fmtMoney(total, proposal.currency)} strong />
            <Row label="Due upon acceptance" value={fmtMoney(deposit, proposal.currency)} />
            <Row label="Remaining balance" value={fmtMoney(remaining, proposal.currency)} />
          </div>
        )}
      </div>

      <div>
        {schedule.length ? (
          <ul className="space-y-1.5">
            {schedule.map((s, i) => (
              <li key={`${s.label}-${i}`} className="text-sm">
                <span className="font-medium text-foreground">{s.label}:</span>{' '}
                <span className="text-muted-foreground">{s.percent}% of the project fee. {s.due_event}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {inv.future_work?.length ? (
        <div className="dashboard-card p-6">
          <p className="font-heading text-xl text-foreground">Optional next engagement.</p>
          <p className="mt-1 text-sm text-muted-foreground">This work is not included in your current agreement or payment. It requires separate approval before it begins.</p>
          <ul className="mt-3 space-y-2">
            {inv.future_work.map((f, i) => (
              <li key={`${f.label}-${i}`} className="text-sm">
                <span className="font-medium text-foreground">{f.label}</span>
                {f.price ? <span className="text-muted-foreground"> · {fmtMoney(Math.round((Number(f.price) || 0) * 100), proposal.currency)}</span> : null}
                {f.term_note ? <span className="text-muted-foreground"> · {f.term_note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}