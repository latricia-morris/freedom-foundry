import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MATRIX_PARENT_CATEGORIES, categoryAnchor } from '@/lib/matrixCategories';
import { CATEGORY_REVIEW_LENS } from '@/lib/matrixCategories';
import { DIRECTION_LABELS, EFFORT_LABELS, EVIDENCE_LABELS, STRATEGIC_ROLES } from '@/lib/matrix';
import CategoryIcon from './categoryIcons';

const roleLabel = (key) => (STRATEGIC_ROLES.find((r) => r.key === key) || {}).label || null;
const effortLabel = (v) => (v === 'unknown' ? 'Not established' : EFFORT_LABELS[v] || null);

/** One supporting element per card, in priority order — never a dummy chart. */
function supportingElement(channels) {
  for (const c of channels) {
    for (const r of c.results || []) {
      const raw = String(r.value ?? '').trim();
      if (raw && r.period) {
        const num = Number(raw);
        const value = `${Number.isFinite(num) ? num.toLocaleString('en-US') : raw}${r.unit ? ` ${r.unit}` : ''}`;
        return { text: `${value} · ${r.period}`, evidence: EVIDENCE_LABELS[r.evidence] || null };
      }
    }
  }
  for (const c of channels) {
    const cur = effortLabel((c.effort || {}).current);
    const rec = effortLabel((c.effort || {}).recommended);
    if (cur && rec && cur !== rec) return { text: `${cur} → ${rec} effort`, evidence: null };
  }
  const withFinding = channels.find((c) => (c.effort || {}).rationale);
  if (withFinding) {
    const first = withFinding.effort.rationale.split(/(?<=[.!?])\s/)[0] || '';
    if (first.length <= 140) return { text: first, evidence: null };
  }
  return null;
}

function Card({ category, channels }) {
  const anchor = categoryAnchor(category.key);
  const assessed = channels.length > 0;
  const headline = assessed
    ? roleLabel(channels[0].strategic_role) || 'Assessed in this cycle'
    : 'Not assessed in this cycle';
  const direction = assessed
    ? DIRECTION_LABELS[channels.map((c) => (c.effort || {}).direction).find(Boolean)]
    : null;
  const support = assessed ? supportingElement(channels) : null;

  return (
    <a
      href={`#${anchor}`}
      className="bh-card bh-card-hover group flex scroll-mt-[140px] flex-col p-6 lg:scroll-mt-[180px]"
      aria-label={`Explore the ${category.name} section`}
    >
      <div className="flex items-center gap-4">
        <CategoryIcon iconKey={category.key} muted={!assessed} />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">{category.num}</p>
          <h3 className="truncate font-heading text-xl font-light leading-tight text-foreground sm:text-2xl">
            {category.name}
          </h3>
        </div>
      </div>

      <p className="mt-4 text-[15px] font-light leading-snug text-foreground/90">{headline}</p>

      {direction && (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{direction}</p>
      )}

      <div className="mt-3 min-h-[2.5rem]">
        {support ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {support.text}
            {support.evidence ? ` · ${support.evidence}` : ''}
          </p>
        ) : !assessed ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{CATEGORY_REVIEW_LENS[category.key]}</p>
        ) : null}
      </div>

      <p className="link-warm mt-auto inline-flex items-center gap-1.5 pt-4">
        {assessed ? `Explore ${category.name}` : 'See what remains unknown'}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </p>
    </a>
  );
}

/**
 * The linked ten-category overview: a two-column card grid on desktop, one
 * column on mobile, fixed category order, every card linked to its section.
 */
export default function MatrixCategoryOverview({ groups }) {
  return (
    <section aria-label="Marketing category overview">
      <div className="grid gap-5 sm:grid-cols-2">
        {MATRIX_PARENT_CATEGORIES.map((category) => (
          <Card key={category.key} category={category} channels={(groups && groups[category.key]) || []} />
        ))}
      </div>
    </section>
  );
}