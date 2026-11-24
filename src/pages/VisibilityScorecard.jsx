import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HeroScore from '@/components/brandHealth/HeroScore';
import DashCard from '@/components/brandHealth/DashCard';
import AnchorNav from '@/components/brandHealth/AnchorNav';
import VisibilityComparisonChart from '@/components/visibility/VisibilityComparisonChart';
import VisibilityScoreBreakdown from '@/components/visibility/VisibilityScoreBreakdown';
import VisibilityBusinessSnapshot from '@/components/visibility/VisibilityBusinessSnapshot';
import SourceDataPoints from '@/components/visibility/SourceDataPoints';
import ConsolidatedAssessment from '@/components/visibility/ConsolidatedAssessment';
import GradientActions from '@/components/brandHealth/GradientActions';
import { consolidatedReport, formatDate, isConsolidated, isValidScore, scoreLabel } from '@/lib/visibility';
import { usePortalBrand } from '@/hooks/usePortalBrand';

/**
 * Client-facing visibility dashboard: big gradient composite score hero,
 * the score pattern, every source's data points labeled and kept separate,
 * and the business snapshot. Narrative findings and recommendations live in
 * their own document so this scorecard stays readable.
 */
export default function VisibilityScorecard() {
  const { brand, preview } = usePortalBrand();
  const brandId = brand?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    base44.functions
      .invoke('get-visibility-reports', { client_id: brandId })
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, [brandId]);

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
  // While previewing a client's portal, show what the client sees.
  const isAdmin = !!data.is_admin && !preview;
  const compositeReport = reports.find((r) => isValidScore(r?.composite_score, 0, 100)) || null;

  // The snapshot card follows whichever report actually carries snapshot data,
  // so a consolidated assessment never blanks the channels another source listed.
  const snapshotReport =
    reports.find(
      (r) =>
        (r.social_channels || []).length > 0 ||
        Object.values(r.business_snapshot || {}).some(Boolean)
    ) || latest;
  const consolidated = consolidatedReport(reports);
  const findingsBase = '/brand-portal/brand-health/findings';
  // Priority recommendations come from the consolidation alone: it is the one
  // document that has weighed every source, so nothing here is blended.
  const priority = (consolidated?.recommended_fixes || []).filter(Boolean);

  const handleSaveChannels = async (channels) => {
    if (!snapshotReport?.id) return;
    await base44.entities.VisibilityReport.update(snapshotReport.id, { social_channels: channels });
    setData((prev) => ({
      ...prev,
      reports: prev.reports.map((r) =>
        r.id === snapshotReport.id ? { ...r, social_channels: channels } : r
      ),
    }));
  };

  const composite = compositeReport ? compositeReport.composite_score : null;
  const hasSnapshot =
    (snapshotReport.social_channels || []).length > 0 ||
    Object.values(snapshotReport.business_snapshot || {}).some(Boolean);

  // The consolidation compares the sources; it is never charted as one of them.
  const scoredReports = reports.filter((r) => !isConsolidated(r));

  // Only sections actually rendered get a nav pill, in the order they appear.
  const navItems = [
    { id: 'score-pattern', label: 'Score Pattern' },
    { id: 'sources', label: 'By Source' },
    ...(consolidated ? [{ id: 'consolidated', label: 'Consolidated' }] : []),
    { id: 'findings', label: 'Findings' },
    ...(hasSnapshot ? [{ id: 'snapshot', label: 'Snapshot' }] : []),
    ...(priority.length ? [{ id: 'priority', label: 'Recommendations' }] : []),
  ];

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
        pill={composite !== null ? scoreLabel(composite) : 'Evidence incomplete'}
        subline={composite !== null
          ? "How discoverable and credible your brand appears to AI search engines &amp; the public right now."
          : "Connect measurement sources to calculate a defensible score."}
      />

      <AnchorNav items={navItems} />

      <DashCard id="score-pattern">
        <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Score Pattern by Dimension</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground/60">
          One line per audit source · dashed line is the baseline
        </p>
        <div className="mt-5">
          <VisibilityComparisonChart reports={scoredReports} />
        </div>
        <div className="my-8 border-t border-border/50" />
        <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">What the Scores Measure</h3>
        <div className="mt-5">
          <VisibilityScoreBreakdown reports={scoredReports} />
        </div>
      </DashCard>

      <DashCard id="sources">
        <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Data Points by Source</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Each source's scores, labeled and kept separate. Nothing is blended into a single unattributed number.
        </p>
        <div className="mt-6">
          <SourceDataPoints reports={reports} findingsBase={findingsBase} />
        </div>
      </DashCard>

      {consolidated && (
        <DashCard id="consolidated">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">
            Consolidated <span className="molten-text italic">Assessment</span>
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The full Brand Health Index consolidation, kept whole: its scope, the evidence it rests on,
            every point it covers, and the priority plan it recommends.
          </p>
          <div className="mt-6">
            <ConsolidatedAssessment report={consolidated} />
          </div>
        </DashCard>
      )}

      <DashCard id="findings">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">
              Findings &amp; Recommendations
            </h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              The consolidated assessment leads that document, with every source report a click away.
            </p>
          </div>
          <Link
            to="/brand-portal/brand-health/findings"
            className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest"
          >
            Open findings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </DashCard>

      {hasSnapshot && (
        <DashCard id="snapshot">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Business Snapshot</h3>
          <p className="mt-1 text-sm text-muted-foreground">A clear view of where your current visibility is concentrated.</p>
          <div className="mt-6">
            <VisibilityBusinessSnapshot report={snapshotReport} editable={isAdmin} onSaveChannels={handleSaveChannels} />
          </div>
        </DashCard>
      )}

      {priority.length > 0 && (
        <GradientActions
          id="priority"
          title="Priority Recommendations"
          subtitle="Every gap the consolidated assessment found, turned into the next move."
          items={priority}
        />
      )}
    </div>
  );
}