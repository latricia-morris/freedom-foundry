import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MATRIX_PARENT_CATEGORIES, categoryAnchor, CATEGORY_REVIEW_LENS } from '@/lib/matrixCategories';
import { DIRECTION_LABELS, EFFORT_LABELS, EVIDENCE_LABELS } from '@/lib/matrix';
import CategoryIcon from './categoryIcons';

const effortLabel = (v) => (v === 'unknown' ? 'Not established' : EFFORT_LABELS[v] || null);

const firstSentence = (text) => (String(text || '').split(/(?<=[.!?])\s/)[0] || '').trim();

/** One supporting element per card, in priority order — labeled, never a bare count. */
function supportingElement(channels) {
  for (const c of channels) {
    for (const r of c.results || []) {
      const raw = String(r.value ?? '').trim();
      const label = String(r.label || '').trim();
      if (raw && label && r.period) {
        const num = Number(raw);
        const value = `${Number.isFinite(num) ? num.toLocaleString('en-US') : raw}${r.unit ? ` ${r.unit}` : ''}`;
        return `${label}: ${value} · ${r.period}`;
      }
    }
  }
  for (const c of channels) {
    const cur = effortLabel((c.effort || {}).current);
    const rec = effortLabel((c.effort || {}).recommended);
    if (cur && rec && cur !== rec) return `${cur} to ${rec} effort`;
  }
  return null;
}

function Card({ category, channels }) {
  const anchor = categoryAnchor(category.key);
  const assessed = channels.length > 0;
  const lead = channels[0];
  const allUnused = assessed && channels.every((c) => ((c.effort || {}).current || 'none') === 'none');
  const finding = assessed ? firstSentence((lead.effort || {}).rationale) : null;
  const headline = !assessed
    ? 'Not assessed'
    : finding || (allUnused ? 'Not currently in use' : 'Assessed in this cycle');
  const direction = assessed ? DIRECTION_LABELS[(lead.effort || {}).direction] : null;
  const support = assessed ? supportingElement(channels) : null;

  return (
    <a
      href={`#${anchor}`}
      className="bh-card bh-card-hover group relative flex scroll-mt-[140px] flex-col p-5 lg:scroll-mt-[180px]"
      aria-label={`${category.name} section`}
    >
      <ArrowUpRight
        className="hover-icon-warm absolute right-4 top-4 h-4 w-4 text-muted-foreground/50 transition-colors"
        aria-hidden="true"
      />
      <div className="flex items-center gap-3 pr-6">
        <CategoryIcon iconKey={category.key} size="sm" />
        <h3 className="truncate font-heading text-lg font-light leading-tight text-foreground sm:text-xl">
          {category.name}
        </h3>
      </div>

      <p className="mt-3 text-[15px] leading-snug text-foreground/90">{headline}</p>

      {direction && <p className="text-warm mt-2 text-xs font-medium">{direction}</p>}

      {support ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{support}</p>
      ) : !assessed ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Current activity and results have not been reviewed. {CATEGORY_REVIEW_LENS[category.key]}.
        </p>
      ) : null}
    </a>
  );
}

/**
 * The linked ten-category overview: compact black-glass cards, two columns on
 * desktop, one on mobile, fixed category order, every card fully clickable.
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