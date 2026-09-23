// Marketing Matrix shared model: measures, journey stages, priorities, scoring,
// and chart geometry. Consultant-only math (opportunity score, weights) lives
// here and mirrors base44/shared/brandHealth/matrix.ts — clients never receive
// formulas, only consultant-approved results.

export const MATRIX_MEASURES = [
  {
    key: 'channel_fit',
    label: 'Channel Fit Index',
    weightKey: 'channel_fit',
    defaultWeight: 35,
    purpose:
      'Whether the active and planned channels actually fit this business — its market, buyer, offer, geography, positioning, and capacity.',
  },
  {
    key: 'journey_coverage',
    label: 'Journey Coverage Score',
    weightKey: 'journey_coverage',
    defaultWeight: 25,
    purpose:
      'Whether the business has intentional touchpoints across the customer journey: Trigger, Discovery, Evaluation, Decision, and Retention & Referral.',
  },
  {
    key: 'channel_integration',
    label: 'Channel Integration Score',
    weightKey: 'channel_integration',
    defaultWeight: 25,
    purpose:
      'Whether marketing works as one coherent system — every channel leading somewhere relevant, proof reused, follow-up timely — rather than disconnected tactics.',
  },
  {
    key: 'execution_readiness',
    label: 'Execution Readiness Score',
    weightKey: 'execution_readiness',
    defaultWeight: 15,
    purpose:
      'Whether the business can realistically execute the recommended strategy: capacity, budget, assets, infrastructure, tracking, and fulfillment.',
  },
];

// The five Marketing Matrix diagnostic scorecards. The first four feed the
// internal Market Alignment Index; Customer Growth Readiness is a standalone
// diagnostic and carries no MAI weight by default.
export const MATRIX_SCORECARDS = [
  {
    key: 'channel_fit',
    label: 'Channel Fit',
    purpose:
      'Whether selected marketing channels match the actual buyer, offer type, positioning, buying cycle, available capacity, and revenue goals.',
  },
  {
    key: 'journey_coverage',
    label: 'Journey Coverage',
    purpose:
      'Whether ideal buyers have a clear and credible experience from initial problem awareness through discovery, evaluation, decision, retention, and advocacy.',
  },
  {
    key: 'channel_integration',
    label: 'Channel Integration',
    purpose:
      'Whether marketing channels, authority assets, content, offers, website pages, email nurture, partnerships, and customer experiences operate as one connected growth system rather than separate activities.',
  },
  {
    key: 'execution_readiness',
    label: 'Execution Readiness',
    purpose:
      'Whether the business has the offers, assets, capacity, workflows, ownership, templates, tools, data, and measurement discipline required to run the selected marketing strategy reliably.',
  },
  {
    key: 'customer_growth_readiness',
    label: 'Customer Growth Readiness',
    purpose:
      'Whether current and former clients, referral partners, collaborators, and supporters are intentionally supported to create retention, re-engagement, expanded work, reviews, testimonials, case studies, referrals, and advocacy.',
  },
];

const MATRIX_STATUS_BANDS = [
  { min: 80, label: 'Strong' },
  { min: 65, label: 'Active' },
  { min: 50, label: 'Partial' },
  { min: 35, label: 'Build' },
  { min: 0, label: 'Critical' },
];

/** Status label derived from a manually entered 0–100 score. */
export function matrixStatusLabel(score) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return null;
  const band = MATRIX_STATUS_BANDS.find((b) => score >= b.min);
  return band ? band.label : null;
}

// --- Marketing Matrix readiness -------------------------------------------------
// Baseline minimum: the eight details the Matrix needs to score well. A value
// counts as present when it lives on the record, in the client's intake
// answers, or in the mapped intake question. Consultant-loaded findings take
// precedence — client_intake_complete is never the sole gate.
export const BASELINE_FIELDS = [
  { key: 'baseline_industry', label: 'Industry', question: 'What industry is your business in?', fallback: 'industry' },
  { key: 'baseline_offer_type', label: 'Offer type', question: 'What type of offer do you sell?', fallback: 'offer_type' },
  { key: 'baseline_positioning', label: 'Positioning', question: 'How is your brand positioned in the market?', fallback: 'brand_positioning' },
  { key: 'baseline_visibility', label: 'Current visibility', question: 'Where is your business visible today? (search, social, referrals, media, events)', fallback: 'active_channels', long: true },
  { key: 'baseline_credibility', label: 'Credibility', question: 'What proof makes buyers trust you? (reviews, results, credentials, case studies)', long: true },
  { key: 'baseline_consistency', label: 'Consistency', question: 'How consistent is your marketing today, and what limits it?', long: true },
  { key: 'baseline_growth_priority', label: 'Growth priority', question: 'What is your main growth priority for the next 90 days?', fallback: 'goal_90_days' },
  { key: 'baseline_competitive_advantage', label: 'Competitive advantage', question: 'What makes you the stronger choice against competitors?', long: true },
];

/** Which baseline items are still unanswered. */
export function baselineStatus(record) {
  const intake = (record && record.intake_data) || {};
  const missing = [];
  for (const f of BASELINE_FIELDS) {
    const candidates = [record?.[f.key], intake[f.key], f.fallback ? intake[f.fallback] : null];
    const value = candidates.find((v) => typeof v === 'string' && v.trim());
    if (!value) missing.push(f.key);
  }
  return { minimum_baseline_met: missing.length === 0, missing_baseline_fields: missing };
}

/** Computed Matrix state — findings precedence first, intake gate last. */
export function computeMatrixState({ findings_loaded, client_intake_complete, minimum_baseline_met }) {
  if (findings_loaded && minimum_baseline_met) return 'results_available';
  if (findings_loaded && !minimum_baseline_met) return 'baseline_gap';
  if (!findings_loaded && client_intake_complete && minimum_baseline_met) return 'results_available';
  if (!findings_loaded && client_intake_complete && !minimum_baseline_met) return 'baseline_gap';
  return 'awaiting_intake';
}

/** Full readiness snapshot for a Marketing Matrix record. */
export function matrixFlags(record) {
  const r = record || {};
  const scores = r.matrix_scores || {};
  const scored = ['channel_fit', 'journey_coverage', 'channel_integration', 'execution_readiness', 'customer_growth_readiness']
    .some((k) => typeof (scores[k] || {}).score === 'number');
  const findings_loaded = r.findings_loaded === true || !!r.consultant_findings_summary || scored;
  const client_intake_complete = r.client_intake_complete === true || !!r.intake_received_date;
  const { minimum_baseline_met, missing_baseline_fields } = baselineStatus(r);
  const matrix_state = computeMatrixState({ findings_loaded, client_intake_complete, minimum_baseline_met });
  const data_source = findings_loaded && client_intake_complete ? 'mixed' : findings_loaded ? 'consultant_loaded' : 'client_intake';
  return {
    data_source,
    findings_loaded,
    client_intake_complete,
    minimum_baseline_met,
    missing_baseline_fields,
    matrix_state,
    matrix_ready: matrix_state === 'results_available',
    client_can_edit: false,
  };
}

/**
 * Readiness for a record whose flags were already computed server-side (the
 * client-shaped audit payload). Explicit flags win: the client payload never
 * carries baseline values or consultant findings, so deriving from it would
 * wrongly report a baseline gap.
 */
export function resolveMatrixFlags(record) {
  const r = record || {};
  if (typeof r.matrix_state !== 'string' || !r.matrix_state) return matrixFlags(r);
  return {
    data_source: r.data_source || (r.findings_loaded ? 'consultant_loaded' : 'client_intake'),
    findings_loaded: r.findings_loaded === true,
    client_intake_complete: r.client_intake_complete === true,
    minimum_baseline_met: r.minimum_baseline_met === true,
    missing_baseline_fields: Array.isArray(r.missing_baseline_fields) ? r.missing_baseline_fields : [],
    matrix_state: r.matrix_state,
    matrix_ready: r.matrix_ready === true || r.matrix_state === 'results_available',
    client_can_edit: false,
  };
}

export const JOURNEY_STAGES = [
  {
    key: 'trigger',
    label: 'Trigger',
    defaultWeight: 10,
    examples:
      'Seasonal campaigns, events, PR, partnerships, referral prompts, educational content, problem-aware messaging',
  },
  {
    key: 'discovery',
    label: 'Discovery',
    defaultWeight: 25,
    examples:
      'Search, Google Business Profile, Local Services Ads, SEO, directories, social, paid media, partnership access, events, networking, direct outreach',
  },
  {
    key: 'evaluation',
    label: 'Evaluation',
    defaultWeight: 25,
    examples:
      'Website, service pages, case studies, reviews, testimonials, portfolio, email nurture, comparison tools, FAQs, educational content, retargeting',
  },
  {
    key: 'decision',
    label: 'Decision',
    defaultWeight: 25,
    examples:
      'Clear offers, pricing/expectation clarity, booking/inquiry process, sales follow-up, consultation, application, checkout, risk reversal, timely response',
  },
  {
    key: 'retention_referral',
    label: 'Retention & Referral',
    defaultWeight: 15,
    examples:
      'Onboarding, follow-up, email, review requests, referral programs, loyalty, reactivation, seasonal reminders, community, upsells/cross-sells',
  },
];

export const JOURNEY_STATUS_LABELS = {
  strong: 'Strong',
  partial: 'Partial',
  missing: 'Missing',
  not_applicable: 'Not Applicable',
};

export const STRATEGIC_ROLES = [
  { key: 'primary_growth_channel', label: 'Primary growth channel' },
  { key: 'supporting_channel', label: 'Supporting channel' },
  { key: 'trust_building_channel', label: 'Trust-building channel' },
  { key: 'nurture_channel', label: 'Nurture channel' },
  { key: 'conversion_channel', label: 'Conversion channel' },
  { key: 'retention_referral_channel', label: 'Retention/referral channel' },
  { key: 'experiment', label: 'Experiment' },
  { key: 'deprioritize', label: 'Deprioritize' },
  { key: 'not_applicable', label: 'Not applicable' },
];

export const CONSULTANT_PRIORITIES = [
  { key: 'build', label: 'Build' },
  { key: 'scale', label: 'Scale' },
  { key: 'optimize', label: 'Optimize' },
  { key: 'maintain', label: 'Maintain' },
  { key: 'test', label: 'Test' },
  { key: 'deprioritize', label: 'Deprioritize' },
  { key: 'not_applicable', label: 'Not Applicable' },
];

export const PRIORITY_COLORS = {
  build: '#d9622c',
  scale: '#b3232c',
  optimize: '#f0d9b5',
  maintain: '#8f9aa6',
  test: '#d4a94e',
  deprioritize: '#4a5561',
  not_applicable: '#3a3f47',
};

export const CHANNEL_CATEGORIES = [
  'Search',
  'Local',
  'Paid Media',
  'Organic Social',
  'Content',
  'Email',
  'Partnerships',
  'Events',
  'Sales',
  'Direct',
  'Community',
  'Other',
];

export const MATURITY_LABELS = [
  '0 — Absent',
  '1 — Ad hoc',
  '2 — Active but inconsistent',
  '3 — Established',
  '4 — Optimized',
  '5 — Scalable / high-performing',
];

export const LEVERAGE_CATEGORIES = [
  { key: 'demand_capture', label: 'Demand Capture' },
  { key: 'borrowed_trust', label: 'Borrowed Trust' },
  { key: 'proof_multipliers', label: 'Proof Multipliers' },
  { key: 'audience_access', label: 'Audience Access' },
  { key: 'retention_loops', label: 'Retention Loops' },
  { key: 'category_creation', label: 'Category Creation' },
  { key: 'operational_advantage', label: 'Operational Advantage' },
  { key: 'asset_repurposing', label: 'Asset Repurposing' },
];

export const LEVERAGE_PRIORITIES = [
  { key: 'explore', label: 'Explore' },
  { key: 'test', label: 'Test' },
  { key: 'build', label: 'Build' },
  { key: 'defer', label: 'Defer' },
  { key: 'not_applicable', label: 'Not Applicable' },
];

export const QUADRANTS = [
  { key: 'priority_build', label: 'Priority Build', hint: 'High strategic fit · low execution strength', pos: 'top-left' },
  { key: 'scale_with_intention', label: 'Scale With Intention', hint: 'High strategic fit · strong execution strength', pos: 'top-right' },
  { key: 'monitor', label: 'Monitor', hint: 'Lower strategic fit · low execution strength', pos: 'bottom-left' },
  { key: 'reassess', label: 'Reassess', hint: 'Lower strategic fit · meaningful current effort', pos: 'bottom-right' },
];

export const METRIC_FIELDS = [
  { key: 'traffic', label: 'Traffic' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'inquiries', label: 'Inquiries' },
  { key: 'leads', label: 'Leads' },
  { key: 'qualified_leads', label: 'Qualified leads' },
  { key: 'calls', label: 'Calls' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'applications', label: 'Applications' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'conversion_rate', label: 'Conversion rate' },
  { key: 'close_rate', label: 'Close rate' },
  { key: 'customer_acquisition_cost', label: 'Customer acquisition cost' },
  { key: 'cost_per_qualified_lead', label: 'Cost per qualified lead' },
  { key: 'retention', label: 'Retention' },
  { key: 'reviews_generated', label: 'Reviews generated' },
  { key: 'referrals_generated', label: 'Referrals generated' },
];

const DEFAULT_MATRIX_WEIGHTS_JS = { channel_fit: 35, journey_coverage: 25, channel_integration: 25, execution_readiness: 15 };

export function matrixWeights(audit) {
  return { ...DEFAULT_MATRIX_WEIGHTS_JS, ...((audit && audit.matrix_weights) || {}) };
}

export function journeyWeights(audit) {
  const defaults = {};
  JOURNEY_STAGES.forEach((s) => { defaults[s.key] = s.defaultWeight; });
  return { ...defaults, ...((audit && audit.journey_weights) || {}) };
}

export function measureScore(audit, key) {
  const row = audit?.matrix_scores?.[key] || {};
  return typeof row.score === 'number' ? row.score : null;
}

/** Market Alignment Index — null until every measure carries a consultant score. */
export function maiValue(audit) {
  const weights = matrixWeights(audit);
  const total = MATRIX_MEASURES.reduce((s, m) => s + (Number(weights[m.key]) || 0), 0);
  if (total <= 0) return null;
  let acc = 0;
  for (const m of MATRIX_MEASURES) {
    const v = measureScore(audit, m.key);
    if (v === null) return null;
    acc += v * (Number(weights[m.key]) || 0);
  }
  return Math.round(acc / total);
}

export function stageCoverageMap(audit) {
  const map = {};
  for (const r of (audit?.journey_coverage) || []) {
    if (r && r.stage && typeof r.coverage === 'number') map[r.stage] = r.coverage;
  }
  return map;
}

/** Internal consultant-only Channel Opportunity Score — a sorting aid. */
export function opportunityScore(channel, audit) {
  const coverage = stageCoverageMap(audit);
  const num = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const fit = num(channel.strategic_fit, 3);
  const impact = num(channel.buyer_impact, 3);
  const confidence = num(channel.execution_confidence, 3);
  const measurement = num(channel.measurement_readiness, 2);
  const investment = num(channel.investment_required, 3);
  const timeToImpact = num(channel.time_to_impact, 3);

  let value = (fit * 0.3 + impact * 0.25 + confidence * 0.2 + (measurement / 5) * 0.1) / 5 * 100;
  value -= (investment - 1) * 3.5;
  value -= (timeToImpact - 1) * 2.5;
  if (channel.journey_stage && typeof coverage[channel.journey_stage] === 'number' && coverage[channel.journey_stage] < 50) {
    value += 8;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Chart position: x = maturity/5, y = average of strategic fit and buyer impact /5. */
export function channelPos(channel) {
  const maturity = Number(channel.maturity);
  const fit = Number(channel.strategic_fit);
  const impact = Number(channel.buyer_impact);
  const x = Number.isFinite(maturity) ? Math.max(0, Math.min(5, maturity)) / 5 : 0;
  let avg = 0;
  if (Number.isFinite(fit) && Number.isFinite(impact)) {
    avg = (Math.max(1, Math.min(5, fit)) + Math.max(1, Math.min(5, impact))) / 2;
  }
  return { x, y: avg / 5 };
}

export function quadrantOf(channel) {
  const { x, y } = channelPos(channel);
  if (y >= 0.5 && x < 0.5) return 'priority_build';
  if (y >= 0.5 && x >= 0.5) return 'scale_with_intention';
  if (y < 0.5 && x < 0.5) return 'monitor';
  return 'reassess';
}

export function dotSizePx(opportunity) {
  return 16 + (Math.max(0, Math.min(100, opportunity || 0)) / 100) * 22;
}

/** Five stage rows, seeded with the audit's saved values in canonical order. */
export function seededJourneyRows(audit) {
  const saved = {};
  for (const r of (audit?.journey_coverage) || []) {
    if (r && r.stage) saved[r.stage] = r;
  }
  return JOURNEY_STAGES.map((s) => ({
    stage: s.key,
    coverage: saved[s.key]?.coverage ?? null,
    status: saved[s.key]?.status || 'partial',
    internal_notes: saved[s.key]?.internal_notes || '',
    client_notes: saved[s.key]?.client_notes || '',
    client_visible: saved[s.key]?.client_visible === true,
  }));
}