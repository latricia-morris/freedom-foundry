import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VisibilityRadarChart from '@/components/visibility/VisibilityRadarChart';
import VisibilityTrendChart from '@/components/visibility/VisibilityTrendChart';
import LockedActionPlan from '@/components/visibility/LockedActionPlan';
import { categoryRows, formatDate, scoreLabel } from '@/lib/visibility';

export default function VisibilityScorecard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    base44.functions
      .invoke('get-visibility-reports', {})
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, []);

  if (!data && !error) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-3xl font-light">Visibility &amp; <span className="molten-text italic">Credibility</span></h1>
        <p className="mt-2 text-sm">The report could not be loaded. Please try again in a moment.</p>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-3xl font-light">Visibility &amp; <span className="molten-text italic">Credibility</span></h1>
        <p className="mt-2 text-sm">
          Visibility reporting activates once your account is connected to a brand engagement. Your scorecard will appear here.
        </p>
      </div>
    );
  }

  const reports = data.reports || [];
  if (!reports.length) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-3xl font-light">Visibility &amp; <span className="molten-text italic">Credibility</span></h1>
        <p className="mt-2 text-sm">
          Your first visibility report is in progress. It will appear here as soon as it is published.
        </p>
      </div>
    );
  }

  const latest = reports[0];
  const rows = categoryRows(latest);
  const composite = typeof latest.composite_score === 'number' ? latest.composite_score : null;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-light text-foreground">
            Visibility &amp; <span className="molten-text italic">Credibility</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.client.company_name} · Snapshot from {formatDate(latest.report_date)}
          </p>
        </div>
        {composite !== null && (
          <span className="rounded-sm border border-primary/30 px-3 py-1 text-xs uppercase tracking-widest text-primary">
            {scoreLabel(composite)}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="dash-editorial-block flex flex-col items-center justify-center text-center">
          {composite !== null ? (
            <>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Composite Score</p>
              <p className="molten-text font-heading text-8xl font-light leading-none">
                {composite}
                <span className="text-2xl text-muted-foreground" style={{ WebkitTextFillColor: 'hsl(var(--muted-foreground))' }}>/100</span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                How discoverable and credible your brand appears to AI search engines right now.
              </p>
            </>
          ) : (
            <>
              <ShieldCheck className="mb-3 h-10 w-10 text-primary" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Scores are being finalized for this snapshot.</p>
            </>
          )}
        </div>
        <div className="dash-editorial-block">
          <h3 className="mb-2 font-heading text-xl">Category Scores</h3>
          <VisibilityRadarChart series={[{ name: 'Your brand', report: latest }]} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="dash-editorial-block">
          <h3 className="mb-4 font-heading text-xl">What We Found</h3>
          {rows.some((r) => r.score !== null) ? (
            <ul className="space-y-4">
              {rows.map((r) => (
                <li key={r.key}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm text-foreground">{r.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.score === null ? 'Not yet scored' : `${r.score} / ${r.max}`}
                    </span>
                  </div>
                  <div className="well-track h-2.5 w-full">
                    <div className="molten-bar h-full rounded-full transition-all" style={{ width: `${r.pct ?? 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Category breakdown coming with your next snapshot.</p>
          )}
        </div>
        <div className="space-y-6">
          <div className="dash-editorial-block">
            <h3 className="mb-4 font-heading text-xl">Key Findings</h3>
            <ul className="space-y-3">
              {(latest.key_findings || []).map((f, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
              {!(latest.key_findings || []).length && <li className="text-sm text-muted-foreground">Findings will appear with your next snapshot.</li>}
            </ul>
          </div>
          <LockedActionPlan />
        </div>
      </div>

      {reports.length >= 2 && (
        <div className="dash-editorial-block">
          <h3 className="mb-4 font-heading text-xl">Score History</h3>
          <VisibilityTrendChart reports={reports} />
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-sm border border-border/60 bg-background/40 px-4 py-2.5">
                <span className="text-sm text-foreground">{formatDate(r.report_date)}</span>
                <span className="text-sm font-semibold text-foreground">
                  {typeof r.composite_score === 'number' ? `${r.composite_score}/100` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}