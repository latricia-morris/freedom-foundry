// Mapping helpers for the proposal studio: parse result -> draft payload.
export const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Awaiting review',
  viewed: 'Awaiting review',
  changes_requested: 'Changes requested',
  signed_awaiting_payment: 'Signed',
  awaiting_offline_deposit: 'Awaiting deposit',
  deposit_paid: 'Deposit received',
  paid_in_full: 'Deposit received',
  expired: 'Expired',
  superseded: 'Superseded',
  cancelled: 'Cancelled',
};

export function mapKind(kind) {
  if (kind === 'tier') return 'tier';
  if (kind === 'addon') return 'addon';
  if (kind === 'quantity_based' || kind === 'quantity') return 'quantity_based';
  return 'required';
}

/**
 * Build the draft payload for a parsed markdown result. Recipient binding
 * comes from the selected client record; parsed values are shown for
 * confirmation in the studio.
 */
export function buildDraftPayload({ parsed, client, form }) {
  const items = (parsed?.investment?.items || []).map((i) => ({
    id: i.label,
    label: i.label,
    kind: mapKind(i.kind),
    tier_group: i.tier_group || '',
    quantity_default: i.quantity_default ?? 1,
    quantity_min: i.quantity_min ?? 0,
    quantity_max: i.quantity_max ?? null,
    unit_price: Number(i.unit_price) || 0,
    unit: i.unit || '',
    description: i.description || '',
  }));
  const monthly = parsed?.investment?.monthly
    ? {
        amount_cents: Math.round((Number(parsed.investment.monthly.amount) || 0) * 100),
        months: parsed.investment.monthly.months || 0,
        billing_start: parsed.investment.monthly.billing_start || '',
      }
    : null;
  const issueDate = new Date().toISOString().slice(0, 10);
  const expiryDate = new Date(Date.now() + (Number(form.validity_days) || 30) * 86400000).toISOString().slice(0, 10);
  const isIndividual = !client?.company_name;
  return {
    agency_client_id: client?.id || '',
    title: parsed?.title || form.title || 'Client proposal',
    project_type: form.project_type || parsed?.project_type || '',
    issue_date: issueDate,
    expiry_date: expiryDate,
    recipient: {
      full_name: client?.primary_contact_name || parsed?.recipient?.full_name || '',
      email: client?.primary_contact_email || parsed?.recipient?.email || '',
      phone: parsed?.recipient?.phone || '',
      title: parsed?.recipient?.title || '',
      company_name: client?.company_name || '',
      company_legal_name: client?.company_name || '',
      website: client?.company_name ? client?.notes || '' : '',
      notice_email: client?.primary_contact_email || parsed?.recipient?.email || '',
      is_individual: isIndividual,
      greeting_name: (client?.primary_contact_name || parsed?.recipient?.full_name || '').split(' ')[0] || '',
      contracting_party_name: isIndividual
        ? (client?.primary_contact_name || parsed?.recipient?.full_name || '')
        : (client?.company_name || ''),
      designated_signers: [],
    },
    content: {
      introduction: parsed?.introduction || '',
      context: parsed?.context || '',
      goals: parsed?.goals || [],
      modules: parsed?.scope_modules || [],
      not_included: parsed?.not_included || [],
    },
    investment: {
      mode: parsed?.investment?.mode === 'monthly' ? 'monthly' : (parsed?.investment?.mode === 'tiered' || (parsed?.investment?.items || []).some((i) => i.kind === 'tier') ? 'tiered' : 'fixed'),
      items,
      credits: parsed?.investment?.credits || [],
      schedule: parsed?.investment?.schedule || [],
      monthly,
      future_work: parsed?.future_work || [],
    },
    timeline: {
      preset: parsed?.timeline?.preset || '',
      phases: parsed?.timeline?.phases || [],
      milestones: parsed?.timeline?.milestones || [],
    },
    parse_review: [
      ...(parsed?.unresolved || []).map((u) => ({ kind: 'unresolved', section: u.section, note: u.note })),
      ...(parsed?.agreement_overrides || []).map((o) => ({ kind: 'override', section: o.clause, note: o.change })),
    ],
    sections_visible: { approach: form.approach, capabilities: form.capabilities, meet: form.meet, book: form.book },
    admin_notes: form.admin_notes || '',
  };
}