import React from 'react';
import { deriveFindingSummary, findingStatusStyle, METHODOLOGY_BADGE_STYLES, METHODOLOGY_LABELS } from '@/lib/visibility';

function SectionTable({ table }) {
  const header = table.header || [];
  const rows = table.rows || [];
  if (!rows.length) return null;

  return (
    <>
      {/* Stacked rows on small screens — no horizontal scroll */}
      <div className="mt-3 space-y-2 sm:hidden">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
            <p className="break-words text-sm font-medium text-foreground">{row[0]}</p>
            {row.slice(1).map((cell, j) => (
              <p key={j} className="mt-0.5 break-words text-xs text-muted-foreground">
                {header[j + 1] && (
                  <span className="uppercase tracking-widest text-muted-foreground/60">{header[j + 1]}: </span>
                )}
                {cell}
              </p>
            ))}
          </div>
        ))}
      </div>
      {/* Real table on wider screens */}
      <div className="mt-3 hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          {header.length > 0 && (
            <thead>
              <tr>
                {header.map((h, i) => (
                  <th key={i} className="border-b border-border/60 px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/30 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="break-words px-3 py-2 align-top text-muted-foreground first:text-foreground">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/**
 * One diagnostic finding, fully open: gradient index number and large
 * title anchored by a status badge, one-sentence summary, supporting
 * detail, a copper-marked recommended action, and the verbatim source
 * text and table rendered openly beneath — nothing hidden behind a
 * disclosure.
 */
export default function AuditFindingCard({ section, index }) {
  const s = section;

  const summary = (s.summary || '').trim() || deriveFindingSummary(s.body);
  const detail = (s.detail || '').trim();
  const action = (s.action || '').trim();
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
        <h4 className="font-heading text-xl font-light leading-tight text-foreground sm:text-2xl">{s.title}</h4>
        {badgeLabel && (
          <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
            {badgeLabel}
          </span>
        )}
      </div>

      {summary && <p className="mt-3 max-w-3xl break-words text-base leading-relaxed text-foreground/90">{summary}</p>}
      {detail && <p className="mt-1.5 max-w-3xl break-words text-sm leading-relaxed text-muted-foreground/85">{detail}</p>}

      {action && (
        <div className="mt-4 max-w-3xl border-l-2 border-primary/70 pl-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Recommended action</p>
          <p className="mt-1 break-words text-sm leading-relaxed text-foreground">{action}</p>
        </div>
      )}

      {(body || hasTable) && (
        <div className="mt-4 rounded-lg border border-border/50 bg-background/40 p-4">
          {METHODOLOGY_LABELS[s.methodology] && (
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              {METHODOLOGY_LABELS[s.methodology]} · from the source audit
            </p>
          )}
          {body && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{body}</p>}
          {hasTable && <SectionTable table={s.table} />}
        </div>
      )}
    </article>
  );
}