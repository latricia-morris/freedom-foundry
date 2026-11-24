import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProviderIcon from '@/components/brandHealth/ProviderIcon';
import { categoryRows, formatDate, latestPerSource, scoreLabel } from '@/lib/visibility';

const CARD = 'rounded-lg border border-border/60 bg-background/40 p-4 sm:p-5';

/**
 * Every source's data points, labeled and kept separate: one block per audit
 * source with its own composite and category scores. Sources are never
 * averaged together, so a reader always knows which report a number came from.
 * With `findingsBase`, each block opens that source's own findings.
 */
export default function SourceDataPoints({ reports = [], findingsBase = null }) {
  const sources = latestPerSource(reports).filter(({ report }) => !!report);
  if (!sources.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sources.map(({ source, report }) => {
        const composite = typeof report.composite_score === 'number' ? report.composite_score : null;
        const href = findingsBase ? `${findingsBase}?source=${encodeURIComponent(source)}` : null;
        const content = (
          <>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <ProviderIcon label={report.source_model || ''} size="sm" />
                {source}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                {formatDate(report.report_date)}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="molten-text font-heading text-3xl font-light leading-none">
                {composite === null ? '—' : composite}
              </span>
              <span className="text-xs text-muted-foreground">
                {composite === null ? 'Not scored' : `/ 100 · ${scoreLabel(composite)}`}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {categoryRows(report).map((row) => (
                <div key={row.key}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-xs text-foreground/85">{row.label}</span>
                    <span className="text-[10px] tabular-nums text-muted-foreground/80">
                      {row.score === null ? 'Unscored' : `${row.score} / ${row.max}`}
                    </span>
                  </div>
                  <div className="well-track h-1.5 w-full">
                    <div className="molten-bar h-full rounded-full" style={{ width: `${row.pct ?? 0}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {href && (
              <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Open findings <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </>
        );

        if (!href) {
          return (
            <div key={report.id || source} className={CARD}>
              {content}
            </div>
          );
        }

        return (
          <Link
            key={report.id || source}
            to={href}
            className={`${CARD} block transition-colors hover:border-primary/45`}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}