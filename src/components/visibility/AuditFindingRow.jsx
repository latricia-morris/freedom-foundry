import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
          <div key={i} className="rounded-sm border border-border/60 bg-background/40 px-3 py-2">
            <p className="text-sm font-medium text-foreground break-words">{row[0]}</p>
            {row.slice(1).map((cell, j) => (
              <p key={j} className="mt-0.5 text-xs text-muted-foreground break-words">
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
                  <td key={j} className="px-3 py-2 align-top text-muted-foreground break-words first:text-foreground">{cell}</td>
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
 * One structured diagnostic row: title as the anchor, immediate status
 * badge, one-sentence summary, subdued supporting detail, and a
 * copper-marked recommended action. The verbatim source text and its
 * lookup table stay one click away behind a disclosure, so the client
 * view stays scannable without losing the full audit.
 */
export default function AuditFindingRow({ section, index }) {
  const [open, setOpen] = useState(false);
  const s = section;

  const summary = (s.summary || '').trim() || deriveFindingSummary(s.body);
  const detail = (s.detail || '').trim();
  const action = (s.action || '').trim();
  const status = (s.status || '').trim();
  const badgeLabel = status || (METHODOLOGY_LABELS[s.methodology] || null);
  const badgeClass = status
    ? findingStatusStyle(status)
    : METHODOLOGY_BADGE_STYLES[s.methodology] || 'border-border text-muted-foreground';
  const hasSourceDetail =
    !!(s.body || '').trim() || !!(s.table && s.table.rows && s.table.rows.length);

  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60">{String(index + 1).padStart(2, '0')}</span>
        <h4 className="font-heading text-lg leading-tight text-foreground">{s.title}</h4>
        {badgeLabel && (
          <span className={`ml-auto rounded-sm border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
            {badgeLabel}
          </span>
        )}
      </div>

      {summary && <p className="mt-2 max-w-3xl break-words text-sm leading-relaxed text-foreground/90">{summary}</p>}
      {detail && <p className="mt-1 max-w-3xl break-words text-sm leading-relaxed text-muted-foreground/80">{detail}</p>}

      {action && (
        <p className="mt-3 flex max-w-3xl items-start gap-2 break-words text-sm text-foreground">
          <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} />
          <span>
            <span className="mr-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">Action</span>
            {action}
          </span>
        </p>
      )}

      {hasSourceDetail && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/70 transition-colors hover:text-primary"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          {open ? 'Hide full source detail' : 'Full source detail'}
        </button>
      )}

      {open && (
        <div className="mt-3 rounded-sm border border-border/50 bg-background/40 px-4 py-3">
          {METHODOLOGY_LABELS[s.methodology] && (
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              {METHODOLOGY_LABELS[s.methodology]} · from the source audit
            </p>
          )}
          {(s.body || '').trim() && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          )}
          {s.table && <SectionTable table={s.table} />}
        </div>
      )}
    </div>
  );
}