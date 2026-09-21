// Shared scoring model and helpers for the Visibility & Credibility report.
// Six categories, 100 points: five at 16 + Social Channel Presence at 20.
export const VISIBILITY_CATEGORIES = [
  { key: 'entity_recognition', label: 'Entity Recognition', short: 'Entity', max: 16 },
  { key: 'structured_data', label: 'Structured Data', short: 'Schema', max: 16 },
  { key: 'trusted_source_citations', label: 'Trusted Source Citations', short: 'Citations', max: 16 },
  { key: 'topical_authority', label: 'Topical Authority', short: 'Topical', max: 16 },
  { key: 'documented_outcomes', label: 'Documented Outcomes', short: 'Outcomes', max: 16 },
  { key: 'social_channel_presence', label: 'Social Channel Presence', short: 'Social', max: 20 },
];

// On-brand chart series: oxblood, ember orange, champagne gold, cloudbone gray.
export const SERIES_COLORS = ['#660000', '#d9622c', '#f0d9b5', '#8f9aa6'];

export function categoryRows(report) {
  const scores = report?.category_scores || {};
  return VISIBILITY_CATEGORIES.map((c) => {
    const raw = scores[c.key];
    const score = typeof raw === 'number' ? raw : null;
    return { ...c, score, pct: score === null ? null : Math.round((score / c.max) * 100) };
  });
}

export function sumScores(scores) {
  const values = VISIBILITY_CATEGORIES.map((c) => scores?.[c.key]).filter((v) => typeof v === 'number');
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0);
}

export function scoreLabel(score) {
  if (typeof score !== 'number') return 'Pending';
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Fair';
  return 'Developing';
}

/** Latest report per distinct source model, newest first. */
export function latestPerSource(reports) {
  const bySource = new Map();
  for (const r of reports || []) {
    const key = r.source_model || 'Unlabeled source';
    if (!bySource.has(key)) bySource.set(key, r);
  }
  return [...bySource.entries()].map(([source, report]) => ({ source, report }));
}

/** Categories where sources disagree by 4+ points. */
export function divergenceFlags(sourceSeries) {
  const flags = [];
  for (const c of VISIBILITY_CATEGORIES) {
    const values = sourceSeries
      .map((s) => s.report?.category_scores?.[c.key])
      .filter((v) => typeof v === 'number');
    if (values.length >= 2) {
      const spread = Math.max(...values) - Math.min(...values);
      if (spread >= 4) flags.push({ category: c.label, spread });
    }
  }
  return flags;
}

export function toLineText(arr) {
  return (arr || []).join('\n');
}

export function parseLines(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseCompetitors(text) {
  return parseLines(text).map((line) => {
    const [name, ...rest] = line.split(' — ');
    return { name: name.trim(), positioning: rest.join(' — ').trim() };
  });
}

export function competitorsToText(competitors) {
  return (competitors || [])
    .map((c) => [c.name, c.positioning].filter(Boolean).join(' — '))
    .join('\n');
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}