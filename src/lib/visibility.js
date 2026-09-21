// Shared scoring model and helpers for the Visibility & Credibility report.
// Six categories, 100 points: five at 16 + Social Channel Presence at 20.
export const VISIBILITY_CATEGORIES = [
  {
    key: 'entity_recognition',
    label: 'Entity Recognition',
    short: 'Entity',
    max: 16,
    definition: 'Whether AI engines correctly identify who you are, what you offer, and where you operate.',
  },
  {
    key: 'structured_data',
    label: 'Structured Data',
    short: 'Schema',
    max: 16,
    definition: 'Machine-readable signals on your website that let search engines trust and display your details.',
  },
  {
    key: 'trusted_source_citations',
    label: 'Trusted Source Citations',
    short: 'Citations',
    max: 16,
    definition: 'How often credible third-party sources reference and validate your brand.',
  },
  {
    key: 'topical_authority',
    label: 'Topical Authority',
    short: 'Topical',
    max: 16,
    definition: 'Depth of published coverage on your core subjects that positions you as a go-to voice.',
  },
  {
    key: 'documented_outcomes',
    label: 'Documented Outcomes',
    short: 'Outcomes',
    max: 16,
    definition: 'Public proof of results: case studies, testimonials, and measurable wins anyone can verify.',
  },
  {
    key: 'social_channel_presence',
    label: 'Social Channel Presence',
    short: 'Social',
    max: 20,
    definition: 'Active, consistent, findable social profiles that corroborate everything else the engines find.',
  },
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

/**
 * One chartable line per report, labeled by source model. When the same
 * model produces multiple snapshots, the date disambiguates the line so
 * every loaded report charts as its own series.
 */
export function reportSeries(reports) {
  const counts = {};
  for (const r of reports || []) {
    const base = r.source_model || 'Unlabeled source';
    counts[base] = (counts[base] || 0) + 1;
  }
  const seen = {};
  return (reports || []).map((r, i) => {
    const base = r.source_model || 'Unlabeled source';
    seen[base] = (seen[base] || 0) + 1;
    const label = counts[base] > 1 ? `${base} · ${formatDate(r.report_date)}` : base;
    return { key: r.id || `report-${i}`, label, report: r, isBaseline: !!r.is_baseline };
  });
}

/** Parses "Platform — handle — url — followers — notes" lines into channel rows. */
export function parseSocialChannels(text) {
  return parseLines(text).map((line) => {
    const parts = line.split(' — ').map((p) => p.trim());
    return {
      platform: parts[0] || '',
      handle: parts[1] || '',
      url: parts[2] || '',
      followers: parts[3] || '',
      notes: parts[4] || '',
    };
  });
}

export function socialChannelsToText(channels) {
  return (channels || [])
    .map((c) => [c.platform, c.handle, c.url, c.followers, c.notes].filter(Boolean).join(' — '))
    .join('\n');
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}