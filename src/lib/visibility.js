// Shared scoring model and helpers for the Visibility & Credibility report.
// Each source's audit is stored verbatim: every dimension is scored out of 20,
// anything the source did not score stays null, and the composite is the
// source's own stated number.
export const VISIBILITY_CATEGORIES = [
  {
    key: 'entity_recognition',
    label: 'Entity Recognition',
    short: 'Entity',
    max: 20,
    definition: 'Whether AI engines correctly identify who you are, what you offer, and where you operate.',
  },
  {
    key: 'structured_data',
    label: 'Structured Data',
    short: 'Schema',
    max: 20,
    definition: 'Machine-readable signals on your website that let search engines trust and display your details.',
  },
  {
    key: 'trusted_source_citations',
    label: 'Trusted Source Citations',
    short: 'Citations',
    max: 20,
    definition: 'How often credible third-party sources reference and validate your brand.',
  },
  {
    key: 'topical_authority',
    label: 'Topical Authority',
    short: 'Topical',
    max: 20,
    definition: 'Depth of published coverage on your core subjects that positions you as a go-to voice.',
  },
  {
    key: 'documented_outcomes',
    label: 'Documented Outcomes',
    short: 'Outcomes',
    max: 20,
    definition: 'Public proof of results: case studies, testimonials, and measurable wins anyone can verify.',
  },
  {
    key: 'social_channel_presence',
    label: 'Social Channel Presence',
    short: 'Social',
    max: 20,
    definition: 'Active, consistent, findable social profiles that corroborate everything else the engines find.',
  },
  {
    key: 'off_site_category_authority',
    label: 'Off-Site Category Authority',
    short: 'Off-Site',
    max: 20,
    definition: 'Presence on the category-authoritative directories and platforms buyers use to vet and choose specialists.',
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

/**
 * Stable "Model N" display labels that replace provider names. Sources are
 * numbered by their earliest report date, so the numbering never shuffles.
 */
export function sourceModelLabels(reports) {
  const earliest = new Map();
  for (const r of reports || []) {
    const key = r.source_model || 'Unlabeled source';
    const t = r.report_date ? new Date(r.report_date).getTime() : Number.MAX_SAFE_INTEGER;
    if (!earliest.has(key) || t < earliest.get(key)) earliest.set(key, t);
  }
  const ordered = [...earliest.entries()].sort((a, b) => a[1] - b[1]).map(([key]) => key);
  const labels = {};
  ordered.forEach((key, i) => { labels[key] = `Model ${i + 1}`; });
  return labels;
}

/** Latest report per distinct source model, newest first, labeled "Model N". */
export function latestPerSource(reports) {
  const labels = sourceModelLabels(reports);
  const bySource = new Map();
  for (const r of reports || []) {
    const key = r.source_model || 'Unlabeled source';
    if (!bySource.has(key)) bySource.set(key, r);
  }
  return [...bySource.entries()].map(([source, report]) => ({ source: labels[source] || source, report }));
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
  const labels = sourceModelLabels(reports);
  const counts = {};
  for (const r of reports || []) {
    const base = r.source_model || 'Unlabeled source';
    counts[base] = (counts[base] || 0) + 1;
  }
  const seen = {};
  return (reports || []).map((r, i) => {
    const base = r.source_model || 'Unlabeled source';
    seen[base] = (seen[base] || 0) + 1;
    const modelLabel = labels[base] || base;
    const label = counts[base] > 1 ? `${modelLabel} · ${formatDate(r.report_date)}` : modelLabel;
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

// Audit section methodology labels — the source's own evidence grading.
export const METHODOLOGY_LABELS = {
  measured: 'Measured',
  observed: 'Observed',
  requires_self_test: 'Requires self-test',
  mixed: 'Mixed evidence',
  none: null,
};

export const METHODOLOGY_BADGE_STYLES = {
  measured: 'border-primary/40 text-primary',
  observed: 'border-border text-muted-foreground',
  requires_self_test: 'border-amber-500/50 text-amber-500',
  mixed: 'border-border text-muted-foreground',
};

export const METHODOLOGY_OPTIONS = [
  { value: 'measured', label: 'Measured' },
  { value: 'observed', label: 'Observed' },
  { value: 'requires_self_test', label: 'Requires self-test' },
  { value: 'mixed', label: 'Mixed evidence' },
  { value: 'none', label: 'Unlabeled' },
];

/** Sections the client is allowed to see: internal-only stays hidden, self-test to-dos wait for the recommendations toggle. */
export function clientSafeSections(report) {
  return (report?.audit_sections || [])
    .filter((s) => s.client_visible !== false || (s.release_with_recommendations && report.suggestions_client_visible))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}