import React from 'react';
import AuditSections from '@/components/visibility/AuditSections';
import { cleanLine } from '@/lib/reportText';
import { formatDate, scoreLabel } from '@/lib/visibility';

/** One source report: its own findings, recommendations, and full breakdown. */
export default function SourceReportPanel({ source, report, isAdmin }) {
  const findings = (report.key_findings || []).map(cleanLine).filter(Boolean);
  const recommendations = (report.recommended_fixes || []).map(cleanLine).filter(Boolean);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl font-light text-foreground sm:text-3xl">{source}</h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          {formatDate(report.report_date)}
          {typeof report.composite_score === 'number'
            ? ` · ${report.composite_score}/100 · ${scoreLabel(report.composite_score)}`
            : ''}
        </p>
      </div>

      {findings.length > 0 && (
        <div className="mt-5">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            Key findings
          </h3>
          <ul className="mt-3 space-y-2.5">
            {findings.map((f, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span className="break-words">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 border-t border-border/50 pt-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Priority recommendations
        </h3>
        {recommendations.length > 0 ? (
          <ol className="mt-3 space-y-3">
            {recommendations.map((f, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border border-primary/40 text-[10px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="break-words">{f}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {isAdmin
              ? 'No recommendations recorded on this snapshot yet.'
              : 'The full action plan is released with your engagement.'}
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-border/50 pt-5">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
          Full breakdown
        </h3>
        <AuditSections report={report} includeAll={isAdmin} />
      </div>
    </>
  );
}