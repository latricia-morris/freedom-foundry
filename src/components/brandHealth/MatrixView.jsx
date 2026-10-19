import React from 'react';
import { CREDIT_LANGUAGE, fmtDate, money } from '@/lib/brandHealth';
import { MATRIX_PARENT_CATEGORIES, categoryAnchor, groupChannelsByCategory, parentCategoryFor } from '@/lib/matrixCategories';
import MatrixStickyNav from '@/components/matrix/MatrixStickyNav';
import MatrixStrategicDirection from '@/components/matrix/MatrixStrategicDirection';
import MatrixCategoryOverview from '@/components/matrix/MatrixCategoryOverview';
import MatrixCategorySection from '@/components/matrix/MatrixCategorySection';
import MatrixPriorityMoves from '@/components/matrix/MatrixPriorityMoves';

const DEFAULT_EVIDENCE_NOTE =
  'Effort levels describe commitment, not effectiveness. Results marked Client-reported come directly from you; results marked Recorded are documented in an identified source; anything marked Not tracked has no usable measurement yet. Recommendations rest on the stated basis for each channel, and available capacity should be confirmed before committing.';

/**
 * Marketing Matrix client report: header, strategic direction, the linked
 * ten-category overview, one chapter per category, prioritized next moves,
 * and a collapsed methodology and evidence note. Presentation adapts to the
 * evidence available; sections without content are omitted.
 */
export default function MatrixView({ audit, matrixChannels = [], credit, clientName, showHeader = true }) {
  const { groups, unmapped } = groupChannelsByCategory(matrixChannels);
  const navItems = MATRIX_PARENT_CATEGORIES.map((c) => ({
    id: categoryAnchor(c.key),
    label: `${c.num} · ${c.name}`,
  }));

  const topAction = (audit.action_plan || [])[0] || null;
  const topChannel = topAction
    ? (matrixChannels || []).find((c) => c.channel_name === topAction.associated_channel)
    : null;
  const leadingKey = topChannel ? parentCategoryFor(topChannel).key : null;

  const assessmentDate = audit.results_generated_at || audit.created_date || audit.published_at;

  return (
    <div className="space-y-14">
      {showHeader && (
        <section id="mx-overview-top" className="scroll-mt-[140px] lg:scroll-mt-[180px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Marketing Matrix</p>
          <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">
            Where your marketing stands, and where it should go next.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {clientName ? `${clientName} · ` : ''}Assessment {fmtDate(assessmentDate)}
            {audit.reviewed_date ? ` · Reviewed ${fmtDate(audit.reviewed_date)}` : ''}
          </p>
        </section>
      )}

      <MatrixStrategicDirection audit={audit} />

      <section id="mx-overview" className="scroll-mt-[140px] space-y-5 lg:scroll-mt-[180px]">
        <div>
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Your marketing mix</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Where things stand across your marketing.</p>
        </div>
        <MatrixCategoryOverview groups={groups} />
      </section>

      <MatrixStickyNav items={navItems} />

      {MATRIX_PARENT_CATEGORIES.map((category) => (
        <MatrixCategorySection
          key={category.key}
          category={category}
          channels={groups[category.key] || []}
          emphasized={leadingKey === category.key}
          clientName={clientName}
        />
      ))}

      {unmapped.length ? (
        <section className="space-y-4">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Additional reviewed activity</h3>
          {unmapped.map((c) => (
            <MatrixCategorySection key={c.id || c.channel_name} category={{ key: 'other', num: '—', name: c.channel_name }} channels={[c]} />
          ))}
        </section>
      ) : null}

      <MatrixPriorityMoves actions={audit.action_plan} channels={matrixChannels} />

      <details className="bh-card group scroll-mt-[140px] p-6 sm:p-8 lg:scroll-mt-[180px]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="font-heading text-xl font-light text-foreground sm:text-2xl">Methodology and evidence</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground group-open:hidden">Show</span>
          <span className="hidden text-[10px] uppercase tracking-[0.16em] text-primary group-open:inline">Hide</span>
        </summary>
        <div className="mt-5 space-y-3 border-t border-border/60 pt-5 text-sm leading-relaxed text-muted-foreground">
          <p>{audit.evidence_note || DEFAULT_EVIDENCE_NOTE}</p>
          {credit ? (
            <p>
              Audit credit: {money(credit.amount_cents)}
              {credit.reviewed_date ? ` · reviewed ${fmtDate(credit.reviewed_date)}` : ''}
            </p>
          ) : null}
          <p>{CREDIT_LANGUAGE}</p>
        </div>
      </details>
    </div>
  );
}