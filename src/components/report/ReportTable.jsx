import React from 'react';
import ReportInline from './ReportInline';

/**
 * A table from an imported report: real columns on wide screens, stacked
 * label/value rows on phones so nothing scrolls sideways.
 */
export default function ReportTable({ header = [], rows = [], className = '' }) {
  if (!rows.length) return null;

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="space-y-2 sm:hidden">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
            <p className="break-words text-sm font-medium text-foreground">
              <ReportInline text={row[0]} />
            </p>
            {row.slice(1).map((cell, j) => (
              <p key={j} className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">
                {header[j + 1] && (
                  <span className="uppercase tracking-widest text-muted-foreground/60">{header[j + 1]}: </span>
                )}
                <ReportInline text={cell} />
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="hidden min-w-0 sm:block">
        <table className="w-full table-fixed text-left text-sm">
          {header.length > 0 && (
            <thead>
              <tr>
                {header.map((h, i) => (
                  <th
                    key={i}
                    className="border-b border-border/60 px-3 py-2 align-bottom text-[10px] uppercase tracking-widest text-muted-foreground/70 [overflow-wrap:anywhere]"
                  >
                    <ReportInline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/30 last:border-0">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-3 py-2 align-top leading-relaxed text-muted-foreground first:text-foreground [overflow-wrap:anywhere]"
                  >
                    <ReportInline text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}