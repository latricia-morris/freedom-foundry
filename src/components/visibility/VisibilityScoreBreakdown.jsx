import React from 'react';
import { isValidScore, SERIES_COLORS, VISIBILITY_CATEGORIES, reportSeries } from '@/lib/visibility';
import ProviderIcon from '@/components/brandHealth/ProviderIcon';

/**
 * Structured score breakdown: one stacked row per dimension with a short
 * plain-language definition and a thin bar per report line, so divergence
 * between sources reads at a glance.
 */
export default function VisibilityScoreBreakdown({ reports }) {
  const series = reportSeries(reports);
  return (
    <ul className="space-y-6">
      {VISIBILITY_CATEGORIES.map((c) => (
        <li key={c.key}>
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-foreground">{c.label}</span>
            <span className="text-xs text-muted-foreground/70">max {c.max}</span>
          </div>
          <p className="mb-2.5 text-xs leading-relaxed text-muted-foreground">{c.definition}</p>
          <div className="space-y-1.5">
            {series.map((s, i) => {
              const raw = s.report?.category_scores?.[c.key];
              const score = isValidScore(raw, 0, c.max) ? raw : null;
              const pct = score === null ? null : Math.round((score / c.max) * 100);
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="flex w-28 min-w-0 shrink-0 items-center gap-2 sm:w-36">
                    <ProviderIcon label={s.label} size="sm" />
                    <span className="min-w-0 break-words text-[10px] uppercase leading-tight tracking-wider text-muted-foreground/80">{s.label}</span>
                  </span>
                  {score === null ? (
                    <div className="h-2 flex-1" aria-hidden="true" />
                  ) : (
                    <div className="well-track h-2 min-w-0 flex-1">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                      />
                    </div>
                  )}
                  <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                    {score === null ? (
                      <span className="block break-words text-[10px] leading-tight text-muted-foreground/60">Not measured</span>
                    ) : `${score}/${c.max}`}
                  </span>
                </div>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}