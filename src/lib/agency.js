// Agency OS client helpers. All money is integer cents; display is USD with
// exactly two decimal places.

export function formatUsd(cents) {
  const value = (Number(cents) || 0) / 100;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function centsFromInput(value) {
  const n = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function inputFromCents(cents) {
  return ((Number(cents) || 0) / 100).toFixed(2);
}

export function depositCentsFor(totalCents, ruleType, ruleValue) {
  const total = Number(totalCents) || 0;
  if (ruleType === 'fixed_amount') return Math.max(0, Math.round(ruleValue || 0));
  if (ruleType === 'full_payment' || ruleType === 'tier_specific') return Math.round(total);
  const pct = Math.min(100, Math.max(0, ruleValue || 0));
  return Math.round((total * pct) / 100);
}

/** Live client-side mirror of the server pricing — preview only. The server
 *  always re-prices selections from stored line items at acceptance. */
export function computeClientTotals(items, selections) {
  const lines = [];
  const push = (item, quantity) => lines.push({
    id: item.id,
    title: item.title,
    item_type: item.item_type,
    quantity,
    unit_price_cents: item.unit_price_cents ?? 0,
    line_total_cents: (item.unit_price_cents || 0) * quantity,
    pricing_visible: item.pricing_visible !== false,
    display_order: item.display_order || 0,
  });

  const tierGroups = new Map();
  (items || []).forEach((item) => {
    if (item.item_type === 'tier' && item.tier_group) {
      if (!tierGroups.has(item.tier_group)) tierGroups.set(item.tier_group, []);
      tierGroups.get(item.tier_group).push(item);
    }
  });
  tierGroups.forEach((groupItems) => {
    const chosen = groupItems.find((i) => selections[i.id]?.selected)
      || (groupItems.length === 1 ? groupItems[0] : null);
    if (chosen) push(chosen, 1);
  });

  (items || []).forEach((item) => {
    if (item.item_type === 'tier') return;
    if (item.item_type === 'required') {
      push(item, 1);
    } else if (item.item_type === 'quantity_based') {
      const min = item.quantity_min ?? 0;
      const max = item.quantity_max ?? null;
      let qty = Number(selections[item.id]?.quantity ?? item.default_quantity ?? min);
      if (!Number.isFinite(qty)) qty = min;
      qty = Math.floor(Math.max(min, max != null ? Math.min(max, qty) : qty));
      if (qty > 0) push(item, qty);
    } else if (selections[item.id]?.selected) {
      push(item, 1);
    }
  });

  lines.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  const totalCents = lines.reduce((sum, l) => sum + l.line_total_cents, 0);
  return { lines, totalCents };
}

export function tierGroupErrors(items, selections) {
  const groups = new Map();
  (items || []).forEach((item) => {
    if (item.item_type === 'tier' && item.tier_group && item.tier_group.trim()) {
      if (!groups.has(item.tier_group)) groups.set(item.tier_group, []);
      groups.get(item.tier_group).push(item);
    }
  });
  const errors = [];
  groups.forEach((groupItems, group) => {
    if (groupItems.length > 1) {
      const chosen = groupItems.some((i) => selections[i.id]?.selected);
      if (!chosen) errors.push(`Choose an option for ${group}.`);
    }
  });
  return errors;
}

export const PROPOSAL_STATUS_LABELS = {
  draft: 'Draft',
  internal_review: 'Internal Review',
  sent: 'Sent',
  viewed: 'Viewed',
  selections_in_progress: 'Selections In Progress',
  accepted_awaiting_deposit: 'Accepted — Awaiting Deposit',
  deposit_checkout_opened: 'Deposit Checkout Opened',
  deposit_paid: 'Deposit Paid',
  expired: 'Expired',
  declined: 'Declined',
  superseded: 'Superseded',
  cancelled: 'Cancelled',
};

export const PROPOSAL_STATUS_STYLES = {
  draft: 'border-border text-muted-foreground',
  internal_review: 'border-border text-muted-foreground',
  sent: 'border-primary/40 text-primary',
  viewed: 'border-primary/40 text-primary',
  selections_in_progress: 'border-primary/50 text-primary',
  accepted_awaiting_deposit: 'border-amber-500/40 text-amber-400',
  deposit_checkout_opened: 'border-amber-500/40 text-amber-400',
  deposit_paid: 'border-emerald-500/40 text-emerald-400',
  expired: 'border-border text-muted-foreground/60',
  declined: 'border-destructive/40 text-destructive',
  superseded: 'border-border text-muted-foreground/60',
  cancelled: 'border-destructive/40 text-destructive',
};

export const PAYMENT_OPS_LABELS = {
  deposit_pending: 'Deposit Pending',
  deposit_confirmed: 'Deposit Confirmed',
  payment_verification_pending: 'Payment Verification Pending',
  final_payment_pending: 'Final Payment Pending',
  delivery_hold: 'Delivery Hold',
  eligible_for_release: 'Eligible for Release',
  released: 'Released',
};

export const INSTALLMENT_STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending',
  checkout_opened: 'Checkout Opened',
  paid: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  disputed: 'Disputed',
  waived: 'Waived',
  manual_review: 'Manual Review',
};

export const TASK_STATUS_LABELS = {
  not_started: 'Not Started',
  scheduled: 'Scheduled',
  waiting_on_client: 'Waiting on Client',
  in_production: 'In Production',
  internal_review: 'Internal Review',
  ready_for_client_review: 'Ready for Client Review',
  client_review_in_progress: 'Client Review In Progress',
  revisions_requested: 'Revisions Requested',
  client_approved: 'Client Approved',
  awaiting_payment_release: 'Awaiting Payment Release',
  released: 'Released',
  blocked: 'Blocked',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export const DELIVERABLE_REVIEW_LABELS = {
  not_started: 'Not Started',
  in_production: 'In Production',
  internal_review: 'Internal Review',
  ready_for_client_review: 'Ready for Client Review',
  client_reviewing: 'Client Reviewing',
  revisions_requested: 'Revisions Requested',
  client_approved: 'Client Approved',
  awaiting_payment_release: 'Awaiting Payment Release',
  released: 'Released',
};

export const RELEASE_RULE_LABELS = {
  manual: 'Manual Release',
  deposit_paid: 'After Deposit Paid',
  milestone_paid: 'After Milestone Paid',
  final_invoice_paid: 'After Final Invoice Paid',
  account_paid_in_full: 'After Account Paid in Full',
};