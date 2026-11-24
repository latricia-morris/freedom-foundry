import React from 'react';
import {
  deriveFindingSummary,
  findingStatusStyle,
  METHODOLOGY_BADGE_STYLES,
  METHODOLOGY_LABELS,
} from '@/lib/visibility';
import { cleanLine, stripSectionNumber } from '@/lib/reportText';
import ReportText from '@/components/report/ReportText';
import ReportTable from '@/components/report/ReportTable';
import ReportInline from '@/components/report/ReportInline';

/**
 * One diagnostic finding, fully open: gradient index number and large
 * title anchored by a status badge, one-sentence summary, supporting
 * detail, a copper-marked recommended action, and the source text and
 * tables laid out as a report beneath — nothing hidden, nothing raw.
 */
export default function AuditFindingCard({ section, index }) {
  const s = section;

  const title = cleanLine(stripSectionNumber(s.title));
  const summary = cleanLine(s.summary || '') || deriveFindingSummary(s.body);
  const detail = cleanLine(s.detail || '');
  const action = cleanLine(s.action || '');
  const status = (s.status || '').trim();
  const badgeLabel = status || METHODOLOGY_LABELS[s.methodology] || null;
  const badgeClass = status
    ? findingStatusStyle(status)
    : METHODOLOGY_BADGE_STYLES[s.methodology] || 'border-border text-muted-foreground';
  const body = (s.body || '').trim();
  const hasTable = !!(s.table && s.table.rows && s.table.rows.length);

  return (
    <article className="bh-card p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <span className="molten-text font-heading text-2xl font-light leading-none">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h4 className="font-heading text-xl font-light leading-tight text-foreground sm:text-2xl">{title}</h4>
        {badgeLabel && (
          <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
            {badgeLabel}
          </span>
        )}
      </div>

      {summary && (
        <p className="mt-3 max-w-3xl break-words text-base leading-relaxed text-foreground/90">
          <ReportInline text={summary} />
        </p>
      )}
      {detail && (
        <p className="mt-1.5 max-w-3xl break-words text-sm leading-relaxed text-muted-foreground/85">
          <ReportInline text={detail} />
        </p>
      )}

      {action && (
        <div className="mt-4 max-w-3xl border-l-2 border-primary/70 pl-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Recommended action</p>
          <p className="mt-1 break-words text-sm leading-relaxed text-foreground">
            <ReportInline text={action} />
          </p>
        </div>
      )}

      {(body || hasTable) && (
        <div className="mt-4 rounded-lg border border-border/50 bg-background/40 p-4">
          {METHODOLOGY_LABELS[s.methodology] && (
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              {METHODOLOGY_LABELS[s.methodology]} · from the source audit
            </p>
          )}
          {body && <ReportText text={body} />}
          {hasTable && <ReportTable className="mt-3" header={s.table.header || []} rows={s.table.rows} />}
        </div>
      )}
    </article>
  );
}