// Shared Marketing Matrix scoring used by backend functions. The frontend
// keeps a parallel copy in src/lib/matrix.js — the two intentionally compute
// the same values.

export const MEASURE_KEYS = [
  'channel_fit',
  'journey_coverage',
  'channel_integration',
  'execution_readiness',
] as const;

export type MeasureKey = (typeof MEASURE_KEYS)[number];

export const DEFAULT_MATRIX_WEIGHTS: Record<MeasureKey, number> = {
  channel_fit: 35,
  journey_coverage: 25,
  channel_integration: 25,
  execution_readiness: 15,
};

export const DEFAULT_JOURNEY_WEIGHTS: Record<string, number> = {
  trigger: 10,
  discovery: 25,
  evaluation: 25,
  decision: 25,
  retention_referral: 15,
};

/**
 * Market Alignment Index: weighted combination of the four consultant-scored
 * measures. Returns null unless every measure has a numeric score — the
 * consultant sets the scores; this never invents one.
 */
export function computeMai(
  scores: Record<string, { score?: number } | undefined> | null | undefined,
  weights: Record<string, number> | null | undefined,
): number | null {
  const w = { ...DEFAULT_MATRIX_WEIGHTS, ...(weights || {}) };
  const totalWeight = MEASURE_KEYS.reduce((sum, k) => sum + (Number(w[k]) || 0), 0);
  if (totalWeight <= 0) return null;
  let acc = 0;
  let complete = true;
  for (const k of MEASURE_KEYS) {
    const s = scores?.[k]?.score;
    if (typeof s === 'number' && Number.isFinite(s)) {
      acc += s * (Number(w[k]) || 0);
    } else {
      complete = false;
    }
  }
  if (!complete) return null;
  return Math.round(acc / totalWeight);
}

/**
 * Internal Channel Opportunity Score — a consultant-only sorting aid. Derived
 * from strategic fit, buyer impact, execution confidence, and measurement
 * readiness, penalized by investment and time-to-impact, and boosted when the
 * channel targets a journey stage with weak coverage. Never shown to clients.
 */
export function opportunityScore(
  channel: Record<string, unknown>,
  stageCoverage: Record<string, number> = {},
): number {
  const num = (v: unknown, fallback: number) => {
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
  const stage = String(channel.journey_stage || '');
  const coverage = stageCoverage[stage];
  if (typeof coverage === 'number' && coverage < 50) value += 8;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Normalized 0–1 chart position for a channel dot. */
export function channelPosition(channel: Record<string, unknown>): { x: number; y: number } {
  const maturity = Number(channel.maturity);
  const fit = Number(channel.strategic_fit);
  const impact = Number(channel.buyer_impact);
  const x = Number.isFinite(maturity) ? Math.max(0, Math.min(5, maturity)) / 5 : 0;
  const fitAvg =
    Number.isFinite(fit) && Number.isFinite(impact)
      ? (Math.max(1, Math.min(5, fit)) + Math.max(1, Math.min(5, impact))) / 2
      : 0;
  return { x, y: fitAvg / 5 };
}

// --- Marketing Matrix readiness -------------------------------------------------
// The baseline minimum: the eight details the Matrix needs in order to score
// well. A baseline value counts as present when it lives on the record, in the
// client's intake answers, or in the mapped intake question. Findings loaded
// from a consultant interview always take precedence over the intake gate —
// client_intake_complete is never the sole gate.

export type BaselineField = {
  key: string;
  label: string;
  question: string;
  fallback?: string;
};

export const BASELINE_FIELDS: BaselineField[] = [
  { key: 'baseline_industry', label: 'Industry', question: 'What industry is your business in?', fallback: 'industry' },
  { key: 'baseline_offer_type', label: 'Offer type', question: 'What type of offer do you sell?', fallback: 'offer_type' },
  { key: 'baseline_positioning', label: 'Positioning', question: 'How is your brand positioned in the market?', fallback: 'brand_positioning' },
  { key: 'baseline_visibility', label: 'Current visibility', question: 'Where is your business visible today? (search, social, referrals, media, events)', fallback: 'active_channels' },
  { key: 'baseline_credibility', label: 'Credibility', question: 'What proof makes buyers trust you? (reviews, results, credentials, case studies)' },
  { key: 'baseline_consistency', label: 'Consistency', question: 'How consistent is your marketing today, and what limits it?' },
  { key: 'baseline_growth_priority', label: 'Growth priority', question: 'What is your main growth priority for the next 90 days?', fallback: 'goal_90_days' },
  { key: 'baseline_competitive_advantage', label: 'Competitive advantage', question: 'What makes you the stronger choice against competitors?' },
];

/** Which baseline items are still unanswered. */
export function baselineStatus(record: Record<string, any> | null | undefined): {
  minimum_baseline_met: boolean;
  missing_baseline_fields: string[];
} {
  const intake = (record?.intake_data || {}) as Record<string, unknown>;
  const missing: string[] = [];
  for (const f of BASELINE_FIELDS) {
    const candidates = [record?.[f.key], intake[f.key], f.fallback ? intake[f.fallback] : null];
    const value = candidates.find((v) => typeof v === 'string' && v.trim());
    if (!value) missing.push(f.key);
  }
  return { minimum_baseline_met: missing.length === 0, missing_baseline_fields: missing };
}

/** Computed Matrix state — findings precedence first, intake gate last. */
export function computeMatrixState(input: {
  findings_loaded: boolean;
  client_intake_complete: boolean;
  minimum_baseline_met: boolean;
}): 'awaiting_intake' | 'baseline_gap' | 'ready_for_review' | 'results_available' {
  const { findings_loaded, client_intake_complete, minimum_baseline_met } = input;
  if (findings_loaded && minimum_baseline_met) return 'results_available';
  if (findings_loaded && !minimum_baseline_met) return 'baseline_gap';
  if (!findings_loaded && client_intake_complete && minimum_baseline_met) return 'results_available';
  if (!findings_loaded && client_intake_complete && !minimum_baseline_met) return 'baseline_gap';
  return 'awaiting_intake';
}

/** Full readiness snapshot for a Marketing Matrix record. */
export function matrixFlags(record: Record<string, any> | null | undefined) {
  const r = record || {};
  const scores = (r.matrix_scores || {}) as Record<string, { score?: number }>;
  const scored = [
    'channel_fit',
    'journey_coverage',
    'channel_integration',
    'execution_readiness',
    'customer_growth_readiness',
  ].some((k) => typeof scores[k]?.score === 'number');
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

/** Coverage lookup {stage: coverage} from the audit's journey rows. */
export function stageCoverageMap(rows: Array<{ stage?: string; coverage?: number }> = {}): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of rows || []) {
    if (r?.stage && typeof r.coverage === 'number') map[r.stage] = r.coverage;
  }
  return map;
}