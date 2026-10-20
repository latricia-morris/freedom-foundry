// Authoritative pricing for Studio documents. Future work is never selectable.
export function studioQuote(investment = {}, selections = {}) {
  const lines = [], errors = [], groups = new Map();
  for (const item of investment.items || []) {
    if (item.acceptance_mode === 'future' || item.charge === false || item.parent_bundle_id) continue;
    if (item.alternative_group) {
      const group = groups.get(item.alternative_group) || [];
      group.push(item); groups.set(item.alternative_group, group);
    }
  }
  for (const [name, items] of groups) {
    const picked = items.filter(i => selections[i.id]?.selected === true);
    if (picked.length !== 1) errors.push(`Select exactly one alternative in ${name}.`);
  }
  for (const item of investment.items || []) {
    if (item.acceptance_mode === 'future' || item.charge === false || item.parent_bundle_id) continue;
    const selected = item.alternative_group ? selections[item.id]?.selected === true : item.acceptance_mode === 'included' || selections[item.id]?.selected === true;
    if (!selected) continue;
    if (!['included', 'optional_now'].includes(item.acceptance_mode)) { errors.push(`Confirm acceptance mode for ${item.label}.`); continue; }
    const qty = item.billing_type === 'per_item' ? Number(selections[item.id]?.quantity ?? item.quantity_default ?? 1) : 1;
    const unit = Number(item.unit_price_cents);
    if (item.unit_price_cents == null || !['one_time','bundle','per_item','monthly'].includes(item.billing_type) || !Number.isInteger(unit) || unit < 0 || !Number.isInteger(qty) || qty < (item.quantity_min ?? 0) || (item.quantity_max != null && qty > item.quantity_max)) { errors.push(`Check price and quantity for ${item.label}.`); continue; }
    let months = 1;
    if (item.billing_type === 'monthly') {
      months = Number(item.months);
      if (!Number.isInteger(months) || months < 1 || !item.billing_start) { errors.push(`Confirm recurring term and billing start for ${item.label}.`); continue; }
    }
    lines.push({ line_item_id: item.id, title: item.label, quantity: qty, unit_price_cents: unit, billing_type: item.billing_type, months: item.billing_type === 'monthly' ? months : undefined, billing_start: item.billing_start || '', line_total_cents: unit * qty * months, acceptance_mode: item.acceptance_mode });
  }
  const creditCents = (investment.credits || []).filter(c => c.acceptance_mode !== 'future').reduce((s, c) => s + Math.max(0, Math.round(Number(c.amount_cents) || 0)), 0);
  const totalCents = Math.max(0, lines.reduce((s, l) => s + l.line_total_cents, 0) - creditCents);
  const obligations = (investment.schedule || []).map(s => ({ ...s, amount_cents: s.percent != null ? Math.round(totalCents * Number(s.percent) / 100) : Math.round(Number(s.amount_cents) || 0) }));
  if (!obligations.length || obligations.some(s => !s.due_event)) errors.push('Every payment obligation needs a due event.');
  if (obligations.some(s => !Number.isInteger(s.amount_cents) || s.amount_cents < 0 || (s.percent != null && (!Number.isFinite(Number(s.percent)) || s.percent < 0 || s.percent > 100)))) errors.push('Payment amounts and percentages must be valid nonnegative values.');
  if (obligations.reduce((s, o) => s + o.amount_cents, 0) !== totalCents) errors.push('Payment obligations must equal the accepted total.');
  return { lines, creditCents, totalCents, depositCents: obligations[0]?.amount_cents || 0, obligations, errors };
}