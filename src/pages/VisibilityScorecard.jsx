import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import HeroScore from '@/components/brandHealth/HeroScore';
import DashCard from '@/components/brandHealth/DashCard';
import AnchorNav from '@/components/brandHealth/AnchorNav';
import GradientActions from '@/components/brandHealth/GradientActions';
import KeyPoints from '@/components/brandHealth/KeyPoints';
import VisibilityComparisonChart from '@/components/visibility/VisibilityComparisonChart';
import VisibilityScoreBreakdown from '@/components/visibility/VisibilityScoreBreakdown';
import VisibilityBusinessSnapshot from '@/components/visibility/VisibilityBusinessSnapshot';
import VisibilityAllocation from '@/components/visibility/VisibilityAllocation';
import LockedActionPlan from '@/components/visibility/LockedActionPlan';
import AuditSections from '@/components/visibility/AuditSections';
import { clientSafeSections, formatDate, scoreLabel } from '@/lib/visibility';

const NAV = [
  { id: 'score-pattern', label: 'Score Pattern' },
  { id: 'findings', label: 'Findings' },
  { id: 'actions', label: 'Actions' },
  { id: 'snapshot', label: 'Snapshot' },
];

/**
 * Client-facing visibility dashboard: big gradient composite score hero,
 * then an interactive presentation — score pattern and definitions,
 * every audit finding rendered openly, priority recommendations elevated
 * in a forged-gradient container, and the business snapshot. In-page pill
 * navigation replaces any tab switching or hidden panels.
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
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Visibility &amp; <span className="molten-text italic">Credibility</span></h1>
        <p className="mt-3 text-sm">The report could not be loaded. Please try again in a moment.</p>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Visibility &amp; <span className="molten-text italic">Credibility</span></h1>
        <p className="mt-3 text-sm">
          Visibility reporting activates once your account is connected to a brand engagement. Your scorecard will appear here.
        </p>
      </div>
    );
  }

  const reports = data.reports || [];
  if (!reports.length) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Visibility &amp; <span className="molten-text italic">Credibility</span></h1>
        <p className="mt-3 text-sm">
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
  const findingsSections = clientSafeSections(latest);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-light text-foreground sm:text-5xl">
          Visibility &amp; <span className="molten-text italic">Credibility</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {data.client.company_name} · Snapshot from {formatDate(latest.report_date)}
        </p>
      </div>

      <HeroScore
        label="Composite Score"
        value={composite}
        pill={composite !== null ? scoreLabel(composite) : 'Scores being finalized'}
        subline="How discoverable and credible your brand appears to AI search engines &amp; the public right now."
      />

      <AnchorNav items={NAV} />

      <DashCard id="score-pattern">
        <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Score Pattern by Dimension</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground/60">
          One line per audit source · dashed line is the baseline
        </p>
        <div className="mt-5">
          <VisibilityComparisonChart reports={reports} />
        </div>
        <div className="my-8 border-t border-border/50" />
        <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">What the Scores Measure</h3>
        <div className="mt-5">
          <VisibilityScoreBreakdown reports={reports} />
        </div>
      </DashCard>

      {findingsSections.length > 0 && (
        <DashCard id="findings">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Audit Findings</h3>
          <p className="mt-1 text-sm text-muted-foreground">Every diagnostic from your audit, in full — nothing hidden.</p>
          {(latest.key_findings || []).filter(Boolean).length > 0 && (
            <div className="mt-5 rounded-lg border border-border/50 bg-background/40 p-4 sm:p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">At a glance</p>
              <KeyPoints points={latest.key_findings} max={4} />
            </div>
          )}
          <div className="mt-6">
            <AuditSections report={latest} />
          </div>
        </DashCard>
      )}

      {suggestions.length > 0 ? (
        <GradientActions
          id="actions"
          title="Priority Recommendations"
          subtitle="Where to focus next, in order of impact."
          items={suggestions}
        />
      ) : (
        <DashCard id="actions">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Recommendations</h3>
          <div className="mt-5">
            <LockedActionPlan label="Full action plan available with your engagement" />
          </div>
        </DashCard>
      )}

      {hasSnapshot && (
        <DashCard id="snapshot">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Business Snapshot</h3>
          <p className="mt-1 text-sm text-muted-foreground">A clear view of where your current visibility is concentrated.</p>
          <div className="mt-6">
            <VisibilityBusinessSnapshot report={latest} editable={isAdmin} onSaveChannels={handleSaveChannels} />
          </div>
          {allocation.length > 0 && (
            <>
              <div className="my-8 border-t border-border/50" />
              <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Suggested Marketing Emphasis</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Where emphasis earns the most visibility next, based on your score pattern.
              </p>
              <div className="mt-5">
                <VisibilityAllocation allocation={allocation} />
              </div>
            </>
          )}
        </DashCard>
      )}
    </div>
  );
}