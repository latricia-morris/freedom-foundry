// Shared labels and helpers for the Digital Brand Health system, used by
// both the client-facing portal and the consultant/admin workspace.

export const PUBLISHED_STATUS = 'published_to_client';

export const AUDIT_STATUSES = [
  'requested',
  'intake_received',
  'scheduled',
  'in_review',
  'draft_complete',
  'awaiting_consultant_review',
  'published_to_client',
  'archived',
];

export const STATUS_LABELS = {
  requested: 'Requested',
  intake_received: 'Intake Received',
  scheduled: 'Scheduled',
  in_review: 'In Review',
  draft_complete: 'Draft Complete',
  awaiting_consultant_review: 'Awaiting Consultant Review',
  published_to_client: 'Published to Client',
  archived: 'Archived',
};

export const COMPONENTS = [
  {
    key: 'website_discoverability',
    title: 'Website Discoverability',
    descriptor: 'How easily the right people can find and recognize your business online.',
    missing: "It looks like we haven't yet conducted a Website Discoverability Audit for your brand.",
    matrix: false,
  },
  {
    key: 'conversion_readiness',
    title: 'Conversion Readiness',
    descriptor: 'How clearly your website guides qualified visitors toward action.',
    missing: "It looks like we haven't yet conducted a Conversion Readiness Audit for your brand.",
    matrix: false,
  },
  {
    key: 'marketing_matrix',
    title: 'Marketing Matrix',
    descriptor: 'Channel fit and customer journey alignment for your growth strategy.',
    missing: "It looks like we haven't yet developed a Marketing Matrix for your brand.",
    matrix: true,
  },
];

export const COMPONENT_LABELS = Object.fromEntries(COMPONENTS.map((c) => [c.key, c.title]));

export const NOTE_COMPONENT_OPTIONS = [
  { value: 'digital_brand_health', label: 'Digital Brand Health' },
  { value: 'website_discoverability', label: 'Website Discoverability' },
  { value: 'conversion_readiness', label: 'Conversion Readiness' },
  { value: 'marketing_matrix', label: 'Marketing Matrix' },
];

export const NOTE_PRIORITIES = ['critical', 'high', 'medium', 'opportunity', 'observation'];
export const ACTION_PRIORITIES = ['critical', 'high', 'medium', 'opportunity'];

export const CREDIT_LANGUAGE =
  'If you move forward with a qualifying Freedom Foundry implementation, branding, website, or strategy package, your audit investment may be credited toward that work. Your audit credit is distributed evenly across the active months of your selected package rather than applied as a single upfront discount.';

export function fmtDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function money(cents) {
  return `$${((cents || 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Status line shown on in-review cards, in the spec's precedence order. */
export function reviewStatusLine(audit, matrix) {
  if (audit.intake_received_date) return `Intake received ${fmtDate(audit.intake_received_date)}`;
  if (audit.review_scheduled_date) return `Review scheduled ${fmtDate(audit.review_scheduled_date)}`;
  return matrix ? 'Strategy mapping in progress' : 'Audit in progress';
}

/** Latest non-archived audit per component, keyed by component. */
export function latestByComponent(audits) {
  const map = {};
  for (const a of audits || []) {
    if (a.status === 'archived') continue;
    if (!map[a.component]) map[a.component] = a;
  }
  return map;
}