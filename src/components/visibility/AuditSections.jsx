import React from 'react';
import { clientSafeSections, METHODOLOGY_LABELS, METHODOLOGY_BADGE_STYLES } from '@/lib/visibility';

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
 * Full audit findings: every measurement section captured from the source
 * audit, in the source's order, with methodology badges. Client-safe
 * filtering happens in clientSafeSections — internal-only sections and
 * self-test to-dos stay hidden until recommendations are enabled.
 */
export default function AuditSections({ report }) {
  const sections = clientSafeSections(report);
  if (!sections.length) return null;

  return (
    <div className="space-y-4">
      {sections.map((s, i) => {
        const badge = METHODOLOGY_LABELS[s.methodology];
        return (
          <section key={s.title + '-' + i} className="rounded-sm border border-border/60 bg-background/40 px-4 py-4">
            <div className="mb-2 flex flex-wrap items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="font-heading text-lg text-foreground">{s.title}</h4>
              {badge && (
                <span className={`ml-auto rounded-sm border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${METHODOLOGY_BADGE_STYLES[s.methodology] || 'border-border text-muted-foreground'}`}>
                  {badge}
                </span>
              )}
            </div>
            {s.body && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{s.body}</p>}
            {s.table && <SectionTable table={s.table} />}
          </section>
        );
      })}
    </div>
  );
}