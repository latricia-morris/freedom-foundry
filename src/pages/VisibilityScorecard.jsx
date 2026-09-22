import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VisibilityComparisonChart from '@/components/visibility/VisibilityComparisonChart';
import VisibilityScoreBreakdown from '@/components/visibility/VisibilityScoreBreakdown';
import VisibilityBusinessSnapshot from '@/components/visibility/VisibilityBusinessSnapshot';
import VisibilityAllocation from '@/components/visibility/VisibilityAllocation';
import LockedActionPlan from '@/components/visibility/LockedActionPlan';
import AuditSections from '@/components/visibility/AuditSections';
import { clientSafeSections, formatDate, scoreLabel } from '@/lib/visibility';

/**
 * Client-facing digital diagnostic: composite score on the left quarter,
 * model comparison chart on the right, structured score breakdown with
 * plain-language definitions, business snapshot, and strategic allocation.
 * Priority recommendations appear only when the agency explicitly enables
 * them on the report; otherwise a locked teaser shows.
 */
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
  const isAdmin = !!data.is_admin;

  const handleSaveChannels = async (channels) => {
    if (!latest?.id) return;
    await base44.entities.VisibilityReport.update(latest.id, { social_channels: channels });
    setData((prev) => ({
      ...prev,
      reports: prev.reports.map((r, i) => (i === 0 ? { ...r, social_channels: channels } : r)),
    }));
  };
  const composite = typeof latest.composite_score === 'number' ? latest.composite_score : null;
  const suggestions = latest.recommended_fixes || [];
  const hasSnapshot = (latest.social_channels || []).length > 0 || Object.values(latest.business_snapshot || {}).some(Boolean);
  const allocation = latest.marketing_allocation || [];

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

      <div className="grid gap-6 lg:grid-cols-[1fr_3fr]">
        <div className="dash-editorial-block min-w-0 flex flex-col items-center justify-center px-5 py-10 text-center">
          {composite !== null ? (
            <>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Composite Score</p>
              <p className="molten-text font-heading text-6xl font-light leading-none sm:text-8xl">
                {composite}
                <span className="text-2xl text-muted-foreground" style={{ WebkitTextFillColor: 'hsl(var(--muted-foreground))' }}>/100</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                How discoverable and credible your brand appears to AI search engines &amp; the public right now.
              </p>
            </>
          ) : (
            <>
              <ShieldCheck className="mb-3 h-10 w-10 text-primary" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Scores are being finalized for this snapshot.</p>
            </>
          )}
        </div>
        <div className="dash-editorial-block min-w-0">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-heading text-xl">Score Pattern by Dimension</h3>
            <span className="text-xs text-muted-foreground/70">One line per audit source · dashed line is the baseline</span>
          </div>
          <VisibilityComparisonChart reports={reports} />
        </div>
      </div>

      <div className="dash-editorial-block">
        <h3 className="mb-4 font-heading text-xl">What the Scores Measure</h3>
        <VisibilityScoreBreakdown reports={reports} />
      </div>

      {clientSafeSections(latest).length > 0 && (
        <div className="dash-editorial-block">
          <h3 className="mb-1 font-heading text-xl">Full Audit Findings</h3>
          <p className="mb-5 text-xs text-muted-foreground/70">Every measurement from this snapshot, in the source's own words and order.</p>
          <AuditSections report={latest} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="dash-editorial-block">
          <h3 className="mb-4 font-heading text-xl">Key Findings</h3>
          <ul className="space-y-3">
            {(latest.key_findings || []).map((f, i) => (
              <li key={i} className="flex min-w-0 gap-3 break-words text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
            {!(latest.key_findings || []).length && <li className="text-sm text-muted-foreground">Findings will appear with your next snapshot.</li>}
          </ul>
        </div>
        <div className="dash-editorial-block">
          {suggestions.length > 0 ? (
            <>
              <h3 className="mb-4 font-heading text-xl">Priority Recommendations</h3>
              <ol className="space-y-3">
                {suggestions.map((f, i) => (
                  <li key={i} className="flex min-w-0 gap-3 break-words text-sm text-muted-foreground">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border border-primary/40 text-[10px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    {f}
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <h3 className="mb-4 font-heading text-xl">Recommendations</h3>
              <LockedActionPlan label="Full action plan available with your engagement" />
            </>
          )}
        </div>
      </div>

      {hasSnapshot && (
        <div className="dash-editorial-block">
          <h3 className="mb-1 font-heading text-xl">Business Snapshot</h3>
          <p className="mb-5 text-xs text-muted-foreground/70">A clear view of where your current visibility is concentrated.</p>
          <VisibilityBusinessSnapshot report={latest} editable={isAdmin} onSaveChannels={handleSaveChannels} />
        </div>
      )}

      {allocation.length > 0 && (
        <div className="dash-editorial-block">
          <h3 className="mb-1 font-heading text-xl">Suggested Marketing Emphasis</h3>
          <p className="mb-5 text-xs text-muted-foreground/70">
            Where emphasis earns the most visibility next, based on your score pattern.
          </p>
          <VisibilityAllocation allocation={allocation} />
        </div>
      )}
    </div>
  );
}